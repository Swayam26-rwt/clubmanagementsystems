from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import asyncio
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt as pyjwt
import httpx
import resend
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = 'HS256'

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

Role = Literal['core_team', 'faculty', 'member']
ROLES = {'core_team', 'faculty', 'member'}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('moment_club')

app = FastAPI(title='THE MOMENT CLUB')
api = APIRouter(prefix='/api')

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'sub': user_id,
        'email': email,
        'role': role,
        'type': 'access',
        'exp': datetime.now(timezone.utc) + timedelta(days=7),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key='access_token',
        value=token,
        httponly=True,
        secure=True,
        samesite='none',
        max_age=7 * 24 * 3600,
        path='/',
    )

def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie('access_token', path='/')

async def _decode_jwt(token: str) -> Optional[dict]:
    try:
        return pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except pyjwt.PyJWTError:
        return None

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get('access_token')
    if not token:
        auth = request.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail='Not authenticated')

    # Try JWT first
    payload = await _decode_jwt(token)
    if payload and payload.get('type') == 'access':
        user = await db.users.find_one({'user_id': payload['sub']}, {'_id': 0, 'password_hash': 0})
        if user:
            return user

    # Try Google session token
    sess = await db.sessions.find_one({'session_token': token}, {'_id': 0})
    if sess:
        exp = sess.get('expires_at')
        if isinstance(exp, str):
            exp = datetime.fromisoformat(exp)
        if exp and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp and exp > datetime.now(timezone.utc):
            user = await db.users.find_one({'user_id': sess['user_id']}, {'_id': 0, 'password_hash': 0})
            if user:
                return user
    raise HTTPException(status_code=401, detail='Invalid or expired session')

def require_roles(*allowed: str):
    async def _dep(user: dict = Depends(get_current_user)) -> dict:
        if user.get('role') not in allowed:
            raise HTTPException(status_code=403, detail='Forbidden: insufficient role')
        return user
    return _dep

async def send_email(to_emails: List[str], subject: str, html: str) -> None:
    if not RESEND_API_KEY or not to_emails:
        return
    params = {'from': SENDER_EMAIL, 'to': to_emails, 'subject': subject, 'html': html}
    try:
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logger.warning(f'Resend failed: {e}')

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    role: Role
    student_id: Optional[str] = None
    department: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class GoogleSessionIn(BaseModel):
    session_id: str

class EventIn(BaseModel):
    title: str
    description: str
    date: str  # ISO date
    location: str
    category: str = 'Hackathon'
    capacity: int = 100
    image_url: Optional[str] = None

class NotificationIn(BaseModel):
    message: str
    active: bool = True

class AnnouncementIn(BaseModel):
    title: str
    body: str

class ProposalIn(BaseModel):
    title: str
    description: str

# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@api.post('/auth/register')
async def register(data: RegisterIn, response: Response):
    email = data.email.lower()
    if data.role not in ROLES:
        raise HTTPException(status_code=400, detail='Invalid role')
    if await db.users.find_one({'email': email}):
        raise HTTPException(status_code=400, detail='Email already registered')
    user_id = f'user_{uuid.uuid4().hex[:12]}'
    approved = data.role != 'member'  # members need approval by core_team
    doc = {
        'user_id': user_id,
        'email': email,
        'password_hash': hash_password(data.password),
        'name': data.name,
        'role': data.role,
        'student_id': data.student_id,
        'department': data.department,
        'approved': approved,
        'picture': None,
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, data.role)
    set_auth_cookie(response, token)
    doc.pop('password_hash', None)
    doc.pop('_id', None)
    return {'user': doc, 'access_token': token}

