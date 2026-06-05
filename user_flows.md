# 📋 User Flows and Permissions

This document outlines the user flows, dashboards, and permission levels for the three primary roles in **The Moment Club** Management System: **Member**, **Faculty**, and **Core Team**.

---

## 🔑 Role & Permission Summary

| Feature | Member | Faculty | Core Team |
| :--- | :---: | :---: | :---: |
| **View Announcements & Marquee** | ✅ | ✅ | ✅ |
| **Register for Events** | ✅ | ❌ | ❌ |
| **Submit Event Proposals** | ❌ | ❌ | ✅ |
| **Approve / Reject Proposals** | ❌ | ✅ | ❌ |
| **Create/Update/Delete Events** | ❌ | ❌ | ✅ |
| **Manage Tasks (Kanban Board)** | ❌ | ❌ | ✅ |
| **View Member Directory** | ❌ | ✅ | ✅ |
| **Approve/Reject New Members** | ❌ | ❌ | ✅ |
| **Manage Ticker/Marquee Messages** | ❌ | ❌ | ✅ |

---

## 🗺️ High-Level User Flow Diagram

```mermaid
flowchart TD
    Start([User Visits Website]) --> Auth{Auth Status}
    
    Auth -- Not Logged In --> Landing[Public Landing Page]
    Landing --> Action{Action}
    Action -- Browse Events --> Events[View Public Events List]
    Action -- View Ticker --> Marquee[Marquee Notification Bar]
    Action -- Register/Login --> LoginScreen[Login/Registration Form]
    
    Auth -- Logged In --> RoleSplit{User Role}
    
    %% Member Flow
    RoleSplit -- Member --> MemberPending{Approved by Core?}
    MemberPending -- No --> PendingBanner[Show Pending Banner <br/> Limited View]
    MemberPending -- Yes --> MemberDash[Member Dashboard]
    MemberDash --> MemActions{Actions}
    MemActions --> ViewAnn[View Announcements]
    MemActions --> BrowseReg[Browse Events & Register]
    MemActions --> ViewReg[View My Event Registrations]

    %% Faculty Flow
    RoleSplit -- Faculty --> FacultyDash[Faculty Dashboard]
    FacultyDash --> FacActions{Actions}
    FacActions --> ReviewProp[Review Event Proposals <br/> Approve / Reject]
    FacActions --> ViewDirectory[View Active Members Directory]
    FacActions --> MonitorEvents[Monitor Event Registrations]
    FacActions --> History[View Decision History]

    %% Core Team Flow
    RoleSplit -- Core Team --> CoreDash[Core Team Dashboard]
    CoreDash --> CoreActions{Actions}
    CoreActions --> Tasks[Kanban Tasks <br/> Drag & Drop status, Assign, Create/Edit]
    CoreActions --> Team[Monitor Team Workloads]
    CoreActions --> ManageEvents[Manage Events <br/> Create, Edit, Delete]
    CoreActions --> MemberApprovals[Approve / Reject Pending Registrations]
    CoreActions --> Announce[Publish Announcements]
    CoreActions --> PubMarquee[Manage Landing Page Ticker]
```

---

## 👤 1. Member User Flow

The member flow is focused on participants who attend hackathons, workshops, and tech talks.

```mermaid
sequenceDiagram
    actor Member
    participant APP as Frontend (React)
    participant API as Backend (FastAPI)
    participant DB as MongoDB

    Member->>APP: Enters Register Form
    APP->>API: POST /auth/register
    API->>DB: Saves user (approved = False)
    API-->>APP: Success (Access Token)
    
    Note over APP,DB: Account is now in PENDING status
    
    APP->>Member: Display Dashboard + "Pending approval" Alert banner
    
    Note over Member,DB: Once Core Team approves the user...
    
    Member->>APP: Logs in next time
    APP->>API: GET /auth/me
    API-->>APP: Return User Info (approved = True)
    APP->>Member: Display Full Member Dashboard
    Member->>APP: Clicks "Register" on HACKNITE 2026
    APP->>API: POST /events/{event_id}/register
    API->>DB: Insert event_registration record
    API-->>APP: Success Response (Trigger local toast)
    APP->>Member: Update button to "Registered ✓"
```

