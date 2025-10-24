# MindTrack — Personal Wellness & Habit Tracker

A focused, privacy-first wellness and habit-tracking web app that helps users build consistent daily routines with simple check-ins, calendar streaks, reminders, motivational messaging, and optional social sharing.

This repository contains a modern React + Vite frontend and a separate full Node.js + Express backend (no serverless functions). The README below is both a developer guide and a product specification to move from MVP to production.

---

## Table of Contents

1. [Project summary](#project-summary)
2. [Contract & success criteria](#contract--success-criteria)
3. [Core features (MVP & beyond)](#core-features)
4. [Tech stack recommendations](#tech-stack-recommendations)
5. [Architecture overview](#architecture-overview)
6. [Data model](#data-model)
7. [API design (REST examples)](#api-design-rest-examples)
8. [Streaks & calendar algorithms](#streaks--calendar-algorithms)
9. [Developer setup (Windows PowerShell)](#developer-setup-windows-powershell)
10. [Testing & quality gates](#testing--quality-gates)
11. [Deployment & observability](#deployment--observability)
12. [Privacy & security](#privacy--security)
13. [AI suggestions (optional)](#ai-suggestions-optional)
14. [Social sharing & rewards](#social-sharing--rewards)
15. [UX notes & wireframes (text)](#ux-notes--wireframes-text)
16. [Roadmap & next steps](#roadmap--next-steps)
17. [Contribution guidelines](#contribution-guidelines)

---

## Project summary

MindTrack helps users track habits (water, reading, exercise), moods, and goals with a simple daily workflow:

- A compact dashboard for quick check-ins.
- A monthly calendar heatmap for streaks and patterns.
- Backend analytics that compute weekly averages and trend signals.
- Optional reminders and motivational messaging to drive consistency.

MVP focus: authentication, habit CRUD, daily check-ins, calendar view with streaks, and basic analytics.

## Contract & success criteria

- Inputs: authenticated user actions (create/edit habit, check-in with optional metadata, set reminders, optionally share progress).
- Outputs: JSON responses (REST) containing habits, check-ins, calendar data, and analytics. Notifications delivered via Web Push or email when enabled.
- Error modes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 429 (rate limit), 500 (server errors).
- Success criteria (MVP):
  - New user can register and create at least one habit.
  - User can record a check-in for today and see the calendar update.
  - Backend computes current and longest streaks correctly for common patterns.

## Core features

MVP
- User auth (email/password + JWT/session)
- Create/edit/delete habits with basic frequency and daily target
- Daily check-ins with optional quantity and note
- Dashboard showing today's habits and quick toggles
- Calendar heatmap with current & longest streaks
- Basic analytics: weekly average, completion rate

v1
- Reminders (web push & email), quiet hours
- Motivational messages and simple reward tiers
- Friends/invite and selective social sharing

v2
- Lightweight AI habit suggestions
- PWA offline support and sync
- Richer analytics and export

## Tech stack recommendations

- Frontend: Vite + React (TypeScript recommended), Tailwind CSS, React Router
- Backend: Node.js + Express (TypeScript) or serverless functions (Vercel/Netlify)
- DB: PostgreSQL (recommended) or MongoDB; Redis for caching & rate-limiting
- Auth: JWT + refresh tokens or secure cookie sessions; OAuth optional
- Notifications: Web Push (VAPID) + email provider (SendGrid/Postmark)
- Tests: Vitest/Jest + React Testing Library for frontend; Supertest for backend
- CI/CD: GitHub Actions (build, lint, tests), Vercel/Railway/Heroku for deploy

## Architecture overview

- Client (SPA): React app handles UI, local caching, subscriptions to push, and fetches API data.
- Backend API: Auth, Habit service, Checkin service, Analytics service, Reminder/Notification worker, optional AI microservice.
- Database: Stores users, habits, checkins, reminders, friendships; use materialized views/aggregates for heavy queries.
- Background workers: schedule reminders, pre-compute analytics snapshots, send notifications.

## Data model (relational-style examples)

- users
  - id (uuid)
  - email
  - password_hash
  - display_name
  - timezone
  - created_at, updated_at

- habits
  - id (uuid)
  - user_id (fk)
  - title
  - description
  - frequency (enum: daily, weekly, custom)
  - target (int) — optional (e.g., 8 glasses)
  - active (bool)
  - emoji/color
  - created_at, updated_at

- checkins
  - id (uuid)
  - habit_id
  - user_id
  - checked_at (timestamp UTC)
  - quantity (int)
  - note (text)

- reminders
  - id
  - user_id
  - habit_id (nullable)
  - channel (email, webpush)
  - time_of_day (HH:MM) or cron
  - timezone
  - active

- friendships
  - id
  - user_id
  - friend_user_id
  - visibility (private/friends/public)

Index suggestions: index checkins(user_id, checked_at), unique(user_id, habit_id, date) if treating one-per-day.

## API design (REST examples)

Base: /api/v1

Authentication
- POST /api/v1/auth/register
  - body: { email, password, displayName, timezone }
  - returns: { user, token }

- POST /api/v1/auth/login
  - body: { email, password }
  - returns: { token, user }

Habits
- GET /api/v1/habits
  - returns: [{ habit }]

- POST /api/v1/habits
  - body: { title, description, frequency, target }
  - returns: { habit }

- PATCH /api/v1/habits/:id
  - body: { ...fields }
  - returns: { habit }

- DELETE /api/v1/habits/:id
  - returns: 204

Check-ins
- POST /api/v1/habits/:id/checkins
  - body: { checkedAt?, quantity?, note? }
  - returns: { checkin }

- GET /api/v1/checkins?from=YYYY-MM-DD&to=YYYY-MM-DD
  - returns: [{ checkin }]

Analytics & Calendar
- GET /api/v1/analytics/calendar?year=2025&month=10
  - returns: { days: [{ date, completedCount, habitsCompleted }], streaks }

- GET /api/v1/analytics/habit/:id/trends?range=30d
  - returns: { weeklyAverage, currentStreak, longestStreak, last30Days }

Reminders/Notifications
- POST /api/v1/reminders
  - body: { habitId?, channel, time, timezone }

Social
- POST /api/v1/friends/invite
  - body: { emailOrUserId }

AI suggestions (optional)
- GET /api/v1/ai/suggestions
  - returns: [{ suggestion, reason }]

Authentication header: `Authorization: Bearer <token>`

## Streak & calendar algorithms (notes)

- Normalize timestamps to UTC when storing; compute calendar day buckets using the user's timezone.
- Current streak: count consecutive days (backwards from today) where completion criteria met.
- Completion rule: for most habits, at least one check-in per day counts as completion; for target-based habits, sum quantities and compare to target.
- Handle retroactive check-ins by recomputing impacted date buckets and analytics.

Edge cases
- Timezone misconfiguration: surface timezone in settings and allow user to correct.
- Multiple check-ins: aggregate per-day.
- Offline check-ins: queue locally and sync; resolve conflicts with last-write or merge rules.

## Developer setup (Windows PowerShell)

Prereqs: Node 18+, npm, (Postgres or MongoDB for backend), Git

Monorepo layout
```
/ (root)        # Frontend (Vite + React)
└─ backend/     # Backend (Node + Express)
```

PowerShell quick start
```
# PowerShell commands
git clone https://github.com/your-org/mindtrack.git
cd mindtrack
npm install

# Backend env
copy backend\.env.example backend\.env
# Edit backend/.env if you want to change PORT or CORS_ORIGIN

# Install backend deps (first time only)
cd backend
npm install
cd ..

# Start frontend + backend together
npm run dev:all

# Or run them separately
# Terminal 1
npm run dev:web
# Terminal 2
npm run dev:server
```

Environment variables (examples)
- DATABASE_URL=postgres://user:pass@localhost:5432/mindtrack
- JWT_SECRET=verysecret
- VAPID_PUBLIC_KEY=...
- VAPID_PRIVATE_KEY=...
- SENDGRID_API_KEY=... (optional)
- AI_API_KEY=... (optional)
 - VITE_BACKEND_URL=http://localhost:5000 (frontend) — base URL the frontend will use for API calls; override in `.env.local` or CI for different environments.

Seeds & migrations
- Use Prisma Migrate, Knex, or TypeORM migrations. Provide `npm run db:seed` for sample data.

## Testing & quality gates

- Unit: habit validation, streak calculation, reminder scheduling
- Integration: API auth and check-in->analytics flow
- Frontend: component unit tests + a small e2e (Vitest + Playwright optional)

Sample commands (PowerShell)
```
# Install and run tests
npm ci
npm test
npm run lint
```

CI gates
- Build passes for frontend and backend
- Lint passes
- Tests (unit + integration) pass with coverage threshold

## Deployment

- Frontend: Vercel or Netlify (static)
- Backend: Railway, Render, Docker on cloud (containerize the backend in `backend/`)
- Database: Supabase, Neon, or managed Postgres
- Workers: use cloud scheduler or a separate worker container (BullMQ + Redis)

Tips
- Keep secrets in environment variables or secret manager
- Use CI to run migrations on deploy or run them manually during release

## Observability

- Sentry for errors
- Metrics: request latency, error rate, background job success
- Health check endpoint: `/api/health` (root), `/api/v1/health` (once versioned routes are added)

## Privacy & security

- Default privacy: habits are private unless user opts in to sharing
- Passwords: hash with bcrypt/Argon2
- Tokens: short-lived JWTs + refresh tokens or secure cookies with SameSite/HttpOnly
- Rate-limit endpoints and protect against brute-force
- Provide data export and deletion endpoints for compliance

## AI suggestions (optional)

- Strategy: start with a simple rules engine based on historical metrics
- If using LLMs, send only aggregated, anonymized data with user consent
- Provide clear disclaimers and avoid medical advice

## Social sharing & rewards

- Allow users to share snapshots or public streak links
- Implement friend invites and a minimal feed showing public achievements
- Reward model: simple badges and streak unlocks; avoid addictive mechanics

## UX notes & wireframes (text)

- Pages: Dashboard, Calendar, Habit detail, Friends, Settings
- Dashboard: quick toggles and daily progress bar
- Calendar: month heatmap, click a day to see checkins
- Habit detail: history, analytics charts, edit

Microcopy
- Friendly, encouraging language; include undo for accidental actions.

## Roadmap

- MVP (2–4 weeks): auth, habit CRUD, daily checkins, calendar, basic analytics
- v1 (4–8 weeks): reminders, notifications, social sharing, rewards
- v2 (8–16 weeks): AI suggestions, PWA/offline, advanced analytics

## Contribution

- Branching: `feature/<desc>`; PRs require passing tests and a short description
- Linting: ESLint + Prettier; run pre-commit hooks with Husky

## Quick troubleshooting

- Streak seems wrong: verify your timezone in settings and that checkins are stored in UTC
- Reminders not firing: check worker logs and timezone on the reminder entry

## License

- Recommended: MIT for open-source projects

---

If you'd like, I can now:

1. Scaffold a minimal backend (Express + Prisma) with migrations for users/habits/checkins and a unit test for streak calculation, or
2. Create the frontend scaffold pages (Dashboard + Calendar) wired to mock API endpoints.

Tell me which one to scaffold next and I will update the todo list and create the files.
