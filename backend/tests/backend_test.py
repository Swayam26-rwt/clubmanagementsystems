"""Backend tests for THE MOMENT CLUB."""
import os, uuid, pytest, requests

BASE = os.environ.get('REACT_APP_BACKEND_URL', 'https://cu-club-manager.preview.emergentagent.com').rstrip('/')
API = f'{BASE}/api'

ADMIN = {'email': 'core@themomentclub.in', 'password': 'admin123'}
SUFFIX = uuid.uuid4().hex[:8]
FACULTY = {'email': f'TEST_fac_{SUFFIX}@themomentclub.in', 'password': 'faculty123', 'name': 'Test Faculty', 'role': 'faculty'}
MEMBER = {'email': f'TEST_mem_{SUFFIX}@themomentclub.in', 'password': 'member123', 'name': 'Test Member', 'role': 'member'}


def _sess():
    s = requests.Session()
    s.headers.update({'Content-Type': 'application/json'})
    return s


@pytest.fixture(scope='module')
def admin_sess():
    s = _sess()
    r = s.post(f'{API}/auth/login', json=ADMIN)
    assert r.status_code == 200, r.text
    s.headers.update({'Authorization': f'Bearer {r.json()["access_token"]}'})
    return s


@pytest.fixture(scope='module')
def faculty_sess():
    s = _sess()
    r = s.post(f'{API}/auth/register', json=FACULTY)
    assert r.status_code == 200, r.text
    s.headers.update({'Authorization': f'Bearer {r.json()["access_token"]}'})
    return s


@pytest.fixture(scope='module')
def member_sess():
    s = _sess()
    r = s.post(f'{API}/auth/register', json=MEMBER)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data['user']['approved'] is False
    s.headers.update({'Authorization': f'Bearer {data["access_token"]}'})
    s.member_id = data['user']['user_id']
    return s


class TestAuth:
    def test_root(self):
        assert requests.get(f'{API}/').status_code == 200

    def test_login_admin(self, admin_sess):
        r = admin_sess.get(f'{API}/auth/me')
        assert r.status_code == 200
        assert r.json()['role'] == 'core_team'

    def test_invalid_login(self):
        r = requests.post(f'{API}/auth/login', json={'email': 'x@x.com', 'password': 'wrong'})
        assert r.status_code == 401

    def test_me_no_auth(self):
        assert requests.get(f'{API}/auth/me').status_code == 401

    def test_logout(self, admin_sess):
        assert admin_sess.post(f'{API}/auth/logout').status_code == 200

    def test_duplicate_register(self, faculty_sess):
        r = requests.post(f'{API}/auth/register', json=FACULTY)
        assert r.status_code == 400


class TestPublic:
    def test_events_public(self):
        r = requests.get(f'{API}/events')
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_notifications_public(self):
        r = requests.get(f'{API}/notifications')
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_announcements_public(self):
        assert requests.get(f'{API}/announcements').status_code == 200

    def test_stats(self):
        r = requests.get(f'{API}/stats')
        assert r.status_code == 200
        d = r.json()
        for k in ('events', 'members', 'hackathons'):
            assert k in d


class TestRBAC:
    def test_member_cannot_create_event(self, member_sess):
        r = member_sess.post(f'{API}/events', json={'title': 'x', 'description': 'x', 'date': '2026-05-01', 'location': 'x'})
        assert r.status_code == 403

    def test_member_cannot_list_pending(self, member_sess):
        assert member_sess.get(f'{API}/members/pending').status_code == 403

    def test_faculty_cannot_create_event(self, faculty_sess):
        r = faculty_sess.post(f'{API}/events', json={'title': 'x', 'description': 'x', 'date': '2026-05-01', 'location': 'x'})
        assert r.status_code == 403

    def test_unauthed_create_event(self):
        r = requests.post(f'{API}/events', json={'title': 'x', 'description': 'x', 'date': '2026-05-01', 'location': 'x'})
        assert r.status_code == 401


class TestCoreTeamFlows:
    def test_create_event_and_list(self, admin_sess):
        payload = {'title': f'TEST_EVT_{SUFFIX}', 'description': 'pytest', 'date': '2026-06-01', 'location': 'Lab', 'category': 'Hackathon', 'capacity': 50}
        r = admin_sess.post(f'{API}/events', json=payload)
        assert r.status_code == 200, r.text
        eid = r.json()['event_id']
        pytest.shared_event_id = eid
        # Verify listing
        evts = requests.get(f'{API}/events').json()
        assert any(e['event_id'] == eid for e in evts)

    def test_create_notification(self, admin_sess):
        r = admin_sess.post(f'{API}/notifications', json={'message': f'TEST_NOTIF_{SUFFIX}'})
        assert r.status_code == 200
        pytest.shared_notif_id = r.json()['notif_id']

    def test_create_announcement(self, admin_sess):
        r = admin_sess.post(f'{API}/announcements', json={'title': f'TEST_ANN_{SUFFIX}', 'body': 'body'})
        assert r.status_code == 200

    def test_pending_members(self, admin_sess):
        r = admin_sess.get(f'{API}/members/pending')
        assert r.status_code == 200
        assert isinstance(r.json(), list)


class TestEventRegistrationAndApproval:
    def test_member_registers_event(self, member_sess):
        eid = getattr(pytest, 'shared_event_id', None)
        assert eid
        r = member_sess.post(f'{API}/events/{eid}/register')
        assert r.status_code == 200, r.text
        # Duplicate
        r2 = member_sess.post(f'{API}/events/{eid}/register')
        assert r2.status_code == 400

    def test_my_registrations(self, member_sess):
        r = member_sess.get(f'{API}/me/registrations')
        assert r.status_code == 200 and len(r.json()) >= 1

    def test_approve_member(self, admin_sess, member_sess):
        r = admin_sess.post(f'{API}/members/{member_sess.member_id}/approve')
        assert r.status_code == 200


class TestProposalsAndCleanup:
    def test_faculty_cannot_create_proposal(self, faculty_sess):
        r = faculty_sess.post(f'{API}/proposals', json={'title': 'x', 'description': 'x'})
        assert r.status_code == 403

    def test_core_creates_proposal_faculty_approves(self, admin_sess, faculty_sess):
        r = admin_sess.post(f'{API}/proposals', json={'title': f'TEST_PROP_{SUFFIX}', 'description': 'desc'})
        assert r.status_code == 200
        pid = r.json()['proposal_id']
        r2 = faculty_sess.post(f'{API}/proposals/{pid}/approve')
        assert r2.status_code == 200 and r2.json()['status'] == 'approved'

    def test_cleanup_event_and_notif(self, admin_sess):
        eid = getattr(pytest, 'shared_event_id', None)
        nid = getattr(pytest, 'shared_notif_id', None)
        if eid:
            assert admin_sess.delete(f'{API}/events/{eid}').status_code == 200
        if nid:
            assert admin_sess.delete(f'{API}/notifications/{nid}').status_code == 200
