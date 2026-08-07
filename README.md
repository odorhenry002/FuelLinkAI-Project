# FuelLink AI

**Africa's First AI-Powered Energy Marketplace and Business Operating System**

## 🎯 Mission

Build a production-ready SaaS platform connecting buyers, suppliers, transporters, depots, refineries, filling stations, industrial consumers, logistics companies, financial institutions, regulators, and service providers in the energy supply chain.

## 🏗️ Project Structure

```
FuelLinkAI/
├── backend/          # FastAPI backend service
├── frontend/         # Next.js frontend application
├── mobile/           # Flutter mobile app (future)
├── docker-compose.yml
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework:** Python + FastAPI
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL
- **Authentication:** JWT
- **API Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 14+
- **UI Library:** React 18+
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** TBD

### Cloud & Services
- **Cloud Provider:** AWS
- **AI Integration:** OpenAI API
- **Maps:** Google Maps
- **Automation:** n8n
- **Version Control:** Git + GitHub

## 📦 Core Modules

- ✅ Authentication & Authorization
- ✅ Company Registration
- ✅ Buyer Portal
- ✅ Supplier Portal
- ✅ Transporter Portal
- ✅ RFQ Management (Request for Quotation)
- ✅ Quotations Management
- ✅ Orders Management
- ✅ Deliveries Tracking
- ✅ CRM (Customer Relationship Management)
- ✅ AI Assistant
- ✅ Dashboard & Analytics
- ✅ Notifications System
- ✅ Reports & Exports
- ✅ Admin Panel

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose

### Local Setup (Without Docker)

#### Backend Setup
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

Create a local `.env` file from `.env.example` and update values:
```powershell
copy .env.example .env
```

Run the backend locally:
```powershell
py -m uvicorn app.main:app --reload
```

Open the API docs:
- http://localhost:8000/api/docs
- http://localhost:8000/api/redoc

#### Frontend Setup
```powershell
cd frontend
npm install
```

Create local frontend environment file:
```powershell
copy .env.example .env.local
```

Run the frontend locally:
```powershell
npm run dev
```

Open the frontend:
- http://localhost:3000

### Verify Authentication
1. Register a new account at `/register`
2. Log in at `/login`
3. Confirm the browser redirects to `/dashboard`
4. Verify the header shows a dashboard link and user greeting
5. If access is revoked, the frontend automatically refreshes tokens or redirects to `/login`

#### PostgreSQL Setup
1. Install PostgreSQL 14+ on Windows.
2. Create a database:
```powershell
psql -U postgres
CREATE DATABASE fuellink_db;
```
3. Update `backend\.env` with your local `DATABASE_URL`.

---

## 📋 Development Rules

1. ✅ Never generate incomplete code
2. ✅ Always generate production-quality code
3. ✅ Use clean architecture
4. ✅ Follow industry best practices
5. ✅ Write secure code
6. ✅ Use modular code
7. ✅ Step-by-step implementation
8. ✅ Wait for confirmation after each step

## � Role-Based Access
- Registered users are routed to `/dashboard` after login.
- The dashboard renders role-specific content for `buyer`, `supplier`, `transporter`, and `admin`.
- Backend role-restricted endpoints are available under `/api/dashboard/admin` and `/api/dashboard/supplier`.

## �📝 License

Proprietary - FuelLink AI

---

**Status:** Under Development 🔨
