# MARKETPLACE MIGRATION CONTRACT
## 1. Architecture Baseline
- **Frontend**: React + Vite + TypeScript (Tailwind CSS, React Router, React Query).
- **Backend**: FastAPI + SQLAlchemy 2.0 + PostgreSQL + Alembic.
- **State**: The system has already undergone an initial conversion from GroundBooking to Quantaliez Auto.
- **Controls**: Authentication (JWT + HTTP-only refresh token), authorization, idempotency (PostgreSQL-backed), and audit logging are intact.

## 2. Target Architecture
- **Goal**: Expand into a dual marketplace (Quantaliez Auto + Quantaliez Tech) while retaining the existing modular-monolith pattern and engineering primitives.
- **Infrastructure**: Continue with PostgreSQL and FastAPI. No mandatory switch to Node, Redis, or Elasticsearch unless strictly necessary for future AI extension points.

## 3. Domain Mapping
| GroundBooking/Current Auto | Target Dual Marketplace |
|----------------------------|-------------------------|
| `User` (buyer/seller/admin)| Generalize to support Tech (Customer, IT Company). |
| `VehicleListing`           | Keep for Auto. Add `TechnologyRequirement` for Tech. |
| `VehicleEnquiry`           | Keep for Auto. Add `Proposal` for Tech. |
| `SellerVerification`       | Expand to Participant Verification (Company profiles, GST, CIN). |
| `Review`                   | Generalize subjects (seller, dealer, IT company). |
| `Payment` (Subscriptions)  | Retain pattern for cross-vertical monetization. |

## 4. Test Baseline
- **Backend**: 44 passing tests (via `pytest`).
- **Frontend**: 0 tests found (via `vitest run`).
- **Typecheck**: Clean (`tsc --noEmit` exited with code 0 after minor fixes).

## 5. Compatibility Policy
- Do not perform mass destructive rename or drop of Auto tables to fit Tech.
- Tech schemas will be added additively (e.g. `requirements`, `proposals`, `companies`).
- Shared primitives (Users, Verification, Messages, Audit) must be backwards-compatible for Auto while exposing features for Tech.

## 6. Known Gaps
- GroundBooking test suite previously ran 241 tests. The current codebase (already Quantaliez Auto) only has 44 backend tests.
- Frontend lacks any unit/component tests in the current version.
- `types.ts` was missing for the `luxura` UI components; restored inline to ensure a green typecheck gate.

## 7. Migration Log
### Step 01 - Extract Shared Primitives
- Extracted udit, idempotency, jobs, and config to ackend/app/modules/.
- Renamed SellerVerification to ParticipantVerification and seller_onboarding module to erification to serve as a unified marketplace identity primitive.
- Test suites (pytest and 	sc --noEmit) verified green after refactoring and Alembic migration application.

### Step 02 - Tech Domain Schemas & Dual-Marketplace Identity
- Appended \customer\ and \it_company\ to the \user_role\ PostgreSQL enum.
- Introduced \CompanyProfile\, \TechnologyRequirement\, and \Proposal\ tables mimicking the proven lifecycle engines of the Auto domain.
- Tested and ensured relationship mapping using \selectinload\ does not degrade query predictability.
- Applied changes additively to schema keeping testing suite backward-compatible.

### Step 03 - Tech Domain API & Service Layer
- Created Pydantic models for the tech domain in \pp/schemas/tech.py\.
- Created a unified business logic module at \pp/modules/tech/service.py\ holding the CRUD operations for company profiles, requirements, and proposals.
- Spliced API route definitions into \pp/main.py\ following the established modular monolith pattern.
- Wrote full-lifecycle API integration tests in \	ests/test_tech_api.py\ confirming expected authorization and state transitions.
