# QWheelz — Vehicle Marketplace

The vehicle vertical of the Quantaliez Marketplace product blueprint —
converted from the GroundBooking (venue booking) codebase. See
[`MIGRATION_NOTES.md`](./MIGRATION_NOTES.md) for the full architecture
rationale: what mapped directly, what was rebuilt, what was deliberately
left out of MVP1, and why.

```
backend/    FastAPI + SQLAlchemy 2.0 + PostgreSQL + Alembic
frontend/   Vite + React 19 + TypeScript + Tailwind v4
```

## Quick start

### Windows 1-Click Launch
Simply double-click **`run.bat`** (or **`start.bat`**) in the root directory. It automatically:
1. Activates Python virtual environment and launches FastAPI backend on `http://127.0.0.1:8000`.
2. Starts Vite development server for React frontend on `http://localhost:5173`.
3. Opens the application in your default web browser.

To stop both services at any time, double-click **`stop.bat`**.

---

### 1. Database

You need a PostgreSQL 14+ instance with the `pgcrypto` and `citext`
extensions available.

```bash
createdb quantaliez_auto
psql quantaliez_auto -c "CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS citext;"
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt

cp .env.example .env
# edit .env: at minimum set DATABASE_URL to match your Postgres instance
# and set JWT_SECRET_KEY to a long random string.

./venv/bin/alembic upgrade head
./venv/bin/uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` — interactive docs at
`http://localhost:8000/docs`.

Run the test suite (spins up its own `quantaliez_auto_test` database via
the real Alembic migration chain — create that database first the same
way as above):

```bash
createdb quantaliez_auto_test
psql quantaliez_auto_test -c "CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS citext;"
./venv/bin/pytest
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` and
`/uploads` to `http://localhost:8000` (see `vite.config.ts`), so the
backend needs to be running first.

To type-check or build for production:

```bash
npm run lint    # tsc --noEmit
npm run build   # outputs to dist/
```

## First-run walkthrough

1. Sign up on the frontend — this creates a **buyer** account.
2. Go to **Sell Your Car** → submit a seller verification (any values
   work; there's no real ID-document check in this environment).
3. Approve that verification as an admin. There's no seed script for an
   admin account yet — the fastest way to get one is directly in
   Postgres:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
   ```
4. Log back in as the buyer-turned-seller, post a vehicle from **Sell
   Your Car** → it enters `pending_review`.
5. As the admin, go to `/admin` → **Approval Queue** → approve it.
6. Sign up a second buyer account, browse to the listing, and use
   **Contact Seller** — the enquiry/chat flow, favourites, reviews, and
   the seller dashboard's enquiry inbox all work end-to-end from here.

## What's implemented vs. what's next

`MIGRATION_NOTES.md` §3 lists every deliberate MVP1 scope trim (no
calendar/test-drive scheduling, no geo-radius search, no OTP/SMS, no
video uploads, code-defined pricing plans) and §5 lists every stack
decision that departs from the product blueprint's aspirational
Section 15 recommendations (kept FastAPI/Vite since that's what the
source codebase already was; no Redis/Elasticsearch/Firebase/Razorpay,
matching what the source codebase's own dependencies actually
supported). Nothing there is an oversight — each one names the file
that would need to change to add it.

The IT/software-services marketplace half of the original Quantaliez
Marketplace blueprint (Section 7–9: requirement posting, company
matching, proposals) is out of scope for this conversion by design —
the brief was the vehicle platform specifically. `MIGRATION_NOTES.md`
notes where the data model would extend cleanly if that vertical is
built later (e.g. generalizing `VehicleEnquiry`'s messaging into a
polymorphic `Conversation` shared across both verticals).
