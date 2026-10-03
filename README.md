# 🚗 QWheelz — Certified Pre-Owned Automobile Marketplace

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-316192?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Alembic](https://img.shields.io/badge/Alembic-Migration-critical?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-69%20Passing-success?style=for-the-badge)

**India's premier certified pre-owned automobile network, combining high-assurance inspection intelligence, transparent financing, dynamic price negotiations, and full lifecycle vehicle management.**

[Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Overview](#-api-endpoints) • [Testing](#-test-verification) • [Workflows](#-core-user-flows)

</div>

---

## 🌟 Overview

**QWheelz** is a modern vehicle marketplace platform designed for high-trust vehicle transactions. Built specifically for certified pre-owned cars, luxury automobiles, and commercial fleets, QWheelz addresses common trust issues in used-car buying with transparent engineering metrics, multi-point vehicle inspection reports, verifiable RTO records, dynamic price negotiation, and full-featured role workspaces for Buyers, Private Sellers, Dealers, and Platform Administrators.

---

## ✨ Key Features

### 1. 🔍 High-Assurance Vehicle Discovery & 3D Showroom
- **Dynamic Search & Multi-Faceted Filters**: Real-time filtering by Brand, Model, Year, Price, Fuel Type (Petrol, Diesel, CNG, EV, Hybrid), Transmission (Manual, Automatic, AMT, CVT), Body Type, KM Driven, and Indian RTO Registration State.
- **Interactive 360° Exterior/Interior Viewer**: Full spherical rotational view for inspecting vehicle aesthetics and condition.
- **Coverflow Carousels & Curated Collections**: Smooth visual carousel showcasing trending premium models (Toyota, Škoda, Swift, MG, BMW, Audi, EV collections, and two-wheelers).
- **RTO & Privacy Engine**: Masked vehicle registration plates preserving privacy while verifying genuine regional RTO and state registration records.

### 2. 📋 200-Point Multi-Point Vehicle Inspection Engine
- **Diagnostic Inspection Scoring**: Instant engineering composite score (e.g. 95/100) benchmarked against OEM specifications.
- **Categorized Mechanical Breakdown**:
  - *Engine & Powertrain*: Idle stability, compression, fluid contaminants, exhaust emissions, and transmission shift quality.
  - *Body, Frame & Paint*: Ultrasonic micron paint depth check, structural pillar welds, panel gap tolerance, and 100% non-flooded certification.
  - *Electricals & Interior*: OBD-II diagnostic fault code scanner, dual-zone AC cooling delta, airbag circuits, and infotainment.
  - *Suspension, Brakes & Tyres*: Brake pad thickness in mm, tyre tread depth, shock absorber rebound, and steering rack alignment.
- **Downloadable Diagnostic Summary**: One-click printable PDF checklist summary for buyers and mechanics.

### 3. 📅 Test Drive & Physical Inspection Scheduler
- **Time-Slot Scheduling**: Book test drives or physical doorstep inspections with dedicated time windows (e.g., 10:00 AM – 12:00 PM, 02:00 PM – 04:00 PM).
- **Two-Way Status Workflow**: Real-time statuses (`requested`, `confirmed`, `rescheduled`, `cancelled`, `completed`) tracked simultaneously across Buyer, Seller, and Admin workspaces.
- **Special Request Notes**: Direct communication for custom inspection locations or requests (e.g. service booklet verification).

### 4. 🏷️ Price Negotiation & Offer Engine
- **Direct Seller Negotiation**: Make structured, binding price offers below the asking price.
- **Quick Preset Discounts**: Fast one-click discount calculators (-2%, -5%, -8%, -10%).
- **Interactive Counter-Offer Workflows**: Sellers can directly accept, decline, or counter with revised amounts; buyers can accept or decline counter-offers in real-time.

### 5. 📊 Advanced Compare & Decision Matrix
- **Side-by-Side Spec Comparison**: Up to 3 vehicles compared simultaneously across all technical and mechanical dimensions.
- **"Highlight Differences" Mode**: Instant visual highlight of contrasting specifications between selected vehicles.
- **Comparative Cost of Ownership (TCO)**:
  - Monthly fuel and energy cost estimation based on fuel type and standard monthly run.
  - Annual scheduled maintenance based on body type and brand segment.
  - 3-Year total running cost projection.
- **Finance & EMI Breakdown**: Automated monthly loan EMI calculation based on configurable tenure (12 to 72 months) and down payment.

### 6. 👤 Buyer Account Hub
- **Centralized Workspaces**:
  - *Appointments*: Track and manage booked test drives with cancellation controls.
  - *Offers & Negotiations*: Real-time status of outgoing offers and counter-offers.
  - *Saved Searches & Alerts*: Save customized search parameters and execute them with 1-click.
  - *Dedicated Concierge Support*: Integrated support ticket dashboard with messaging threads.

### 7. 🏢 Seller & Dealer CRM
- **Vehicle Inventory Management**: Draft, submit, and manage listings with photo uploads (cover and gallery images) and document attachments (RC, insurance, service records).
- **Leads & Enquiries CRM**: Kanban-style sales pipeline (New Leads, In Negotiation, Closed Deals).
- **Appointment Calendar**: Manage and confirm incoming buyer test drive bookings.
- **Negotiation Desk**: Review incoming offers, trigger counters, and accept deals.
- **Subscription & Dealer Packages**: Dealer membership tiers with featured listings and priority promotion.

### 8. 🛡️ Admin Platform Console
- **Moderation Queue**: Review and approve/reject newly submitted listings.
- **KYC & Seller Verification**: Verify Aadhaar/PAN, GSTIN, and dealer credentials.
- **Platform-Wide Appointment Operations**: Full visibility and moderation over platform bookings.
- **Concierge Helpdesk**: Handle escalated support tickets with administrative responses and ticket resolution.
- **Audit Logs & Governance**: Immutable audit trail tracking all administrative actions.

---

## 🏗️ Architecture

```
quantaliez-auto/
├── backend/
│   ├── alembic/                # Database schema migrations
│   │   └── versions/           # Migration revision history
│   ├── app/
│   │   ├── models/             # SQLAlchemy 2.0 async ORM models
│   │   │   └── core.py         # Users, Listings, Appointments, Offers, Tickets
│   │   ├── modules/            # Domain-driven modules
│   │   │   ├── auth/           # JWT authentication, Argon2 hashing, RBAC
│   │   │   ├── catalog/        # Vehicles, specifications, search
│   │   │   ├── enquiries/      # Chat threads and buyer messaging
│   │   │   └── admin/          # Platform governance & metrics
│   │   └── main.py             # FastAPI app and route definitions
│   ├── tests/                  # Pytest test suite (60 tests)
│   ├── pytest.ini              # Pytest asyncio configuration
│   └── requirements.txt        # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components & modals
│   │   │   ├── TestDriveModal.tsx
│   │   │   ├── OfferModal.tsx
│   │   │   ├── SupportModal.tsx
│   │   │   ├── InspectionReportSection.tsx
│   │   │   └── ...
│   │   ├── pages/              # Application views & dashboards
│   │   │   ├── BrowsePage.tsx
│   │   │   ├── ListingDetailPage.tsx
│   │   │   ├── ComparePage.tsx
│   │   │   ├── AccountPage.tsx
│   │   │   ├── SellerDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── lib/api/            # Typed API client services
│   │   └── types.ts            # Core TypeScript data contracts
│   ├── package.json            # Node.js dependencies & scripts
│   └── vite.config.ts          # Vite build & proxy configuration
├── run.bat                     # 1-Click launcher (Windows)
├── start.bat                   # Background service runner
├── stop.bat                    # Graceful shutdown script
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.11 or newer
- **Node.js**: 18.x or newer (with npm)
- **PostgreSQL**: 14 or newer (with `pgcrypto` and `citext` extensions)

---

### Windows 1-Click Launch

Double-click **`run.bat`** (or **`start.bat`**) in the root directory:
1. Automatically spins up the FastAPI backend on `http://127.0.0.1:8000`.
2. Launches Vite development server on `http://localhost:5173`.
3. Opens the application in your browser.

To stop both services cleanly, run **`stop.bat`**.

---

### Manual Setup

#### 1. Database Setup
Ensure PostgreSQL is running and create the databases:
```bash
createdb quantaliez_auto
createdb quantaliez_auto_test

psql quantaliez_auto -c "CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS citext;"
psql quantaliez_auto_test -c "CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS citext;"
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET_KEY

# Run database migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at: `http://localhost:8000/docs`.

#### 3. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### 🚘 Listings & Showroom
- `GET /api/v1/listings` — Search and filter vehicles with pagination and sorting.
- `GET /api/v1/listings/slug/{slug}` — Retrieve full vehicle specifications and history.
- `POST /api/v1/listings` — Create a structured vehicle listing.
- `POST /api/v1/listings/{id}/images` — Upload cover or gallery images.
- `POST /api/v1/listings/{id}/documents` — Upload vehicle verification documents.

### 📅 Appointments & Test Drives
- `POST /api/v1/appointments` — Schedule a test drive or inspection.
- `GET /api/v1/appointments` — List user's appointments (with status filtering).
- `PATCH /api/v1/appointments/{id}/status` — Update appointment status.
- `GET /api/v1/admin/appointments` — Platform-wide appointment administration.

### 🏷️ Price Negotiation & Offers
- `POST /api/v1/offers` — Submit a structured price offer.
- `GET /api/v1/offers` — List offers submitted or received.
- `POST /api/v1/offers/{id}/accept` — Seller accepts price offer.
- `POST /api/v1/offers/{id}/reject` — Seller rejects price offer.
- `POST /api/v1/offers/{id}/counter` — Seller submits counter-offer.

### 🎧 Concierge & Support
- `POST /api/v1/support/tickets` — Create a context-aware support ticket.
- `GET /api/v1/support/tickets` — List user or platform tickets.
- `GET /api/v1/support/tickets/{id}` — Retrieve conversation thread.
- `POST /api/v1/support/tickets/{id}/messages` — Reply to ticket.
- `PATCH /api/v1/support/tickets/{id}/status` — Resolve or close ticket.

### 🔍 Saved Searches
- `GET /api/v1/saved-searches` — List user's saved searches.
- `POST /api/v1/saved-searches` — Save custom filter criteria.
- `DELETE /api/v1/saved-searches/{id}` — Delete saved search.

---

## 🧪 Test Verification

Both backend and frontend feature test suites:

### Backend Pytest Suite (60 Tests)
```bash
cd backend
.\venv\Scripts\pytest -c pytest.ini
```
```
============================= 60 passed in 43.75s =============================
```

### Frontend Vitest Suite (9 Tests)
```bash
cd frontend
npm test -- --run
```
```
Test Files  2 passed (2)
Tests       9 passed (9)
```

### Frontend Production Build
```bash
cd frontend
npm run build
```
```
✓ 3034 modules transformed.
dist/index.html                              1.39 kB │ gzip:   0.66 kB
dist/assets/index-D0eKivDV.css              93.83 kB │ gzip:  15.32 kB
dist/assets/index-ChRvyImK.js              273.26 kB │ gzip:  80.63 kB
✓ built in 18.04s
```

---

## 🛡️ Security & Privacy

- **Argon2 Password Hashing**: State-of-the-art password derivation.
- **JWT Token Rotation**: Memory & storage tokens with single-flight refresh on expiry.
- **Role-Based Access Control (RBAC)**: Strict segregation between Buyer, Seller, Dealer, and Admin roles.
- **RTO Plate Masking**: Automatic masking of vehicle registration numbers to protect owner privacy while enabling state and RTO verification.

---

## 📄 License

Proprietary and Confidential. Copyright &copy; 2026 Quantaliez. All Rights Reserved.