@api.post('/auth/login')
async def login(data: LoginIn, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({'email': email})
    if not user or not user.get('password_hash') or not verify_password(data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    token = create_access_token(user['user_id'], email, user['role'])
    set_auth_cookie(response, token)
    user.pop('password_hash', None)
    user.pop('_id', None)
    return {'user': user, 'access_token': token}

@api.post('/auth/logout')
async def logout(response: Response):
    clear_auth_cookie(response)
    return {'ok': True}

@api.get('/auth/me')
async def me(user: dict = Depends(get_current_user)):
    return user

@api.post('/auth/google/session')
async def google_session(data: GoogleSessionIn, response: Response):
    async with httpx.AsyncClient() as hc:
        r = await hc.get(
            'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
            headers={'X-Session-ID': data.session_id},
            timeout=15,
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail='Google session invalid')
    info = r.json()
    email = info['email'].lower()
    name = info.get('name') or email.split('@')[0]
    picture = info.get('picture')
    session_token = info['session_token']

    existing = await db.users.find_one({'email': email})
    if existing:
        user_id = existing['user_id']
        await db.users.update_one({'user_id': user_id}, {'$set': {'name': name, 'picture': picture}})
        role = existing.get('role', 'member')
    else:
        user_id = f'user_{uuid.uuid4().hex[:12]}'
        await db.users.insert_one({
            'user_id': user_id,
            'email': email,
            'name': name,
            'role': 'member',
            'picture': picture,
            'approved': False,
            'created_at': datetime.now(timezone.utc).isoformat(),
        })
        role = 'member'

    await db.sessions.insert_one({
        'user_id': user_id,
        'session_token': session_token,
        'expires_at': (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
    })
    response.set_cookie(
        key='access_token', value=session_token, httponly=True, secure=True,
        samesite='none', max_age=7 * 24 * 3600, path='/',
    )
    user = await db.users.find_one({'user_id': user_id}, {'_id': 0, 'password_hash': 0})
    return {'user': user}

# ---------------------------------------------------------------------------
# Notifications (marquee bar)
# ---------------------------------------------------------------------------
@api.get('/notifications')
async def list_notifications():
    items = await db.notifications.find({'active': True}, {'_id': 0}).sort('created_at', -1).to_list(50)
    return items

@api.post('/notifications')
async def create_notification(data: NotificationIn, user: dict = Depends(require_roles('core_team'))):
    doc = {
        'notif_id': f'notif_{uuid.uuid4().hex[:10]}',
        'message': data.message,
        'active': data.active,
        'created_by': user['user_id'],
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    await db.notifications.insert_one(doc)
    doc.pop('_id', None)
    return doc

@api.delete('/notifications/{notif_id}')
async def delete_notification(notif_id: str, user: dict = Depends(require_roles('core_team'))):
    await db.notifications.delete_one({'notif_id': notif_id})
    return {'ok': True}

# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------
@api.get('/events')
async def list_events():
    items = await db.events.find({}, {'_id': 0}).sort('date', 1).to_list(200)
    return items

@api.post('/events')
async def create_event(data: EventIn, user: dict = Depends(require_roles('core_team'))):
    doc = {
        'event_id': f'evt_{uuid.uuid4().hex[:10]}',
        **data.model_dump(),
        'created_by': user['user_id'],
        'created_at': datetime.now(timezone.utc).isoformat(),
        'registered_count': 0,
    }
    await db.events.insert_one(doc)
    doc.pop('_id', None)

    # Notify approved members
    members = await db.users.find({'role': 'member', 'approved': True}, {'_id': 0, 'email': 1}).to_list(500)
    emails = [m['email'] for m in members]
    html = f"""
    <div style="font-family:Helvetica,Arial,sans-serif;color:#111;">
      <h2 style="letter-spacing:-0.02em;">NEW EVENT · {doc['title']}</h2>
      <p>{doc['description']}</p>
      <p><strong>Date:</strong> {doc['date']}<br/><strong>Location:</strong> {doc['location']}</p>
      <p>— THE MOMENT CLUB</p>
    </div>
    """
    asyncio.create_task(send_email(emails, f"[THE MOMENT CLUB] {doc['title']}", html))
    return doc

@api.delete('/events/{event_id}')
async def delete_event(event_id: str, user: dict = Depends(require_roles('core_team'))):
    await db.events.delete_one({'event_id': event_id})
    await db.event_registrations.delete_many({'event_id': event_id})
    return {'ok': True}

@api.post('/events/{event_id}/register')
async def register_event(event_id: str, user: dict = Depends(get_current_user)):
    evt = await db.events.find_one({'event_id': event_id}, {'_id': 0})
    if not evt:
        raise HTTPException(status_code=404, detail='Event not found')
    exists = await db.event_registrations.find_one({'event_id': event_id, 'user_id': user['user_id']})
    if exists:
        raise HTTPException(status_code=400, detail='Already registered')
    await db.event_registrations.insert_one({
        'event_id': event_id,
        'user_id': user['user_id'],
        'user_email': user['email'],
        'user_name': user['name'],
        'registered_at': datetime.now(timezone.utc).isoformat(),
    })
    await db.events.update_one({'event_id': event_id}, {'$inc': {'registered_count': 1}})
    return {'ok': True}

@api.get('/events/{event_id}/registrations')
async def event_registrations(event_id: str, user: dict = Depends(require_roles('core_team', 'faculty'))):
    items = await db.event_registrations.find({'event_id': event_id}, {'_id': 0}).to_list(500)
    return items

# ---------------------------------------------------------------------------
# Announcements
# ---------------------------------------------------------------------------
@api.get('/announcements')
async def list_announcements():
    items = await db.announcements.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return items

@api.post('/announcements')
async def create_announcement(data: AnnouncementIn, user: dict = Depends(require_roles('core_team', 'faculty'))):
    doc = {
        'ann_id': f'ann_{uuid.uuid4().hex[:10]}',
        'title': data.title,
        'body': data.body,
        'author_name': user['name'],
        'author_role': user['role'],
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    await db.announcements.insert_one(doc)
    doc.pop('_id', None)
    return doc

# ---------------------------------------------------------------------------
# Members / Approvals / Directory
# ---------------------------------------------------------------------------
@api.get('/members')
async def list_members(user: dict = Depends(require_roles('core_team', 'faculty'))):
    items = await db.users.find({'role': 'member'}, {'_id': 0, 'password_hash': 0}).to_list(500)
    return items

@api.get('/members/pending')
async def pending_members(user: dict = Depends(require_roles('core_team'))):
    items = await db.users.find({'role': 'member', 'approved': False}, {'_id': 0, 'password_hash': 0}).to_list(500)
    return items

@api.post('/members/{user_id}/approve')
async def approve_member(user_id: str, user: dict = Depends(require_roles('core_team'))):
    r = await db.users.update_one({'user_id': user_id, 'role': 'member'}, {'$set': {'approved': True}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail='Member not found')
    target = await db.users.find_one({'user_id': user_id}, {'_id': 0})
    if target:
        html = f"""<p>Hello {target['name']}, your membership to <strong>THE MOMENT CLUB</strong> has been approved. Welcome aboard.</p>"""
        asyncio.create_task(send_email([target['email']], '[THE MOMENT CLUB] Membership Approved', html))
    return {'ok': True}

@api.post('/members/{user_id}/reject')
async def reject_member(user_id: str, user: dict = Depends(require_roles('core_team'))):
    await db.users.delete_one({'user_id': user_id, 'role': 'member', 'approved': False})
    return {'ok': True}

# ---------------------------------------------------------------------------
# Proposals (Faculty approves)
# ---------------------------------------------------------------------------
@api.get('/proposals')
async def list_proposals(user: dict = Depends(require_roles('core_team', 'faculty'))):
    items = await db.proposals.find({}, {'_id': 0}).sort('created_at', -1).to_list(200)
    return items

@api.post('/proposals')
async def create_proposal(data: ProposalIn, user: dict = Depends(require_roles('core_team'))):
    doc = {
        'proposal_id': f'prop_{uuid.uuid4().hex[:10]}',
        'title': data.title,
        'description': data.description,
        'status': 'pending',
        'submitted_by': user['name'],
        'submitted_by_id': user['user_id'],
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    await db.proposals.insert_one(doc)
    doc.pop('_id', None)
    return doc

@api.post('/proposals/{proposal_id}/{decision}')
async def decide_proposal(proposal_id: str, decision: str, user: dict = Depends(require_roles('faculty'))):
    if decision not in ('approve', 'reject'):
        raise HTTPException(status_code=400, detail='Invalid decision')
    status = 'approved' if decision == 'approve' else 'rejected'
    r = await db.proposals.update_one(
        {'proposal_id': proposal_id},
        {'$set': {'status': status, 'decided_by': user['name'], 'decided_at': datetime.now(timezone.utc).isoformat()}},
    )
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail='Proposal not found')
    return {'ok': True, 'status': status}

# ---------------------------------------------------------------------------
# My registrations
# ---------------------------------------------------------------------------
@api.get('/me/registrations')
async def my_registrations(user: dict = Depends(get_current_user)):
    items = await db.event_registrations.find({'user_id': user['user_id']}, {'_id': 0}).to_list(200)
    return items

# ---------------------------------------------------------------------------
# Public stats
# ---------------------------------------------------------------------------
@api.get('/stats')
async def stats():
    return {
        'events': await db.events.count_documents({}),
        'members': await db.users.count_documents({'role': 'member', 'approved': True}),
        'hackathons': await db.events.count_documents({'category': 'Hackathon'}),
    }

@api.get('/')
async def root():
    return {'app': 'THE MOMENT CLUB', 'status': 'ok'}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ---------------------------------------------------------------------------
# Startup: indexes + seed
# ---------------------------------------------------------------------------
@app.on_event('startup')
async def startup():
    await db.users.create_index('email', unique=True)
    await db.users.create_index('user_id', unique=True)
    await db.sessions.create_index('session_token', unique=True)
    await db.events.create_index('event_id', unique=True)

    admin_email = os.environ.get('ADMIN_EMAIL', 'core@themomentclub.in').lower()
    admin_pw = os.environ.get('ADMIN_PASSWORD', 'admin123')
    existing = await db.users.find_one({'email': admin_email})
    if not existing:
        await db.users.insert_one({
            'user_id': f'user_{uuid.uuid4().hex[:12]}',
            'email': admin_email,
            'password_hash': hash_password(admin_pw),
            'name': 'Core Admin',
            'role': 'core_team',
            'approved': True,
            'created_at': datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f'Seeded admin: {admin_email}')
    elif not verify_password(admin_pw, existing.get('password_hash', '')):
        await db.users.update_one({'email': admin_email}, {'$set': {'password_hash': hash_password(admin_pw)}})

    # Seed sample notifications if empty
    if await db.notifications.count_documents({}) == 0:
        for msg in [
            'REGISTRATION OPEN · HACKNITE 2026 · 48 HOURS · CU MAIN AUDITORIUM',
            'WORKSHOP · SYSTEM DESIGN WITH STAFF ENGINEERS · FEB 28',
            'APPLY NOW · CORE TEAM INDUCTIONS · BATCH 2026',
        ]:
            await db.notifications.insert_one({
                'notif_id': f'notif_{uuid.uuid4().hex[:10]}',
                'message': msg,
                'active': True,
                'created_by': 'seed',
                'created_at': datetime.now(timezone.utc).isoformat(),
            })

    # Seed sample events if empty
    if await db.events.count_documents({}) == 0:
        samples = [
            {
                'event_id': f'evt_{uuid.uuid4().hex[:10]}',
                'title': 'HACKNITE 2026',
                'description': '48-hour flagship hackathon. Build products that matter. Prizes worth ₹3L.',
                'date': '2026-03-14',
                'location': 'CU Main Auditorium',
                'category': 'Hackathon',
                'capacity': 300,
                'image_url': 'https://static.prod-images.emergentagent.com/jobs/cb8b44b8-c919-4adb-aebd-9c5c55d5c593/images/2efaa331173c3cc6305b29b378693e2d5900c40169218ba127627f3ad5fa7e09.png',
                'registered_count': 0,
                'created_at': datetime.now(timezone.utc).isoformat(),
            },
            {
                'event_id': f'evt_{uuid.uuid4().hex[:10]}',
                'title': 'SYSTEM DESIGN WORKSHOP',
                'description': 'Deep dive with staff engineers from top product companies.',
                'date': '2026-02-28',
                'location': 'Block D · Room 204',
                'category': 'Workshop',
                'capacity': 80,
                'image_url': 'https://images.pexels.com/photos/5380607/pexels-photo-5380607.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
                'registered_count': 0,
                'created_at': datetime.now(timezone.utc).isoformat(),
            },
            {
                'event_id': f'evt_{uuid.uuid4().hex[:10]}',
                'title': 'TECH TALK · AI AT SCALE',
                'description': 'A guest lecture on production ML systems and vector infrastructure.',
                'date': '2026-03-05',
                'location': 'CU Auditorium 2',
                'category': 'Tech Talk',
                'capacity': 200,
                'image_url': 'https://images.unsplash.com/photo-1646059525996-3510c86159f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwYXJjaGl0ZWN0dXJlfGVufDB8fHxibGFja19hbmRfd2hpdGV8MTc3NjY3NTUzMnww&ixlib=rb-4.1.0&q=85',
                'registered_count': 0,
                'created_at': datetime.now(timezone.utc).isoformat(),
            },
        ]
        await db.events.insert_many(samples)

@app.on_event('shutdown')
async def shutdown():
    client.close()
