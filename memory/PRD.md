# PRD · THE MOMENT CLUB · Chandigarh University

## Original Problem Statement
Make a club management website that manages a club in Chandigarh University with a dynamic landing page (About Club, About Us, moving notification bar), role-based login and register for core team, faculty and members, each login/registration leading to a different page.

## User Choices
- Club: **THE MOMENT CLUB** — tech events & hackathons
- Theme: minimalistic, modern **black & white** (Swiss / Brutalist typography)
- Auth: Email/Password + **Emergent Google Social Login**
- Emails: **Resend**
- Roles: `core_team`, `faculty`, `member`

## Architecture
- **Backend:** FastAPI + MongoDB (motor), JWT in httpOnly cookies, bcrypt, Resend for email, Emergent OAuth session exchange.
- **Frontend:** React 19, React Router 7, Tailwind, shadcn/ui, react-fast-marquee, framer-motion.

## Personas
1. **Core Team** — runs the club. Creates events, manages marquee notifications, approves members, publishes announcements.
2. **Faculty** — approves proposals, views events, reviews member directory.
3. **Member** — browses events, registers for events, reads announcements. Needs core-team approval after signup.

## Implemented — 2026-02-20
- Landing page: hero, marquee notification bar, About Club, Events grid, Team, stats, CTA.
- Login + Register with role tabs, httpOnly JWT cookies, Google OAuth button (Emergent).
- Three role-gated dashboards with dedicated flows:
  - Core: CRUD events, CRUD marquee notifications, approve/reject members, publish announcements.
  - Faculty: Approve/Reject proposals, event list, member directory, decision history.
  - Member: Event list + register button, announcements, my registrations, pending-approval banner.
- Resend wired for event creation → notifies approved members.
- Seeded admin (`core@themomentclub.in` / `admin123`) + sample events and notifications.

## Implemented — 2026-02-24 (Iteration 2)
- Password-reset flow: `/forgot-password` + `/reset-password` pages, `POST /api/auth/forgot-password` (anti-enumeration) and `POST /api/auth/reset-password` with 1hr token expiry.
- Event registration confirmation email (Resend) to the registering member.
- Mobile hamburger nav on Landing (414px breakpoint overlay with About/Events/Team + Sign In/Join).
- 30/30 backend pytest passing.

## Backlog / Next Items
- **P1:** Replace `allow_origins=['*']` + `allow_credentials=True` with explicit origin list for prod hardening.
- **P1:** Brute-force lockout on `/api/auth/login` (5 attempts / 15 min).
- **P2:** Proposal submission form for Core Team (currently API-only).
- **P2:** Event registration email confirmations via Resend.
- **P2:** Password reset flow (forgot-password email).
- **P2:** Event gallery / past events archive.
- **P3:** Mobile hamburger nav on landing header.