### Key Activities for Members:
1. **Self-Registration & Status Check**: Register with name, email, department, student ID, and password. View a banner displaying whether the membership request has been approved or is still pending.
2. **Dashboard Overview**: Access a clean overview showing metrics for upcoming events, personal registrations, active announcements, and registration status.
3. **Register for Events**: Browse available club events (Hackathons, Workshops, Conferences) and register instantly. Registered events display a green `Registered` badge.
4. **Announcements Feed**: Read official club announcements published by Faculty or the Core Team.

---

## 🎓 2. Faculty User Flow

The faculty flow is designed for professors and department heads who oversee and sponsor club activities.

```mermaid
sequenceDiagram
    actor Faculty
    participant APP as Frontend (React)
    participant API as Backend (FastAPI)

    Faculty->>APP: Logs in (faculty.test@momentclub.in)
    APP->>API: GET /events & GET /proposals & GET /members
    API-->>APP: Return dashboard lists
    APP->>Faculty: Renders Faculty Dashboard
    Faculty->>APP: Clicks "Approve" on HACKNITE proposal
    APP->>API: POST /proposals/{proposal_id}/approve
    API-->>APP: Returns approved status
    APP->>Faculty: Move proposal to "Decision History" (Approved badge)
```

### Key Activities for Faculty:
1. **Overview Dashboard**: Access aggregated metrics: total active events, pending proposals, total approved club members, and decisions made.
2. **Approve / Reject Event Proposals**: Core team members submit proposals for events. Faculty can review titles, descriptions, and proposers, then approve or reject them directly.
3. **Monitor Event Registrations**: View a list of current events alongside the registration count for each.
4. **Member Directory**: Inspect the list of registered student members and check their status (Active or Pending).
5. **Decision History**: Track past proposal approvals/rejections with timestamps.

---

## ⚡ 3. Core Team User Flow

The core team flow represents full administrative capabilities to drive and manage all club operations.

```mermaid
sequenceDiagram
    actor Core
    participant APP as Frontend (React)
    participant API as Backend (FastAPI)
    participant DB as MongoDB

    Core->>APP: Logs in (core.test@momentclub.in)
    APP->>Faculty: Access all core views (Overview, Tasks, Events, Members, Announcements, Marquee)
    
    Note over Core,API: TASK MANAGEMENT (Kanban)
    Core->>APP: Drags task card from "To Do" to "In Progress"
    APP->>API: PATCH /tasks/{task_id} (status = 'in_progress')
    API->>DB: Update task document
    API-->>APP: Return updated task data

    Note over Core,API: MEMBER APPROVALS
    Core->>APP: Clicks "Approve" on a pending student
    APP->>API: POST /members/{user_id}/approve
    API->>DB: Set approved = True for user
    API-->>APP: Success response (triggers email notification)
```

### Key Activities for Core Team:
1. **Centralized Hub Overview**: Track open/done tasks, upcoming events, and pending member applications at a glance.
2. **ClickUp-Style Kanban Task Board**:
   - Organize workloads across four columns: `To Do`, `In Progress`, `Review`, and `Done`.
   - Update task status by dragging cards between columns.
   - Create, edit, and delete tasks. Assign tasks to core team members or faculty mentors, and set due dates and priorities (`Urgent`, `High`, `Medium`, `Low`).
3. **Team Workload Tracker**: Monitor team members' workload (view open vs. completed tasks for each core member).
4. **Event Management**: Create, edit, and delete events. Add cover images, set category tags, capacity limits, and prize pools. Once an event finishes, record winners and event photos.
5. **Member Approvals**: View all pending requests, approve students to make them active members, or reject and delete unapproved applications.
6. **Announcements Publisher**: Write and publish club announcements.
7. **Marquee / Ticker Editor**: Manage the dynamic notification ticker that scrolls across the public homepage header.
