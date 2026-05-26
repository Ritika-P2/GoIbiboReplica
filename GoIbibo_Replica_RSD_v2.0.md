# GoIbibo Replica — Revised Scope & Requirements Document

**Document Version:** 2.0  
**Date:** May 2026  
**Status:** Current — reflects the implemented system  
**Supersedes:** GoTripz_SRS_v1.0.docx  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Project Overview](#2-project-overview)
3. [Objectives](#3-objectives)
4. [Scope](#4-scope)
5. [System Architecture](#5-system-architecture)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Authentication & Session Management](#7-authentication--session-management)
8. [Modules & Functional Requirements](#8-modules--functional-requirements)
   - 8.1 Flights
   - 8.2 Hotels
   - 8.3 Trains
   - 8.4 Buses
   - 8.5 Holiday Packages
   - 8.6 Cabs
9. [Booking Workflows](#9-booking-workflows)
10. [Payment Workflows](#10-payment-workflows)
11. [My Bookings Module](#11-my-bookings-module)
12. [Admin & Content Management](#12-admin--content-management)
13. [Content Approval Workflow](#13-content-approval-workflow)
14. [Background Jobs & Automation](#14-background-jobs--automation)
15. [Business Rules](#15-business-rules)
16. [Database Design](#16-database-design)
17. [API Design](#17-api-design)
18. [Frontend Architecture](#18-frontend-architecture)
19. [Security Implementation](#19-security-implementation)
20. [Performance & Scalability](#20-performance--scalability)
21. [Limitations & Assumptions](#21-limitations--assumptions)
22. [Future Enhancements](#22-future-enhancements)
23. [Appendix — Outdated Sections Removed from v1.0](#23-appendix--outdated-sections-removed-from-v10)

---

## 1. Introduction

This document is the authoritative Scope and Requirements Specification for the **GoIbibo Replica** full-stack travel booking platform. It supersedes the previous GoTripz SRS v1.0, which contained planned-but-unimplemented features and lacked coverage of several major workflows that have since been built.

This document is based on a complete analysis of:
- The live frontend (React 18 + Vite)
- The live backend (Node.js + Express + Prisma ORM)
- The PostgreSQL database schema and applied migrations
- All implemented API routes, controllers, and service logic
- Booking, payment, and admin workflows as currently coded

Every section distinguishes clearly between **fully implemented**, **partially implemented**, and **future scope** items.

---

## 2. Project Overview

The GoIbibo Replica is a full-stack multi-modal travel booking platform that allows users to search, compare, and book flights, hotels, trains, buses, and holiday packages. It includes a role-based admin panel for inventory and content management, an approval workflow for published content, and a complete booking and payment lifecycle including pending payment handling.

| Attribute | Details |
|-----------|---------|
| Project Name | GoIbibo Replica |
| Frontend URL | http://localhost:5173 |
| Backend URL | http://localhost:5000 |
| API Base Path | `/api/v1` |
| Database | PostgreSQL 18 |
| ORM | Prisma |
| Authentication | JWT (Bearer token) |
| Repository | github.com/Ritika-P2/GoIbiboReplica |
| Default Branch | `development` |

---

## 3. Objectives

1. Provide a realistic clone of the GoIbibo travel booking platform for learning and portfolio purposes.
2. Demonstrate full-stack architecture: REST APIs, relational database design, JWT auth, RBAC, and a React SPA.
3. Implement real booking business logic: seat holding, payment confirmation, cancellation, and expiry.
4. Provide a multi-role admin system with inventory management and a content approval workflow.
5. Support all major travel booking types: flights (one-way, round-trip, multi-city), hotels, trains, buses, and holidays.

---

## 4. Scope

### 4.1 In Scope (Implemented)

| Area | Status |
|------|--------|
| User registration, login, JWT auth | ✅ Fully implemented |
| Role-based access control (USER / MANAGER / ADMIN) | ✅ Fully implemented |
| Module-level manager access (6 modules) | ✅ Fully implemented |
| Flight search, one-way booking, round-trip booking | ✅ Fully implemented |
| Multi-city flight booking (2–5 segments) | ✅ Fully implemented |
| Hotel search, detail, room selection, booking | ✅ Fully implemented |
| Train search and booking | ✅ Fully implemented |
| Bus search and booking | ✅ Fully implemented |
| Holiday package listing, detail, and booking | ✅ Fully implemented |
| Two-phase booking (PENDING → payment → CONFIRMED) | ✅ Fully implemented |
| Seat hold on booking creation; release on cancel/expiry | ✅ Fully implemented |
| Retry payment for PENDING bookings | ✅ Fully implemented |
| My Bookings: list, filter, cancel, retry, status | ✅ Fully implemented |
| Booking Confirmation page (all types) | ✅ Fully implemented |
| Admin panel: per-module inventory CRUD | ✅ Fully implemented |
| Content approval workflow (PENDING / APPROVED / REJECTED) | ✅ Fully implemented |
| Coupon code application at payment | ✅ Fully implemented |
| Special fares (Student, Armed Forces, Senior, Doctor/Nurse) | ✅ Fully implemented |
| Schedule expiry filtering | ✅ Fully implemented |
| Background job: booking cleanup & auto-complete | ✅ Fully implemented |
| Rate limiting | ✅ Fully implemented |
| Static content pages (About, Careers, Help, Policy, etc.) | ✅ Fully implemented |

### 4.2 Partially Implemented

| Area | Status |
|------|--------|
| Cabs module | ⚠️ Database model & backend routes exist; frontend is a placeholder page only |
| Price updater job | ⚠️ Cron schedule wired but logic is a stub (no external pricing API) |
| Email notifications | ⚠️ Service file scaffolded; no actual email sending implemented |
| Hotel reviews | ⚠️ DB model and backend routes exist; no frontend UI |

### 4.3 Out of Scope (Not Implemented)

- Live airline / GDS seat availability APIs
- Real payment gateway (Razorpay, Stripe, etc.)
- Mobile application (iOS / Android)
- PDF ticket download
- AI-based recommendations
- Dynamic/surge pricing
- Loyalty points / wallet system
- International flight support
- Multi-currency support

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                         │
│           React 18 SPA  (Vite · Redux · React Router)        │
└────────────────────────────┬─────────────────────────────────┘
                             │  HTTPS REST (JSON)
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER                         │
│                Node.js 20 · Express.js                       │
│                                                              │
│  rateLimiter → requestLogger → authMiddleware → controller   │
│                  ↓                                           │
│         Service Layer (business logic)                       │
│                  ↓                                           │
│         Prisma ORM Client                                    │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                     PostgreSQL 18                             │
│           goibibo_db  ·  port 4321                           │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 18 |
| Build tool | Vite | Latest |
| State management | Redux Toolkit | Latest |
| Routing | React Router | v6 |
| Styling | Tailwind CSS | v3 |
| HTTP client | Axios | Latest |
| Backend runtime | Node.js | 20 |
| Backend framework | Express.js | 4 |
| ORM | Prisma | Latest |
| Database | PostgreSQL | 18 |
| Auth | JWT (jsonwebtoken) | — |
| Password hashing | bcryptjs | — |
| Security headers | Helmet.js | — |
| Rate limiting | express-rate-limit | — |
| Cron jobs | node-cron | — |
| Logging | Winston (custom logger) | — |
| Validation | express-validator | — |

### 5.3 Backend Request Lifecycle

```
HTTP Request
  → CORS check (corsOptions)
  → Helmet (security headers)
  → express.json() (body parser)
  → requestLogger (log every request)
  → rateLimiter (100 req / 15 min; 10 auth attempts / 15 min)
  → Route → authMiddleware (JWT verify, if protected)
           → adminMiddleware / moduleMiddleware (if role-gated)
           → validateRequest (express-validator schemas)
           → Controller (parse req, call service)
           → Service (business logic + Prisma queries)
           → apiResponse helper (successResponse / errorResponse)
  ← JSON Response
  → errorHandler (global — catches all thrown errors)
```

### 5.4 Frontend Application Entry

```
main.jsx
  └── <BrowserRouter>
        └── <Provider store={store}>
              └── <App>
                    └── AppRoutes.jsx  (all route definitions)
```

---

## 6. User Roles & Permissions

### 6.1 Role Definitions

| Role | Description |
|------|-------------|
| `USER` | Standard authenticated user. Can search, book, view My Bookings, cancel own bookings. |
| `MANAGER` | Staff user assigned to one specific module. Can perform CRUD on that module's inventory. Cannot approve/reject content — only ADMIN can. |
| `ADMIN` | Super-user. Full access to all modules, can approve or reject any content, no module restriction. |

### 6.2 Manager Modules

A `MANAGER` is assigned exactly one `managerModule` at account creation. The possible values are:

| Module | Controls |
|--------|---------|
| `FLIGHTS` | Flight inventory |
| `HOTELS` | Hotel and room inventory |
| `TRAINS` | Train inventory |
| `BUSES` | Bus inventory |
| `HOLIDAYS` | Holiday package inventory |
| `CARS` | Cab inventory (backend only; no admin UI yet) |

### 6.3 Permission Matrix

| Action | USER | MANAGER (own module) | ADMIN |
|--------|------|---------------------|-------|
| Search / browse inventory | ✅ | ✅ | ✅ |
| Create booking | ✅ | ✅ | ✅ |
| View own bookings | ✅ | ✅ | ✅ |
| Cancel own booking | ✅ | ✅ | ✅ |
| Create / edit / delete inventory | ❌ | ✅ | ✅ |
| View all inventory (admin list) | ❌ | ✅ (own module) | ✅ |
| Approve / reject content | ❌ | ❌ | ✅ |
| Access admin panel | ❌ | ✅ (own module) | ✅ |

### 6.4 Backend Middleware Enforcement

| Middleware | Purpose |
|-----------|---------|
| `authMiddleware` | Verifies JWT; attaches `req.user`. Used on all protected routes. |
| `adminMiddleware` | Allows `MANAGER` or `ADMIN`. Guards inventory CRUD routes. |
| `approverMiddleware` | Allows `ADMIN` only. Guards approve/reject routes. |
| `moduleMiddleware(module)` | Allows `ADMIN` unconditionally; allows `MANAGER` only if `req.user.managerModule === module`. |

### 6.5 Frontend Route Guards

| Component | Description |
|-----------|-------------|
| `ProtectedRoute` | Redirects to `/login` if no valid JWT in Redux `authSlice`. Wraps all booking and profile routes. |
| `AdminRoute` | Restricts `/admin/**` to users whose role is `MANAGER` or `ADMIN`. |
| `ModuleRoute` | Restricts specific admin sub-routes (e.g., `/admin/flights`) to the matching `managerModule` or `ADMIN`. |

---

## 7. Authentication & Session Management

### 7.1 Registration

- **Endpoint:** `POST /api/v1/auth/register`
- **Required fields:** `name`, `email`, `password`
- **Optional fields:** `phone`
- **Default role:** `USER`
- Password is hashed with `bcryptjs` (12 salt rounds) before storage.
- A JWT token is returned immediately on successful registration.

### 7.2 Login

- **Endpoint:** `POST /api/v1/auth/login`
- **Credentials:** `email` + `password`
- Password compared with stored bcrypt hash via `comparePassword()`.
- On success: returns `{ user, token }`. Token includes `id`, `email`, `role`, `managerModule`.
- Auth rate limiter: **10 attempts per 15 minutes** per IP.

### 7.3 JWT Token

| Property | Value |
|----------|-------|
| Algorithm | HS256 |
| Expiry | 7 days (`JWT_EXPIRES_IN=7d`) |
| Storage | Redux store (in-memory; persisted via `localStorage` if configured) |
| Transport | `Authorization: Bearer <token>` header |
| Validation | `authMiddleware` on every protected request |

### 7.4 Session Handling

- No refresh token mechanism in the current implementation (planned for v3).
- Frontend attaches the stored JWT from Redux to every outgoing Axios request via a request interceptor in `src/services/api.js`.
- Logout clears the Redux auth slice. No server-side token revocation (stateless JWT).

### 7.5 Profile

- **Endpoint:** `GET /api/v1/auth/me` (protected)
- Returns safe user fields (no password). Used to bootstrap the logged-in state on app reload.

---

## 8. Modules & Functional Requirements

### 8.1 Flights Module

#### 8.1.1 Search

- **Endpoint:** `GET /api/v1/flights/search`
- **Search parameters:** `origin`, `destination`, `date`, `passengers`, `cabin`, `returnDate` (round-trip), `segments` (multi-city JSON)
- Only `APPROVED` flights are returned in search results.
- Expired schedules are filtered out using `getScheduleBounds()` — departures already past by more than the grace period are hidden from results.
- Results support client-side filtering (airline, stops, price range) and sorting (price, duration, departure time).

#### 8.1.2 Trip Types

| Trip Type | Description |
|-----------|-------------|
| One-Way | Single outbound flight selection |
| Round-Trip | Outbound flight selected first; return flight search auto-triggers on selection |
| Multi-City | 2 to 5 ordered segments; each segment's flights loaded independently; sequential selection flow |

#### 8.1.3 Special Fares

| Fare Type | Discount | Eligibility |
|-----------|----------|-------------|
| `REGULAR` | 0% | All passengers |
| `STUDENT` | 10% | Student ID required (honour system) |
| `ARMED_FORCES` | 15% | Military ID required |
| `SENIOR_CITIZEN` | 12% | Age 60+ |
| `DOCTOR_NURSE` | 8% | Medical professionals |

#### 8.1.4 Cabin Classes

`ECONOMY` · `PREMIUM_ECONOMY` · `BUSINESS` · `FIRST`

#### 8.1.5 Booking Flow — One-Way

```
Search results → Select flight → FlightBookingPage
  → Enter passengers + contact details
  → Apply coupon (optional)
  → Proceed to payment
  → Mock payment (card form)
  → POST /api/v1/bookings  (creates PENDING booking + holds seats)
  → POST /api/v1/bookings/:id/confirm-payment  (CONFIRMED)
  → BookingConfirmationPage
```

#### 8.1.6 Booking Flow — Round-Trip

```
Search results (outward)
  → Select outbound flight
  → Return flight search triggered automatically
  → Select return flight
  → Both flights confirmed in sticky bar
  → FlightBookingPage (shows both legs, combined fare)
  → [Same payment flow as one-way]
  → Booking stored with flightId + returnFlightId
  → Seats held for both legs; both restored on cancel/expiry
```

#### 8.1.7 Booking Flow — Multi-City

```
FlightSearch (Multi-City tab)
  → Enter 2–5 segments (origin, destination, date)
  → Sequential date validation (each date ≥ previous)
  → Navigate to MultiCityResultsPage with URL-encoded segments
  → Per-segment flight selection (progress strip)
  → Each segment has independent filter/sort state
  → Auto-advance to next segment on selection
  → Sticky total fare bar (only when all segments selected)
  → FlightBookingPage (combined fare; packageData payload built)
  → [Same payment flow]
  → Booking stored: flightId = segment[0].flightId; full data in packageData.segments[]
```

#### 8.1.8 Multi-City Data Storage

Multi-city bookings use the `packageData` JSON column on the `Booking` model:

```json
{
  "tripType": "MULTI_CITY",
  "segmentCount": 3,
  "segments": [
    {
      "order": 1,
      "flightId": "uuid",
      "origin": "DEL",
      "destination": "BOM",
      "date": "2026-06-01",
      "fare": 4200,
      "airline": "IndiGo",
      "flightNumber": "6E-123",
      "departureTime": "...",
      "arrivalTime": "...",
      "duration": 120,
      "stops": 0,
      "cabinClass": "ECONOMY"
    }
  ],
  "specialFare": "REGULAR",
  "specialFareLabel": null,
  "specialDiscount": 0,
  "couponCode": null,
  "couponDiscount": 0
}
```

The `flightId` field on the `Booking` record always references the **first segment's flight** for backward compatibility with existing seat management logic.

#### 8.1.9 Seat Holding Logic

| Event | Action |
|-------|--------|
| Booking created (PENDING) | `availableSeats` decremented for all segment flights |
| Payment confirmed | Seats remain held (now CONFIRMED) |
| Booking cancelled by user | Seats restored for all segment flights |
| Booking expired (cleanup job) | Seats restored for all segment flights |

Seat hold prevents overbooking during the 30-minute payment window.

---

### 8.2 Hotels Module

#### 8.2.1 Search & Browse

- **Endpoint:** `GET /api/v1/hotels/search`
- **Parameters:** `city`, `checkIn`, `checkOut`, `guests`
- Only `APPROVED` hotels are returned.
- **Hotel Detail:** `GET /api/v1/hotels/:id` — returns hotel info, amenities, star rating, images.
- **Room Listing:** `GET /api/v1/hotels/:id/rooms` — lists all rooms for a hotel with pricing, capacity, availability.

#### 8.2.2 Booking Flow

```
Hotel search → Select hotel → HotelDetailPage
  → View rooms → Select room
  → HotelBookingPage
  → Enter guest details + contact
  → Apply coupon (optional)
  → Payment (mock)
  → POST /api/v1/bookings  (creates CONFIRMED booking directly; room availability decremented)
  → BookingConfirmationPage
```

Note: Hotel bookings are created as `CONFIRMED` directly (no PENDING state). Room availability is decremented at booking creation.

#### 8.2.3 Amenities

Hotels support an `amenities` array (e.g., WiFi, Pool, Gym, Parking). Rooms have independent amenity arrays and room-type classifications.

#### 8.2.4 Check-in / Check-out

`checkIn` and `checkOut` dates are stored on the `Booking` record. Auto-complete triggers when `checkOut < now`.

---

### 8.3 Trains Module

#### 8.3.1 Search

- **Endpoint:** `GET /api/v1/trains/search`
- **Parameters:** `origin`, `destination`, `date`
- Only `APPROVED` trains returned. Expired departures filtered out.

#### 8.3.2 Classes

Train fare classes are stored as a JSON array in the `classes` field on the `Train` model. Each class entry includes the class name (e.g., Sleeper, 3AC, 2AC, 1AC) and price per seat.

#### 8.3.3 Booking Flow

```
Train search → Select train → Select class
  → TrainBookingPage
  → Enter passengers + contact
  → Payment (mock)
  → POST /api/v1/bookings  (PENDING; seats held)
  → Confirm payment  (CONFIRMED)
  → BookingConfirmationPage
```

---

### 8.4 Buses Module

#### 8.4.1 Search

- **Endpoint:** `GET /api/v1/buses/search`
- **Parameters:** `origin`, `destination`, `date`
- Only `APPROVED` buses returned. Expired departures filtered.

#### 8.4.2 Bus Attributes

Each bus record stores: `operator`, `busType` (Sleeper/Semi-Sleeper/AC/Non-AC), `amenities`, `price`, `totalSeats`, `availableSeats`.

#### 8.4.3 Booking Flow

```
Bus search → Select bus
  → BusBookingPage
  → Enter passengers + contact
  → Payment (mock)
  → POST /api/v1/bookings  (PENDING; seats held)
  → Confirm payment  (CONFIRMED)
  → BookingConfirmationPage
```

---

### 8.5 Holiday Packages Module

#### 8.5.1 Package Listing

- **Endpoint:** `GET /api/v1/holidays`
- Returns all `APPROVED` and `isActive = true` packages.
- Each package has: `title`, `description`, `duration` (days), `price`, `originalPrice`, `city`, `images[]`, `tags[]`, `highlights[]`.

#### 8.5.2 Package Detail

- **Endpoint:** `GET /api/v1/holidays/:id`

#### 8.5.3 Booking Flow

```
Holiday listing → Select package → HolidayBookingPage
  → Select adults/children count
  → Enter traveller details + contact
  → Apply coupon (optional)
  → Payment (mock)
  → POST /api/v1/bookings  (type: HOLIDAY; packageData stores title, duration, city, etc.)
  → Confirm payment  (CONFIRMED)
  → BookingConfirmationPage
```

Holiday package data is stored in `packageData` JSON on the booking since `HolidayPackage` has no direct FK on the `Booking` model.

---

### 8.6 Cabs Module

| Component | Status |
|-----------|--------|
| Database model (`Cab`) | ✅ Implemented |
| Backend routes (`/api/v1/cabs`) | ✅ Implemented |
| `BookingType.CAB` | ✅ Implemented |
| `ManagerModule.CARS` | ✅ Implemented |
| Frontend search / booking UI | ❌ Not implemented — placeholder page only |
| Admin panel UI for cabs | ❌ Not implemented |

The Cabs module is architecturally complete at the data and API level but has no functional frontend. The `CabsPage` shows a "Coming Soon" placeholder.

---

## 9. Booking Workflows

### 9.1 Booking Status Lifecycle

```
               ┌─────────────────────────────────────┐
               │         Booking Created              │
               └─────────────────┬───────────────────┘
                                 │
               ┌─────────────────▼───────────────────┐
               │             PENDING                  │  ← All FLIGHT, TRAIN, BUS
               │    (payment not yet confirmed)       │     bookings start here.
               │    Seats held; 30-min window         │     HOTEL & HOLIDAY: skip
               └──────┬──────────────────────┬────────┘     to CONFIRMED directly.
                      │                      │
          Payment     │              Window  │
          confirmed   │              expired │ (cleanup job)
                      │              or user │
                      │              cancels │
               ┌──────▼──────┐       ┌──────▼──────┐
               │  CONFIRMED  │       │  CANCELLED  │
               │  (paid)     │       │  Seats      │
               │             │       │  restored   │
               └──────┬──────┘       └─────────────┘
                      │
          Journey date│ passes
          (cleanup job│ or getMyBookings)
                      │
               ┌──────▼──────┐
               │  COMPLETED  │
               └─────────────┘
```

### 9.2 Booking Record Structure

Every booking contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique booking reference |
| `userId` | UUID | References the booking user |
| `type` | Enum | FLIGHT / HOTEL / TRAIN / BUS / CAB / HOLIDAY |
| `status` | Enum | PENDING / CONFIRMED / CANCELLED / COMPLETED |
| `totalAmount` | Decimal | Final amount after discounts |
| `passengers` | JSON | Array of `{ name, age, gender }` |
| `contactInfo` | JSON | `{ email, phone }` |
| `packageData` | JSON | Trip metadata (multi-city segments, holiday details, fare type, coupon) |
| `flightId` | UUID? | Outbound/only flight FK |
| `returnFlightId` | UUID? | Return flight FK (round-trip only) |
| `hotelId` | UUID? | Hotel FK |
| `roomId` | UUID? | Room FK |
| `trainId` | UUID? | Train FK |
| `busId` | UUID? | Bus FK |
| `cabId` | UUID? | Cab FK |
| `checkIn` | DateTime? | Hotel/holiday check-in |
| `checkOut` | DateTime? | Hotel/holiday check-out |

### 9.3 Duplicate Booking Prevention

For flights, if the same user attempts to create a booking for the same `flightId` + `returnFlightId` combination within 30 minutes and their previous booking is still `PENDING`, the existing booking is returned instead of creating a duplicate. This prevents double seat holds during browser refreshes or accidental re-submissions.

---

## 10. Payment Workflows

### 10.1 Payment Model

Each booking has exactly one associated `Payment` record (1:1 relationship).

| Field | Description |
|-------|-------------|
| `status` | PENDING / SUCCESS / FAILED / REFUNDED |
| `method` | `null` (pending) or `CARD` |
| `amount` | Final paid amount |
| `paidAt` | Timestamp of successful payment |
| `transactionId` | Placeholder (no real gateway) |

### 10.2 Payment Status Transitions

```
PENDING  →  SUCCESS   (on confirm-payment)
PENDING  →  FAILED    (on simulate failure — CVV "000")
SUCCESS  →  REFUNDED  (on booking cancellation after payment)
```

### 10.3 Mock Payment Implementation

The current system implements a **mock payment gateway** via a card form in the frontend. There is no real payment gateway integration.

**Mock behaviour:**
- Any card details (except CVV `000`) result in a successful payment.
- CVV `000` simulates a bank-declined transaction.
- Payment confirmation calls `POST /api/v1/bookings/:id/confirm-payment`.
- The backend transitions the booking status and payment record atomically.

### 10.4 Coupon Codes

- Coupons are managed via `GET/POST /api/v1/coupons`.
- Applied at the FlightBookingPage before payment.
- Discount applied to `totalAmount`; `couponCode` and `couponDiscount` stored in `packageData`.
- Confirmation call sends the final post-coupon `totalAmount` to ensure the payment record reflects the actual charged amount.

### 10.5 Retry Payment

Users can retry payment for any PENDING booking from the My Bookings page. The retry modal re-submits to `POST /api/v1/bookings/:id/confirm-payment` with the updated payment details.

---

## 11. My Bookings Module

### 11.1 Overview

- **Endpoint:** `GET /api/v1/bookings/my`
- Authenticated users can view all their bookings across all travel types.
- Supports type and status filtering via query parameters.
- Paginated response.

### 11.2 Displayed Information

| Section | Details |
|---------|---------|
| Route title | Origin → Destination (one-way), Origin ⇌ Destination (round-trip), Full city chain (multi-city) |
| Trip type badge | Onward / Return labels for round-trip; Seg 1, Seg 2... for multi-city |
| Status badge | Pending / Confirmed / Cancelled / Completed (colour-coded) |
| Payment badge | Paid / Pending / Refunded / Failed |
| Amount | Total booking amount |
| Traveller count | Derived from `passengers` array length |
| Expandable section | Passenger names, ages, genders; booking metadata (ID, booked date, paid date) |

### 11.3 Actions Available

| Action | Condition |
|--------|-----------|
| Cancel Booking | Status is CONFIRMED and journey date is in the future |
| Complete Payment | Status is PENDING |
| (No action) | Status is CANCELLED or COMPLETED |

### 11.4 Auto-Complete Logic

When `getMyBookings` is called, the backend checks if any `CONFIRMED` bookings have passed their journey date. If so, they are updated to `COMPLETED` in the same API call. This is a soft auto-complete that runs on each page load (supplementing the cron job).

### 11.5 Past Booking Display

Bookings whose journey date has passed are displayed with a greyed-out colour stripe and `opacity-90`, visually separating them from upcoming bookings.

---

## 12. Admin & Content Management

### 12.1 Admin Panel Routes

| URL | Module | Access |
|-----|--------|--------|
| `/admin` | Dashboard | MANAGER (any) / ADMIN |
| `/admin/flights` | Flight inventory | FLIGHTS MANAGER / ADMIN |
| `/admin/hotels` | Hotel inventory | HOTELS MANAGER / ADMIN |
| `/admin/trains` | Train inventory | TRAINS MANAGER / ADMIN |
| `/admin/buses` | Bus inventory | BUSES MANAGER / ADMIN |
| `/admin/holidays` | Holiday packages | HOLIDAYS MANAGER / ADMIN |

### 12.2 CRUD Operations

All admin modules support:
- **List** all inventory items (including PENDING and REJECTED items, unlike public search)
- **Create** new inventory item (status defaults to `PENDING`)
- **Edit** existing item (status reverts to `PENDING` on edit, requiring re-approval)
- **Delete** item
- **Approve** item (`ADMIN` only — sets status to `APPROVED`)
- **Reject** item with optional rejection reason (`ADMIN` only)

### 12.3 Table UI

Admin inventory tables show:
- Key fields per record
- Status badge (Pending / Approved / Rejected)
- Rejection reason (when applicable)
- Action buttons: Edit, Delete, Approve ✓, Reject ✗
- Approve/Reject buttons are shown as separate icon columns; visible only to ADMIN users

---

## 13. Content Approval Workflow

### 13.1 Flow

```
MANAGER creates/edits inventory item
        │
        ▼
  Status: PENDING
  (hidden from public search)
        │
        ▼
  ADMIN reviews in admin panel
        │
   ┌────┴────┐
   ▼         ▼
APPROVED  REJECTED (with reason)
(visible  (hidden; reason shown
in search)  to manager)
```

### 13.2 Visibility Rules

| Status | Public search | Admin panel |
|--------|--------------|-------------|
| PENDING | Hidden | Visible |
| APPROVED | Visible | Visible |
| REJECTED | Hidden | Visible |

### 13.3 Re-edit Behaviour

When a `MANAGER` edits an `APPROVED` item, the status is **reset to `PENDING`** automatically, requiring the `ADMIN` to re-approve before the changes go live. This prevents unapproved changes from being published silently.

---

## 14. Background Jobs & Automation

Background jobs run only in non-test environments. They are scheduled via `node-cron` in `server.js`.

### 14.1 Booking Cleanup Job

- **Schedule:** Every 15 minutes (`*/15 * * * *`)
- **File:** `src/jobs/bookingCleanup.js`

**Phase 1 — Expire stale PENDING bookings:**
1. Find all `PENDING` bookings older than 30 minutes.
2. For FLIGHT/TRAIN/BUS bookings, restore `availableSeats`:
   - Outbound/primary flight or train or bus.
   - Return flight (round-trip).
   - All additional multi-city segment flights.
3. Mark all expired PENDING bookings (any type) as `CANCELLED`.

**Phase 2 — Auto-complete past bookings:**
1. Find all `CONFIRMED` bookings whose journey date has passed.
2. Mark them as `COMPLETED`.

### 14.2 Price Updater Job

- **Schedule:** Every 6 hours (`0 */6 * * *`)
- **File:** `src/jobs/priceUpdater.js`
- **Status:** Stub only — logs a message. No external pricing API is integrated.

### 14.3 Schedule Expiry Filtering

- **File:** `src/utils/scheduleFilter.js` — `getScheduleBounds(searchDate, offsetMinutes)`
- Applied to flight, train, and bus search queries.
- Hides schedules departing before `max(startOfSearchDay, now - offsetMinutes)`.
- When the search date is in the future, the full day's schedules are returned.
- When the search date is today, only upcoming departures (within the grace window) are returned.

---

## 15. Business Rules

| Rule | Details |
|------|---------|
| Seat hold on PENDING | Seats decremented immediately on booking creation. |
| 30-minute payment window | PENDING bookings expire after 30 minutes; seats released. |
| Duplicate booking guard | Same user + same flight(s) within 30 minutes → return existing PENDING booking. |
| Round-trip atomic hold | Both outbound and return flight seats held together. If return is unavailable, outbound hold is rolled back. |
| Multi-city sequential hold | Segment flights held in order. If any segment fails, all previously held segments are rolled back. |
| Hotel / Holiday: direct CONFIRMED | Non-transport bookings skip PENDING status; created as CONFIRMED directly. |
| Room availability decrement | `availableRooms` decremented immediately on hotel booking creation. |
| Cancel rules | Only `CONFIRMED` future bookings can be cancelled. `COMPLETED` and `CANCELLED` bookings cannot be cancelled. |
| Cancellation refund | `Payment.status` transitions from `SUCCESS` → `REFUNDED` on cancellation. |
| Auto-complete | CONFIRMED booking whose departure/checkout time has passed → COMPLETED (on API call or cleanup job). |
| Content visibility | Only `APPROVED` inventory shown in public search. `PENDING` and `REJECTED` are admin-only. |
| Manager re-approval | Editing an APPROVED item resets it to PENDING for re-approval. |
| Expired schedule filtering | Departed schedules are hidden from search results (grace period configurable). |

---

## 16. Database Design

### 16.1 Entity Overview

| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `users` | Registered users; holds role and managerModule |
| `Flight` | `flights` | Flight inventory with seat tracking |
| `Hotel` | `hotels` | Hotel inventory |
| `Room` | `rooms` | Individual room types within hotels |
| `Train` | `trains` | Train inventory with JSON class pricing |
| `Bus` | `buses` | Bus inventory |
| `Cab` | `cabs` | Cab inventory (backend-ready, no UI) |
| `HolidayPackage` | `holiday_packages` | Package inventory |
| `Booking` | `bookings` | Unified booking record for all travel types |
| `Payment` | `payments` | One-to-one payment record per booking |
| `Review` | `reviews` | Hotel reviews (DB/API implemented; no frontend) |

### 16.2 Key Relationships

```
User ──────────── Booking (1:N)
User ──────────── Review (1:N)

Flight ─────────── Booking via OutboundFlight relation (1:N)
Flight ─────────── Booking via ReturnFlight relation (1:N)
Hotel ──────────── Booking (1:N)
Hotel ──────────── Room (1:N, cascade delete)
Hotel ──────────── Review (1:N)
Room ───────────── Booking (1:N)
Train ──────────── Booking (1:N)
Bus ────────────── Booking (1:N)
Cab ────────────── Booking (1:N)

Booking ────────── Payment (1:1)
```

### 16.3 Enumerations

| Enum | Values |
|------|--------|
| `Role` | USER, MANAGER, ADMIN |
| `ManagerModule` | FLIGHTS, HOTELS, TRAINS, BUSES, HOLIDAYS, CARS |
| `ContentStatus` | PENDING, APPROVED, REJECTED |
| `BookingType` | FLIGHT, HOTEL, TRAIN, BUS, CAB, HOLIDAY |
| `BookingStatus` | PENDING, CONFIRMED, CANCELLED, COMPLETED |
| `PaymentStatus` | PENDING, SUCCESS, FAILED, REFUNDED |
| `CabinClass` | ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST |

### 16.4 Booking — Flight Relations (Named)

The `Flight` model uses **named Prisma relations** to support two FKs pointing to the same table:

```prisma
model Flight {
  bookings       Booking[] @relation("OutboundFlight")
  returnBookings Booking[] @relation("ReturnFlight")
}

model Booking {
  flight       Flight? @relation("OutboundFlight", fields: [flightId], references: [id])
  returnFlight Flight? @relation("ReturnFlight", fields: [returnFlightId], references: [id])
}
```

### 16.5 Multi-City in `packageData`

Multi-city bookings store full segment detail in the `packageData` JSON column on `Booking`. The `flightId` field holds the first segment's flight ID for backward compatibility. No additional join table or schema change is needed.

---

## 17. API Design

### 17.1 Base URL & Versioning

All API routes are prefixed with `/api/v1`. API versioning is path-based.

### 17.2 Response Envelope

All responses use a consistent JSON envelope via `apiResponse.js`:

**Success:**
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... },
  "meta": { "page": 1, "total": 50, "limit": 10 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### 17.3 API Route Reference

#### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login; returns JWT |
| GET | `/auth/me` | JWT | Get current user profile |
| POST | `/auth/logout` | JWT | Logout (client-side token clear) |

#### Flights

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/flights/search` | — | Search approved flights |
| GET | `/flights/:id` | — | Get flight by ID |
| GET | `/flights/` | JWT + MANAGER/ADMIN | List all flights (admin) |
| POST | `/flights/` | JWT + MANAGER/ADMIN | Create flight |
| PUT | `/flights/:id` | JWT + MANAGER/ADMIN | Update flight |
| DELETE | `/flights/:id` | JWT + MANAGER/ADMIN | Delete flight |
| POST | `/flights/:id/approve` | JWT + ADMIN | Approve flight |
| POST | `/flights/:id/reject` | JWT + ADMIN | Reject flight |

#### Hotels

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/hotels/search` | — | Search approved hotels |
| GET | `/hotels/:id` | — | Hotel detail |
| GET | `/hotels/:id/rooms` | — | List rooms |
| GET | `/hotels/` | JWT + MANAGER/ADMIN | List all hotels (admin) |
| POST | `/hotels/` | JWT + MANAGER/ADMIN | Create hotel |
| PUT | `/hotels/:id` | JWT + MANAGER/ADMIN | Update hotel |
| DELETE | `/hotels/:id` | JWT + MANAGER/ADMIN | Delete hotel |
| POST | `/hotels/:id/approve` | JWT + ADMIN | Approve hotel |
| POST | `/hotels/:id/reject` | JWT + ADMIN | Reject hotel |

#### Trains / Buses / Holidays

Same CRUD + approve/reject pattern as Flights, under `/trains`, `/buses`, `/holidays` respectively.

#### Bookings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/bookings/` | JWT | Create booking (PENDING) |
| POST | `/bookings/:id/confirm-payment` | JWT | Confirm payment → CONFIRMED |
| GET | `/bookings/my` | JWT | List user's bookings |
| GET | `/bookings/:id` | JWT | Get booking by ID |
| PATCH | `/bookings/:id/cancel` | JWT | Cancel booking |

#### Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/` | JWT | Process payment (delegates to confirm-payment) |

#### Coupons

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/coupons/` | JWT | List available coupons |
| POST | `/coupons/` | JWT + ADMIN | Create coupon |

#### Cabs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cabs/` | — | List cabs |
| POST | `/cabs/` | JWT + MANAGER/ADMIN | Create cab |
| PUT | `/cabs/:id` | JWT + MANAGER/ADMIN | Update cab |
| DELETE | `/cabs/:id` | JWT + MANAGER/ADMIN | Delete cab |

### 17.4 Pagination

List endpoints accept `page` and `limit` query parameters. Pagination metadata is normalised via `src/utils/pagination.js` and returned in the `meta` field.

### 17.5 Validation

Input validation uses `express-validator` schemas in `src/validators/`. The `validateRequest` middleware runs after validators and returns `422` with error details on failure.

---

## 18. Frontend Architecture

### 18.1 Project Structure

```
frontend/src/
├── main.jsx               Entry point
├── App.jsx                Root component
├── routes/
│   ├── AppRoutes.jsx      All route definitions
│   ├── ProtectedRoute.jsx Redirects unauthenticated users
│   ├── AdminRoute.jsx     Restricts to MANAGER/ADMIN
│   └── ModuleRoute.jsx    Restricts to module-specific access
├── pages/                 One file per page/route
├── components/
│   ├── common/            Reusable UI: Button, Loader, Modal
│   └── <domain>/          Domain-specific: FlightCard, FlightSearch, etc.
├── store/
│   ├── index.js           Redux store configuration
│   └── slices/
│       ├── authSlice.js
│       ├── flightSlice.js
│       ├── hotelSlice.js
│       ├── trainSlice.js
│       ├── busSlice.js
│       └── bookingSlice.js
├── services/
│   ├── api.js             Axios instance + JWT interceptor
│   ├── flightService.js
│   ├── hotelService.js
│   ├── trainService.js
│   ├── busService.js
│   ├── bookingService.js
│   └── ...
├── hooks/
│   ├── useAuth.js
│   ├── useSearch.js
│   ├── useBooking.js
│   └── useDebounce.js
├── constants/
│   ├── routes.js          All route path constants
│   └── apiEndpoints.js    All API URL constants
└── layouts/
    ├── MainLayout.jsx     Header + Footer + Outlet
    ├── AdminLayout.jsx    Sidebar + Outlet (admin)
    └── AuthLayout.jsx     Centred card layout (login/register)
```

### 18.2 Redux State Slices

| Slice | State managed |
|-------|--------------|
| `authSlice` | `user`, `token`, `isAuthenticated` — persisted to localStorage |
| `flightSlice` | Search results, filters, active selection |
| `hotelSlice` | Search results, selected hotel/room |
| `trainSlice` | Search results, selected class |
| `busSlice` | Search results |
| `bookingSlice` | Active booking flow: `bookingStart`, `bookingSuccess`, `bookingFailure` |

### 18.3 API Service Layer

`src/services/api.js` creates a shared Axios instance. A **request interceptor** automatically attaches `Authorization: Bearer <token>` from the Redux auth slice to every request. Domain-specific service files (e.g., `flightService.js`) expose named functions consumed by components/pages. No API URL is hard-coded in components — all paths use constants from `apiEndpoints.js`.

### 18.4 Route Constants

All navigation paths are centralised in `src/constants/routes.js`. No string path literals are written directly in components or pages.

---

## 19. Security Implementation

| Security Layer | Implementation |
|---------------|---------------|
| Transport security | HTTPS recommended for production; HTTP in development |
| Security headers | `helmet()` middleware — sets X-Frame-Options, Content-Security-Policy, HSTS, etc. |
| CORS | Configurable `CORS_ORIGIN` env var; restrictive by default |
| Password storage | `bcryptjs` with 12 salt rounds (never stored in plain text) |
| Authentication | Stateless JWT (HS256); 7-day expiry |
| API authorisation | Middleware chain enforces role and module at route level |
| Rate limiting — general | 100 requests per 15 minutes per IP |
| Rate limiting — auth | 10 login attempts per 15 minutes per IP |
| Input validation | `express-validator` on all mutating endpoints; `422` returned on invalid input |
| Error masking | `errorHandler` returns `"Internal server error."` for 5xx; actual error logged server-side only |
| SQL injection | Eliminated by Prisma ORM parameterised queries |
| XSS | React's default escaping; no `dangerouslySetInnerHTML` usage |
| JWT secret | Configurable via `JWT_SECRET` env var |

---

## 20. Performance & Scalability

### 20.1 Implemented Optimisations

| Technique | Where used |
|-----------|-----------|
| Pagination | All list endpoints (`page`, `limit` params; `src/utils/pagination.js`) |
| Server-side filtering | Search endpoints filter by status, date range, origin/destination |
| Client-side filter/sort | Flight and search results have local filter/sort state (no refetch needed) |
| Prisma select projection | `getMyBookings` and similar calls use explicit `select` to avoid over-fetching |
| Single Prisma client | One `PrismaClient` instance in `src/config/database.js`; shared across all services |
| Background jobs | Seat restoration and booking completion run on cron, not in the request path |
| Schedule filtering | Expired schedules excluded at DB query time, not in application memory |

### 20.2 Identified Bottlenecks (Future Work)

| Bottleneck | Suggested fix |
|-----------|--------------|
| No DB indexes beyond PKs | Add indexes on `flightId`, `userId`, `status`, `departureTime` |
| No caching layer | Add Redis for search result caching |
| Prisma N+1 on bookings | Use `include` with caution; batch where possible |
| Client-side filter state | Move filters server-side for large result sets |
| No CDN | Images served from DB as URLs; add CDN for production |

---

## 21. Limitations & Assumptions

### 21.1 Known Limitations

| Area | Limitation |
|------|-----------|
| Payment | Mock payment only. No real gateway (Razorpay / Stripe). No PCI compliance. |
| Seat availability | Seeding provides static seat counts. No live airline inventory sync. |
| Pricing | Static prices in database. No dynamic or surge pricing. |
| Email | No email confirmation or ticket delivery is sent to users. |
| Cabs | Database and API ready but no frontend booking flow. |
| Reviews | Backend fully implemented; no frontend UI to submit or view reviews. |
| Price updater | Cron wired but logic is a no-op stub. |
| Refresh token | No refresh token flow; users must re-login after 7 days. |
| Multi-currency | INR (Indian Rupee) only. No currency conversion. |
| Internationalisation | English language only. |
| PDF tickets | No PDF generation or download capability. |
| Token revocation | JWT is stateless; no server-side blacklist for logout. |

### 21.2 Assumptions

1. The system is intended as a learning/portfolio project, not a production travel platform.
2. All monetary values are in INR (₹).
3. A user may hold only one `PENDING` booking per flight combination within a 30-minute window.
4. Seat availability counts in the seed data are treated as real — overbooking prevention is enforced.
5. The PostgreSQL instance is local to the developer's machine.
6. `MANAGER` accounts are created/provisioned by a database administrator or seed script; there is no self-service manager registration UI.
7. The `ADMIN` account is seeded directly into the database.

---

## 22. Future Enhancements

### 22.1 Short-Term (Next Sprint)

| Enhancement | Priority |
|-------------|---------|
| Cab booking frontend | High |
| Hotel reviews UI (list + submit) | Medium |
| PDF ticket download | Medium |
| Email confirmation on booking | Medium |
| Refresh token / silent re-auth | Medium |
| Server-side flight/hotel search filtering | Medium |

### 22.2 Medium-Term

| Enhancement | Priority |
|-------------|---------|
| Real payment gateway (Razorpay) | High |
| DB query optimisation (indexes, batch queries) | High |
| Redis caching layer for search results | Medium |
| Push notifications (PWA) | Low |
| Loyalty points / wallet | Low |
| Dynamic pricing based on demand | Low |

### 22.3 Long-Term

| Enhancement | Priority |
|-------------|---------|
| Mobile app (React Native) | High |
| Live airline GDS API integration | High |
| AI-powered trip recommendations | Medium |
| International flights + multi-currency | Medium |
| Bus seat map selection | Medium |
| Hotel real-time room availability sync | Medium |
| Admin analytics dashboard | Low |
| Automated testing suite (unit + integration) | High |

---

## 23. Appendix — Outdated Sections Removed from v1.0

The following sections from `GoTripz_SRS_v1.0.docx` were removed or substantially revised in this document:

| Section removed / replaced | Reason |
|-----------------------------|--------|
| Planned multi-city booking (as future scope) | Feature is now fully implemented |
| Planned round-trip booking (as future scope) | Feature is now fully implemented |
| Single flat booking model (no PENDING state) | Replaced by two-phase PENDING → CONFIRMED flow |
| No seat hold mechanism described | Seat holding is now fully implemented with rollback |
| Admin panel as future scope | Admin panel is fully implemented across 5 modules |
| Content approval described as optional | Approval workflow is now mandatory for all inventory |
| Payment gateway as a future integration | Correctly documented as mock; real gateway is future scope |
| Static schedule listings with no expiry | Replaced by `getScheduleBounds` schedule filter |
| No multi-city data storage strategy | Documented: `packageData.segments[]` approach |
| No background job specification | bookingCleanup and priceUpdater jobs documented |
| Unified single booking endpoint only | cancel, confirm-payment, retry-payment endpoints documented |
| No mention of rate limiting | Rate limiting (general + auth) now documented |
| No security architecture section | Full security implementation section added |

---

*End of Document — GoIbibo Replica RSD v2.0*
