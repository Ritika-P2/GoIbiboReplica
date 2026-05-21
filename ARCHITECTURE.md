# Goibibo MVP — Technical Architecture Document

**Project:** Goibibo Replica — Full-Stack Travel Booking Platform
**Prepared by:** Solution Architecture Review
**Date:** 2026-05-21
**Repository:** https://github.com/Ritika-P2/GoIbiboReplica.git

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Frontend Technology Stack](#2-frontend-technology-stack)
3. [Backend Technology Stack](#3-backend-technology-stack)
4. [Database & Data Architecture](#4-database--data-architecture)
5. [Security Implementation](#5-security-implementation)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [Content Approval Workflow](#7-content-approval-workflow)
8. [Background Jobs](#8-background-jobs)
9. [Performance & Scalability](#9-performance--scalability)
10. [DevOps & Release Management](#10-devops--release-management)
11. [Code Quality & Engineering Practices](#11-code-quality--engineering-practices)
12. [Risks, Limitations & Improvement Areas](#12-risks-limitations--improvement-areas)
13. [System Architecture Diagram](#13-system-architecture-diagram)
14. [Seed Data Reference](#14-seed-data-reference)

---

## 1. System Overview

The Goibibo MVP is a full-stack travel booking platform that replicates core capabilities of a modern OTA (Online Travel Agency). It supports six travel verticals — Flights, Hotels, Trains, Buses, Cabs, and Holiday Packages — with end-to-end flows from search through to booking confirmation.

### Project Structure

The system is structured as an **npm Workspaces monorepo** with two independent deployable applications:

```
GoIbibo/
├── package.json          ← root: npm workspaces + concurrently dev script
├── package-lock.json
├── frontend/             ← React 18 + Vite SPA
│   ├── package.json
│   └── src/
└── backend/              ← Node.js + Express REST API
    ├── package.json
    └── src/
```

> The root `package.json` is load-bearing — it orchestrates both apps via `concurrently`, handles dependency hoisting, and provides unified dev scripts. It is not a redundant duplicate.

### Technology Summary

| Layer | Technology | Port |
|---|---|---|
| Frontend SPA | React 18 + Vite | 5173 (dev) |
| Backend REST API | Node.js + Express | 5000 |
| Database | PostgreSQL + Prisma ORM | 5432 |

### Core Capabilities

- Public search across all travel types
- Authenticated booking flows with confirmation
- Role-based admin panel (ADMIN, MANAGER per module, USER)
- Content approval workflow: PENDING → APPROVED / REJECTED
- Schedule expiry filtering (server-side cutoff per travel type)
- Background jobs for booking expiry and price refresh

---

## 2. Frontend Technology Stack

### Framework & Build Tool

| Component | Choice | Notes |
|---|---|---|
| UI Framework | React 18 | Functional components + hooks only |
| Build Tool | Vite | Fast HMR; replaces Create React App |
| Routing | React Router v6 | Nested route layouts |
| Styling | Tailwind CSS | Utility-first; no UI component library |

### State Management — Redux Toolkit

| Slice | Responsibility |
|---|---|
| `authSlice` | User session, JWT token, login/logout, role, managerModule |
| `flightSlice` | Search params, results, filters |
| `hotelSlice` | Search params, results, room selection |
| `trainSlice` | Search params, results, class selection |
| `busSlice` | Search params, results |
| `bookingSlice` | Active booking flow (item → passengers → payment → confirmation) |

### Routing Architecture

```
AuthLayout
  ├── /login
  └── /register

MainLayout
  ├── Public pages (/, /flights, /hotels, /trains, /buses, /cabs, /holidays, ...)
  ├── ProtectedRoute
  │     └── /flight-booking, /hotel-booking, /train-booking, /bus-booking
  │         /holiday-booking, /my-bookings, /profile, /booking-confirmation
  └── AdminRoute
        └── AdminLayout
              ├── /admin                      (AdminDashboardPage)
              ├── ModuleRoute[FLIGHTS]  →     /admin/flights
              ├── ModuleRoute[HOTELS]   →     /admin/hotels
              ├── ModuleRoute[TRAINS]   →     /admin/trains
              ├── ModuleRoute[BUSES]    →     /admin/buses
              └── ModuleRoute[HOLIDAYS] →     /admin/holidays
```

**Route Guard Components:**

| Guard | File | Logic |
|---|---|---|
| `ProtectedRoute` | `src/routes/ProtectedRoute.jsx` | Redirects to `/login` if no JWT in store |
| `AdminRoute` | `src/routes/AdminRoute.jsx` | Allows only ADMIN or MANAGER roles |
| `ModuleRoute` | `src/routes/ModuleRoute.jsx` | ADMIN bypasses; MANAGER must match `managerModule` |

### API Layer

A shared Axios instance in `src/services/api.js`:

- Base URL sourced from `VITE_API_BASE_URL` environment variable
- **Request interceptor:** attaches `Authorization: Bearer <token>` from Redux store
- **Response interceptor:** unwraps `response.data` — callers receive the body directly

```
Response shape:   { success, message, data: {...}, meta: {...} }
Correct access:   res.data.flights   (not res.data.data.flights)
```

Domain service files (`flightService.js`, `hotelService.js`, etc.) consume this instance and export typed async functions used by components.

### Key Constants

| File | Purpose |
|---|---|
| `src/constants/routes.js` | All frontend route path strings |
| `src/constants/apiEndpoints.js` | All backend API endpoint paths |

> Never hard-code path strings in components — always import from these constants files.

---

## 3. Backend Technology Stack

### Framework

Express.js on Node.js — minimal, stateless, well-understood.

### Middleware Stack (Request Lifecycle)

```
Incoming Request
  ↓  express.json()              — body parsing
  ↓  cors()                      — CORS headers (CORS_ORIGIN env var)
  ↓  rateLimiter                 — IP-based request rate limiting
  ↓  requestLogger               — structured request logging
  ↓  [route match]
  ↓  authMiddleware              — JWT decode → req.user  (protected routes)
  ↓  adminMiddleware             — role check: ADMIN or MANAGER
  ↓  moduleMiddleware(MODULE)    — module-level check for managers
  ↓  validateRequest             — schema validation (validators/)
  ↓  controller                  — HTTP parsing, delegates to service
  ↓  service                     — business logic + Prisma queries
  ↓  apiResponse helper          — standardised response envelope
  ↓  errorHandler                — catches thrown errors, formats response
```

### Route Structure

| Path | Scope |
|---|---|
| `POST /api/v1/auth/register` | Public — user registration |
| `POST /api/v1/auth/login` | Public — returns JWT |
| `GET  /api/v1/flights` | Public search (approved, non-expired) |
| `POST /api/v1/flights` | Admin — create flight (FLIGHTS module) |
| `PUT  /api/v1/flights/:id` | Admin — update flight (FLIGHTS module) |
| `DELETE /api/v1/flights/:id` | Admin — delete flight (FLIGHTS module) |
| `GET/POST/PUT/DELETE /api/v1/hotels` | Same pattern — HOTELS module |
| `GET/POST/PUT/DELETE /api/v1/trains` | Same pattern — TRAINS module |
| `GET/POST/PUT/DELETE /api/v1/buses` | Same pattern — BUSES module |
| `GET/POST/PUT/DELETE /api/v1/holidays` | Same pattern — HOLIDAYS module |
| `/api/v1/bookings` | Authenticated — create, list, detail |
| `/api/v1/admin/approve/:type/:id` | ADMIN only — approve content |
| `/api/v1/admin/reject/:type/:id` | ADMIN only — reject content |

### Controller / Service Split

- **Controllers:** handle HTTP concerns only — parse `req`, call service, return response via `apiResponse`
- **Services:** contain all business logic and Prisma queries
- **Rule:** Prisma is never called directly from controllers

### Response Envelope

All responses use `src/utils/apiResponse.js`:

```json
// Success
{
  "success": true,
  "message": "Flights retrieved successfully",
  "data": { "flights": [ ... ] },
  "meta": { "total": 42, "page": 1, "limit": 20 }
}

// Error
{
  "success": false,
  "message": "Access denied. FLIGHTS module managers only.",
  "errors": []
}
```

---

## 4. Database & Data Architecture

### ORM

**Prisma** — schema-first ORM with type-safe client generation.

| File | Purpose |
|---|---|
| `backend/prisma/schema.prisma` | Canonical source of truth for all models |
| `backend/prisma/migrations/` | Migration history |
| `backend/prisma/seed.js` | Seed script for sample data |

**After any schema change:**
```bash
npx prisma migrate dev --name <description>   # creates + applies migration
npx prisma generate                            # regenerates Prisma client
```

> **Windows note:** The Prisma DLL (`query_engine-windows.dll.node`) is locked by a running Node process. Always stop the server before running `prisma generate` on Windows, otherwise you will get an `EPERM` error.

### Core Models

| Model | Key Fields |
|---|---|
| `User` | id, name, email, phone, password (bcrypt hash), role, managerModule? |
| `Flight` | id, flightNumber, airline, origin, destination, departureTime, arrivalTime, price, availableSeats, status |
| `Train` | id, trainNumber, trainName, origin, destination, departureTime, arrivalTime, duration, seats, classes (JSON), status |
| `Bus` | id, busNumber, operator, origin, destination, departureTime, arrivalTime, busType, price, seats, status |
| `Hotel` | id, name, description, city, address, starRating, amenities[], images[], status |
| `HotelRoom` | id, hotelId (FK), type, pricePerNight, capacity, totalRooms, amenities[], images[] |
| `HolidayPackage` | id, title, description, city, duration, price, originalPrice, images[], tags[], highlights[], isActive, status |
| `Booking` | id, userId (FK), type, referenceId, status, totalAmount, passengerDetails (JSON), paymentDetails (JSON) |
| `Review` | id, userId (FK), targetType, targetId, rating, comment |

### Enums

```prisma
enum Role           { USER  MANAGER  ADMIN }

enum ManagerModule  { FLIGHTS  HOTELS  TRAINS  BUSES  HOLIDAYS  CARS }

enum ContentStatus  { PENDING  APPROVED  REJECTED }

enum BookingStatus  { PENDING  CONFIRMED  CANCELLED  EXPIRED }
```

### Schedule Expiry Filtering

Implemented in `backend/src/utils/scheduleFilter.js`:

```
Logic:  lowerBound = max(startOfDay(searchDate),  now − offsetMinutes)

Flights:       offsetMinutes = 60   (hide if departed > 60 min ago)
Trains/Buses:  offsetMinutes = 5    (hide if departed > 5 min ago)

Future date:   startOfDay > cutoff  →  lowerBound = midnight  (no filter effect)
Today:         cutoff > startOfDay  →  lowerBound = rolling cutoff
```

---

## 5. Security Implementation

### Authentication

- JWT-based, stateless — no server-side session storage
- Token payload: `{ id, email, role, managerModule, iat, exp }`
- Signed with `JWT_SECRET`; expiry controlled by `JWT_EXPIRES_IN`
- `authMiddleware` verifies token on every protected request and attaches decoded payload to `req.user`

### Password Security

- Passwords stored as **bcrypt hashes** — never plaintext
- Login uses a two-query approach: first query for password comparison, second with explicit `select` for safe user data
- `managerModule` is explicitly included in the `select` to guarantee it appears in the JWT payload

### Current Security Gaps

| Gap | Risk | Recommended Fix |
|---|---|---|
| No JWT revocation | Medium | Implement refresh tokens + Redis blacklist |
| No CSRF protection | Low (JWT-in-header mitigates) | Add `SameSite` cookie policy if moving to cookie auth |
| No per-user rate limiting | Medium | Add user-ID–based rate limiter alongside IP limiter |
| No password complexity validation | Low | Add regex check on register endpoint |
| No audit log | Medium | Add `AuditLog` model tracking approve/reject with actor + timestamp |

---

## 6. Role-Based Access Control (RBAC)

### Role Hierarchy

```
ADMIN    →  Full access to all modules and approval actions
MANAGER  →  Admin panel access limited to their assigned managerModule
USER     →  Public search + own bookings only
```

### Three-Layer Enforcement

| Layer | Where | Mechanism |
|---|---|---|
| Database | Prisma schema | `role` and `managerModule` fields on User model |
| Backend | Express middleware | `authMiddleware` → `adminMiddleware` → `moduleMiddleware(MODULE)` |
| Frontend | React route guards | `AdminRoute` → `ModuleRoute` |

### moduleMiddleware (Backend)

```
ADMIN        →  next()  (bypass)
MANAGER + matching module  →  next()
MANAGER + wrong module     →  403 Access Denied
USER / unauthenticated     →  401 / 403
```

### ModuleRoute (Frontend)

```
ADMIN                       →  render children
MANAGER + managerModule match  →  render children
MANAGER + mismatch             →  redirect to /admin with { unauthorized: true, deniedModule }
```

The `/admin` dashboard surfaces an explicit "Access Denied" banner when redirected with `state.unauthorized`.

### Admin Sidebar Filtering

`AdminLayout` filters visible links by `user.managerModule`:

```
ADMIN    →  sees all: Dashboard, Flights, Hotels, Trains, Buses, Holidays
MANAGER  →  sees only: Dashboard + their assigned module
```

> Frontend guards are UX-only. The backend independently enforces access via `moduleMiddleware` — they are complementary, not redundant.

---

## 7. Content Approval Workflow

All inventory items (flights, trains, buses, hotels, holiday packages) follow this lifecycle:

```
MANAGER creates item
        ↓
  status: PENDING
        ↓
  ADMIN reviews
    ↙         ↘
APPROVED      REJECTED (with optional reason)
    ↓
Visible in public search
```

- **Search APIs** filter `status: 'APPROVED'` only — pending/rejected items never appear to end users
- **Admin APIs** return all statuses; filterable by tab: ALL / PENDING / APPROVED / REJECTED
- **Admin table actions:** separate columns for Edit, Delete, Approve (green ✓), Reject (red ✕)
- Approve/Reject buttons are only shown for PENDING items and only visible to ADMIN role users

---

## 8. Background Jobs

Scheduled via `cron` inside `backend/server.js`:

| Job | File | Purpose |
|---|---|---|
| Booking Cleanup | `src/jobs/bookingCleanup.js` | Expires unpaid PENDING bookings after timeout |
| Price Updater | `src/jobs/priceUpdater.js` | Refreshes cached/dynamic prices periodically |

> These jobs run in-process. For production reliability, migrate to a queue-based system (BullMQ + Redis) to handle failures, retries, and prevent blocking the event loop.

---

## 9. Performance & Scalability

### Current Optimizations

| Optimization | Where | Detail |
|---|---|---|
| Pagination | All list endpoints | `src/utils/pagination.js` normalizes `page`/`limit`; prevents unbounded queries |
| Schedule expiry | Search services | Server-side cutoff; expired records never returned |
| Status filtering | Search queries | `WHERE status = 'APPROVED'` on every search |
| Response unwrapping | Axios interceptor | Single interceptor reduces boilerplate across all service calls |

### Recommended Database Indexes

```sql
-- Flights
CREATE INDEX ON flights (origin, destination, departure_time, status);

-- Trains
CREATE INDEX ON trains (origin, destination, departure_time, status);

-- Buses
CREATE INDEX ON buses (origin, destination, departure_time, status);

-- Hotels
CREATE INDEX ON hotels (city, status);
```

### Scalability Bottlenecks

| Area | Issue | Mitigation |
|---|---|---|
| Search queries | Full table scans on large datasets | Add composite indexes (above) |
| Hotel search | No geo-proximity query | Add PostGIS or lat/lon bounding-box filter |
| Background jobs | In-process cron | Move to BullMQ + Redis worker |
| No caching layer | Every search hits PostgreSQL directly | Add Redis cache for frequently searched routes |
| Single DB instance | All reads hit primary | Add read replicas for search traffic |

> **Horizontal API scaling** is already viable — the JWT-based stateless design means multiple API instances can run behind a load balancer with no shared session state.

---

## 10. DevOps & Release Management

### Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable releases |
| `development` | Integration branch — all features merge here first |
| `feature/*` | Individual feature branches |

### Feature Branches Delivered

| Branch | Feature |
|---|---|
| `feature/filter-expired-schedules` | Server-side schedule expiry filtering for Flights, Trains, Buses |
| `feature/module-manager-role-management` | Full module-wise RBAC for manager users |

### Commands

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build
npm run lint

# Backend
cd backend
npm install
npm run dev          # http://localhost:5000
npm run lint
npm test

# Prisma
npx prisma generate
npx prisma migrate dev --name <description>
npx prisma migrate deploy
npx prisma studio
node prisma/seed.js
node prisma/seed_managers.js   # upsert module manager accounts
```

### Environment Variables

**Backend `.env`:**
```
DATABASE_URL=       # PostgreSQL connection string
JWT_SECRET=         # Token signing secret
JWT_EXPIRES_IN=     # e.g. 7d
PORT=5000
CORS_ORIGIN=        # e.g. http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_BASE_URL=  # e.g. http://localhost:5000/api/v1
```

### Recommended CI/CD (not yet configured)

```
On PR to development:
  → npm run lint (frontend + backend)
  → npm test (backend)

On merge to main:
  → Build frontend → deploy to S3 + CloudFront
  → Deploy backend → EC2 / ECS
  → Run: npx prisma migrate deploy
```

### Recommended Cloud Architecture

| Component | Recommendation |
|---|---|
| Frontend SPA | AWS S3 + CloudFront or Vercel |
| Backend API | AWS EC2 / ECS or Render |
| PostgreSQL | AWS RDS (PostgreSQL) or Supabase |
| Caching | Redis (ElastiCache) |
| Secrets | AWS Secrets Manager or Doppler |
| Background jobs | AWS EventBridge + Lambda (at scale) |

---

## 11. Code Quality & Engineering Practices

### Strengths

| Practice | Detail |
|---|---|
| Layer separation | Controllers handle HTTP only; services own all business logic; Prisma never called from controllers |
| Consistent response contract | `apiResponse` helper enforced everywhere — no raw `res.json()` in controllers |
| Route constants | Frontend never hard-codes path strings; all paths from `src/constants/routes.js` |
| Composable route guards | `ProtectedRoute`, `AdminRoute`, `ModuleRoute` are reusable wrappers, not copy-pasted logic |
| Pagination utility | Normalized once in `src/utils/pagination.js`, used by all list endpoints |
| Schedule filter utility | `getScheduleBounds()` centralizes cutoff logic — not duplicated across 3 services |

### Areas for Improvement

| Area | Issue | Recommendation |
|---|---|---|
| Test coverage | Jest configured but no test files written | Add integration tests for auth, booking, approval flows |
| Form validation | Client-side only on most admin forms | Backend validators should mirror frontend required fields |
| Error handling | Generic catch blocks lose actual error detail | Propagate `err.message` to error state in UI |
| Type safety | No TypeScript; Prisma types not leveraged | Add JSDoc or migrate to TypeScript |
| Admin page duplication | All 5 admin pages share ~80% identical structure | Extract shared `AdminEntityPage` component with configuration props |

---

## 12. Risks, Limitations & Improvement Areas

### Technical Risks

| Risk | Severity | Status | Mitigation |
|---|---|---|---|
| No JWT revocation | Medium | Open | Implement refresh tokens + Redis blacklist |
| Prisma DLL lock on Windows | Low | Known (dev only) | Stop server before `prisma generate` |
| In-process cron jobs | Medium | Open | Migrate to BullMQ + Redis |
| No test coverage | High | Open | Write integration tests for critical paths |
| No audit log | Medium | Open | Add `AuditLog` model for approve/reject history |

### Feature Gaps for Production

| Feature | Status | Notes |
|---|---|---|
| Payment gateway | Not implemented | Booking flow completes without real payment |
| Email notifications | Not implemented | No booking confirmation or status change emails |
| Live inventory data | Not integrated | All data is manually seeded; no GDS/API integration |
| Cabs module | Partial | Frontend page exists; no backend CRUD or booking flow |
| Cars admin module | Partial | `ManagerModule.CARS` enum exists; no admin page or routes |

---

## 13. System Architecture Diagram

```
+------------------+
|  Browser         |
|  React SPA       |
|  :5173 (dev)     |
+--------+---------+
         |
         |  HTTPS / REST JSON
         |
+--------v-----------------------------------------+
|              Express API  :5000                  |
|                                                  |
|  rateLimiter → authMiddleware → moduleMiddleware |
|                                                  |
|  +------------+  +----------+  +--------------+ |
|  | Controllers|  | Services |  | Prisma Client| |
|  +------------+  +----------+  +--------------+ |
|                                                  |
|  +------------------+  +---------------------+  |
|  | bookingCleanup   |  | priceUpdater        |  |
|  | (cron job)       |  | (cron job)          |  |
|  +------------------+  +---------------------+  |
+------------------------------+-------------------+
                               |
                               |  Prisma ORM
                               v
+------------------------------+-------------------+
|              PostgreSQL Database                  |
|                                                  |
|  users        flights       trains               |
|  buses        hotels        hotelRooms           |
|  holidayPackages  bookings  reviews              |
+---------------------------------------------------+
```

**Frontend Route Tree:**
```
AppRoutes
├── AuthLayout        → /login, /register
├── MainLayout
│   ├── Public        → /, /flights, /hotels, /trains, /buses, /cabs, /holidays, ...
│   ├── ProtectedRoute → /flight-booking, /hotel-booking, /my-bookings, /profile, ...
│   └── AdminRoute → AdminLayout
│         ├── /admin                          AdminDashboardPage
│         ├── ModuleRoute[FLIGHTS]  →  /admin/flights     AdminFlightsPage
│         ├── ModuleRoute[HOTELS]   →  /admin/hotels      AdminHotelsPage
│         ├── ModuleRoute[TRAINS]   →  /admin/trains      AdminTrainsPage
│         ├── ModuleRoute[BUSES]    →  /admin/buses       AdminBusesPage
│         └── ModuleRoute[HOLIDAYS] →  /admin/holidays    AdminHolidaysPage
└── * → NotFoundPage
```

---

## 14. Seed Data Reference

Run `node prisma/seed.js` to populate sample data for all travel types.
Run `node prisma/seed_managers.js` to upsert module manager accounts.

### Module Manager Accounts

| Name | Email | Module | Default Password |
|---|---|---|---|
| Flight Manager | flight_manager@goibibo.com | FLIGHTS | Password@123 |
| Hotel Manager | hotel_manager@goibibo.com | HOTELS | Password@123 |
| Train Manager | train_manager@goibibo.com | TRAINS | Password@123 |
| Bus Manager | bus_manager@goibibo.com | BUSES | Password@123 |
| Holiday Manager | holiday_manager@goibibo.com | HOLIDAYS | Password@123 |
| Car Manager | car_manager@goibibo.com | CARS | Password@123 |

### Admin Account

| Email | Role | Default Password |
|---|---|---|
| admin@goibibo.com | ADMIN | Password@123 |

> Change all default passwords before any non-local deployment.
