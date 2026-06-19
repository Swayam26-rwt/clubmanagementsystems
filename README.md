# 🎯 THE MOMENT CLUB — Club Management System

<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Motor-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</div>

<br/>

A full-stack **Club Management System** for college organizations — built for **THE MOMENT CLUB** at Chandigarh University. Manage members, events, tasks, announcements, and proposals from a sleek unified dashboard.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [clubmanagementsystems.vercel.app](https://clubmanagementsystems.vercel.app) |
| **Backend API** | [club-backendclubmanagementsystems-1.onrender.com](https://club-backendclubmanagementsystems-1.onrender.com) |

> **Note:** The backend runs on Render free tier — first request after inactivity may take ~30 seconds to cold-start.

### 🔑 Test Credentials

All test accounts are **auto-seeded** on server startup. Use them to explore different roles:

| Role | Email | Password |
|------|-------|----------|
| **Core Team (Admin)** | `core.test@momentclub.in` | `testpass123` |
| **Faculty** | `faculty.test@momentclub.in` | `testpass123` |
| **Member** | `member.test@momentclub.in` | `testpass123` |

---

## ✨ Features

### 👤 Member Portal
- User registration & JWT-based authentication
- Browse upcoming & past events
- Register for events with confirmation
- Personal dashboard & activity feed

### 🛠️ Core Team (Admin)
- Approve / reject member applications
- Create & manage events (hackathons, workshops, conferences)
- Kanban-style task board (todo → in-progress → review → done)
- Submit proposals to faculty for approval
- Broadcast announcements
- Manage rolling notifications (marquee bar)

### 🎓 Faculty Dashboard
- Review & approve/reject proposals from core team
- View all members and events
- Post announcements

### 🔐 Security
- bcrypt password hashing
- JWT access tokens (7-day expiry) via httpOnly cookies
- Role-based route protection (`core_team`, `faculty`, `member`)
- Password reset flow with tokenized links

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, TailwindCSS 3, Radix UI, Framer Motion |
| Backend | Python 3.11+, FastAPI, Motor (async MongoDB driver) |
| Database | MongoDB (Atlas or local) |
| Auth | JWT (PyJWT) + bcrypt |
| Build | CRACO, Yarn |

---

## 📂 Project Structure

```
clubmanagementsystems/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities & API helpers
│   ├── public/
│   └── package.json
│
├── backend/                # FastAPI server
│   ├── server.py           # Main application (all routes)
│   ├── requirements.txt
│   └── .env.example        # Environment variable template
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js ≥ 18 & Yarn
- Python 3.11+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone the repository
```bash
git clone https://github.com/swayam-rawat/clubmanagementsystems.git
cd clubmanagementsystems
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and JWT secret

# Start the server
uvicorn server:app --reload --port 8001
```

The API will be available at `http://localhost:8001`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
yarn install

# Start dev server
yarn start
```

The app will be available at `http://localhost:3000`

---

## 🚀 Deployment

### Backend — Render (Free Tier)

1. Create a free account at [render.com](https://render.com)
2. Click **New → Web Service** and connect your GitHub repo
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `.env.example` in the Render dashboard
5. For MongoDB, use [MongoDB Atlas](https://cloud.mongodb.com) (free M0 tier)

### Frontend — Vercel (Free Tier)

1. Create a free account at [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn build`
   - **Output Directory:** `build`
4. Add environment variable:
   ```
   REACT_APP_BACKEND_URL=https://your-render-backend-url.onrender.com
   ```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new user |
| `POST` | `/api/auth/login` | — | Login & receive JWT cookie |
| `POST` | `/api/auth/logout` | ✓ | Logout |
| `GET` | `/api/auth/me` | ✓ | Get current user |
| `GET` | `/api/events` | — | List all events |
| `POST` | `/api/events` | core_team | Create event |
| `PATCH` | `/api/events/{id}` | core_team | Update event |
| `DELETE` | `/api/events/{id}` | core_team | Delete event |
| `POST` | `/api/events/{id}/register` | ✓ | Register for event |
| `GET` | `/api/members` | core_team/faculty | List all members |
| `GET` | `/api/members/pending` | core_team | Pending approvals |
| `POST` | `/api/members/{id}/approve` | core_team | Approve member |
| `GET` | `/api/tasks` | core_team/faculty | List tasks |
| `POST` | `/api/tasks` | core_team | Create task |
| `PATCH` | `/api/tasks/{id}` | core_team | Update task |
| `GET` | `/api/announcements` | — | List announcements |
| `POST` | `/api/announcements` | core_team/faculty | Post announcement |
| `GET` | `/api/proposals` | core_team/faculty | List proposals |
| `POST` | `/api/proposals` | core_team | Submit proposal |
| `GET` | `/api/stats` | — | Public club stats |

---

## 👨‍💻 Authors

Built with ❤️ by:
- **Swayam Rawat**


---

## 📄 License

MIT License — feel free to fork and adapt for your own club!

---

## ⭐ Acknowledgments

This project is part of academic learning and practical implementation of full-stack development concepts at Chandigarh University.
