# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Goibibo MVP — a full-stack travel booking platform supporting flights, hotels, trains, buses, cabs, and holiday packages. The project is split into two independent apps: `frontend/` (React + Vite) and `backend/` (Node.js + Express), communicating over REST APIs with JWT authentication and a PostgreSQL database managed via Prisma ORM.

---

## Commands

### Frontend (`frontend/`)

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server (http://localhost:5173)
npm run build        # production build to dist/
npm run preview      # preview production build
npm run lint         # ESLint check
```

### Backend (`backend/`)

```bash
npm install                        # install dependencies
npm run dev                        # start with nodemon (http://localhost:5000)
npm start                          # start without nodemon
npm run lint                       # ESLint check

# Prisma
npx prisma generate                # regenerate Prisma client after schema changes
npx prisma migrate dev --name <n>  # create and apply a new migration
npx prisma migrate deploy          # apply migrations in production
npx prisma studio                  # open Prisma Studio GUI
node prisma/seed.js                # seed the database

# Tests (Jest)
npm test                           # run all tests
npm test -- tests/unit/<file>      # run a single unit test file
npm test -- tests/integration/<f>  # run a single integration test file
```

---

## Architecture

### Frontend

**Entry:** `src/main.jsx` → wraps the app with Redux `<Provider>` and React Router `<BrowserRouter>`, then renders `<App>`.

**Routing:** `src/routes/AppRoutes.jsx` defines all routes. Public routes render inside `MainLayout`; auth pages (`/login`, `/register`) use `AuthLayout`. `ProtectedRoute` wraps any route that requires a valid JWT in the Redux store.

**State (Redux Toolkit):** `src/store/index.js` combines domain slices:
- `authSlice` — user session, JWT token, login/logout
- `flightSlice`, `hotelSlice`, `trainSlice`, `busSlice` — search results and filter state per travel type
- `bookingSlice` — active booking flow (selected item → passenger details → payment → confirmation)

**API layer:** `src/services/api.js` creates a shared Axios instance with the base URL and a request interceptor that attaches the JWT from the Redux store. Domain service files (`flightService.js`, `hotelService.js`, etc.) call this instance and expose typed functions consumed by components. API endpoint constants live in `src/constants/apiEndpoints.js`.

**Component pattern:** Pages in `src/pages/` compose domain-specific components from `src/components/<domain>/` and shared primitives from `src/components/common/`. Hooks in `src/hooks/` encapsulate repetitive logic (`useAuth`, `useSearch`, `useBooking`, `useDebounce`).

---

### Backend

**Entry:** `backend/server.js` — initialises Express, wires global middleware (CORS, rate limiter, request logger, JSON parser), mounts the route aggregator, and starts the HTTP server.

**Route aggregator:** `src/routes/index.js` mounts all domain routers under `/api/v1/<domain>` (e.g. `/api/v1/flights`, `/api/v1/bookings`).

**Request lifecycle:**
```
Request
  → rateLimiter (src/middleware/rateLimiter.js)
  → requestLogger (src/middleware/requestLogger.js)
  → authMiddleware (src/middleware/authMiddleware.js)  ← protected routes only
  → validateRequest (src/middleware/validateRequest.js) ← uses validators/
  → Controller (src/controllers/)
  → Service (src/services/)
  → Prisma ORM (prisma/schema.prisma)
  → apiResponse helper (src/utils/apiResponse.js)
  → errorHandler (src/middleware/errorHandler.js)      ← catches thrown errors
```

**Controller / Service split:** Controllers handle HTTP concerns (parse req, call service, return response via `apiResponse`). Services contain all business logic and Prisma queries. Never put Prisma calls directly in controllers.

**Auth flow:** `POST /api/v1/auth/register` and `/login` are handled by `authController` → `authService`. On success, `generateToken.js` signs a JWT using config from `src/config/jwt.js`. The `authMiddleware` verifies the token on subsequent requests and attaches `req.user`.

**Database:** Prisma schema at `backend/prisma/schema.prisma`. After any model change, run `npx prisma migrate dev` and `npx prisma generate`. The Prisma client is instantiated once in `src/config/database.js` and imported wherever needed.

**Background jobs:** `src/jobs/bookingCleanup.js` expires unpaid pending bookings; `src/jobs/priceUpdater.js` refreshes cached prices. Both are scheduled via cron inside `server.js`.

---

## Environment Variables

Copy `.env.example` → `.env` in both `frontend/` and `backend/` before starting.

**Backend key vars:**
```
DATABASE_URL        # PostgreSQL connection string (used by Prisma)
JWT_SECRET          # secret for signing tokens
JWT_EXPIRES_IN      # e.g. 7d
PORT                # default 5000
CORS_ORIGIN         # frontend origin, e.g. http://localhost:5173
```

**Frontend key vars:**
```
VITE_API_BASE_URL   # backend base URL, e.g. http://localhost:5000/api/v1
```

---

## Key Conventions

- All backend responses go through `src/utils/apiResponse.js` — use `successResponse` / `errorResponse` helpers, never `res.json()` directly.
- Validation schemas live in `src/validators/` and are invoked by the `validateRequest` middleware before the controller runs.
- Pagination parameters (`page`, `limit`) are normalised in `src/utils/pagination.js`; use it in any list endpoint.
- Frontend route path constants are defined in `src/constants/routes.js` — import from there, do not hard-code path strings in components.
