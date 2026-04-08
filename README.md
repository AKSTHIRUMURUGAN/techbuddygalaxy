# 🚀 TechBuddySpace – Intelligent Internship Management System (Full Spec)

## 🧠 Overview

TechBuddySpace is an AI-powered internship and team management platform that combines:

* Task Management
* AI Evaluation
* Performance Tracking
* Attendance & HRMS
* Gamification & Leaderboard
* Merit-Based Role Promotion System

---

# 🏗️ Tech Stack

* Frontend: Next.js + Tailwind CSS
* Backend: Next.js API Routes
* Database: MongoDB
* Auth: JWT (Cookies)
* Storage:

  * Cloudinary → Images
  * Cloudflare R2 → Documents

---

# 👥 User Roles

* Admin
* Intern
* Team Lead (dynamic role)

---

# 🔐 Authentication

* JWT-based login system
* Secure cookies
* Role-based access control

---

# 📋 MODULE 1: TASK MANAGEMENT

## Features

* Admin creates tasks
* Assign tasks to interns
* Intern updates task status
* File upload (PDF/Image/Docs)
* Subtasks creation & assignment
* Notes per task

## Task Schema

```json
{
  "title": "string",
  "description": "string",
  "assignedTo": "userId",
  "createdBy": "adminId",
  "status": "Pending | In Progress | Completed | Overdue",
  "deadline": "date",
  "subtasks": [],
  "attachments": [],
  "progress": 0
}
```

---

# 🤖 MODULE 2: AI TASK ASSISTANT

## Features

* Suggest next steps
* Evaluate submissions
* Provide score & feedback

## APIs

### Suggest Steps

POST `/api/ai/suggest`

### Evaluate Submission

POST `/api/ai/evaluate`

## Output

```json
{
  "score": 8,
  "feedback": "Good work, improve validation"
}
```

---

# 📈 MODULE 3: PERFORMANCE SYSTEM

## Formula

Performance Score =
(Speed * 25%) +
(Quality * 40%) +
(Consistency * 15%) +
(Attendance * 20%)

## Schema

```json
{
  "userId": "id",
  "performanceScore": 85,
  "avgQuality": 8.5,
  "onTimeRate": 0.9,
  "attendanceRate": 0.95
}
```

---

# 🏆 MODULE 4: GAMIFICATION

## Features

* Badges
* Leaderboard
* Rewards

## Badge Examples

* Fast Finisher
* Consistent Performer
* Perfectionist

---

# 📊 MODULE 5: LEADERBOARD SYSTEM

## Ranking Logic

rankScore =
(performanceScore * 0.5) +
(tasksCompleted * 0.3) +
(consistency * 0.2)

## Types

* Global
* Department-wise
* Weekly

---

# 👑 MODULE 6: DYNAMIC POSITION SYSTEM

## Concept

* No seniority-based roles
* Positions earned by performance
* Final approval by admin

## Positions Examples

* Design Lead
* Video Editing Lead
* Developer Lead
* HR / Manager

## Position Schema

```json
{
  "title": "Design Lead",
  "department": "design",
  "minScore": 80,
  "requiredTasks": 10,
  "skills": ["poster", "branding"]
}
```

## Recommendation Schema

```json
{
  "userId": "id",
  "recommendedRole": "Design Lead",
  "reason": "High performance",
  "status": "Pending"
}
```

---

# 🧩 MODULE 7: TEAM COLLABORATION

## Features

* Subtask assignment
* Shared notes
* Internal communication

---

# 💬 MODULE 8: CHAT SYSTEM

## Features

* Intern ↔ Admin chat
* Intern ↔ Intern chat
* Real-time (optional)

## Schema

```json
{
  "senderId": "id",
  "receiverId": "id",
  "message": "text",
  "timestamp": "date"
}
```

---

# ⏱️ MODULE 9: ATTENDANCE SYSTEM

## Features

* Check-In / Check-Out
* Auto working hours
* Late / Absent detection

## Schema

```json
{
  "userId": "id",
  "date": "date",
  "checkIn": "time",
  "checkOut": "time",
  "totalHours": 8,
  "status": "Present | Late | Absent | Half Day"
}
```

---

# 🏖️ MODULE 10: LEAVE MANAGEMENT

## Features

* Apply leave
* Admin approval
* Leave tracking

## Schema

```json
{
  "userId": "id",
  "type": "Sick Leave",
  "fromDate": "date",
  "toDate": "date",
  "reason": "text",
  "status": "Pending | Approved | Rejected"
}
```

---

# 🏢 MODULE 11: OD (ON DUTY)

## Features

* Apply OD
* Upload proof
* Admin approval

## Schema

```json
{
  "userId": "id",
  "date": "date",
  "reason": "Client Meeting",
  "proof": "fileUrl",
  "status": "Pending | Approved | Rejected"
}
```

---

# 🔔 MODULE 12: NOTIFICATIONS

## Types

* Task assigned
* Deadline reminder
* Leave status
* Chat messages

## Schema

```json
{
  "userId": "id",
  "message": "text",
  "type": "task | alert | message",
  "read": false
}
```

---

# 📄 MODULE 13: REPORT GENERATOR

## Features

* Generate internship report PDF
* Include:

  * Tasks completed
  * Performance score
  * Feedback

## API

GET `/api/report/:userId`

---

# 🧠 AUTOMATIONS (CRON JOBS)

## Daily

* Mark absent users
* Send reminders

## Weekly

* Update leaderboard
* Recalculate performance

---

# 🔥 MVP ROADMAP

## Phase 1

* Auth system
* Task management
* File upload

## Phase 2

* AI evaluation
* Performance scoring

## Phase 3

* Leaderboard + badges

## Phase 4

* Attendance + Leave + OD

## Phase 5

* Reports + notifications

---

# 🎯 FINAL VISION

TechBuddySpace is not just an internship tool.

It is:

* A productivity platform
* A talent evaluation system
* A leadership discovery engine
* A SaaS product for startups & colleges

---

# 💡 USP

“We eliminate fake internships by introducing real work tracking, AI evaluation, and merit-based growth.”

---

# 🚀 END
