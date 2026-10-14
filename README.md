# IntelliHire — AI-Powered Applicant Tracking System (ATS)

IntelliHire is an enterprise-grade recruitment platform designed to automate resume screening, candidate ranking, and hiring pipeline management using AI-driven semantic match scoring, real-time analytics, and automated recruiter workflows.

---

## 📌 Project Overview

Traditional applicant tracking systems rely on rudimentary keyword matching that misses qualified candidates or lets unqualified applicants slip through. IntelliHire bridges this gap by combining:
- **Cloud Resume Storage & Parsing**: Secure resume ingestion (PDF and DOCX) via Cloudinary with short-lived signed URLs.
- **LLM-Powered Semantic Matching**: Microservice-driven skill extraction, experience evaluation, and match scoring (0–100%).
- **Recruiter Kanban Pipeline**: Interactive drag-and-drop candidate tracking with automated transactional email notifications via Nodemailer.
- **Candidate Ranking Engine**: Multi-criteria candidate evaluation filtering by AI match score, years of experience, and matched vs. missing skills, with CSV export.
- **Interactive Visual Analytics**: Recruiter dashboard with live KPI cards, visual pipeline funnel progress bar, candidate inflow stream, and in-demand skills cloud.
- **Modern Candidate Experience**: Job search with instant debounced filtering, zero-layout-shift shimmer skeletons, dynamic profile strength progress meter (0–100%), and 4-step interactive application timeline.
- **Responsive Design System**: Curated typography (Plus Jakarta Sans & Inter), cohesive Indigo/Violet palette (`#4F46E5`, `#7C3AED`), mobile-responsive navigation drawers, and a unified global Toast system.

---

## 🏛️ System Architecture

```text
                           ┌────────────────────────┐
                           │   Frontend (React/Vite)│
                           │   Port: 5173           │
                           └───────────┬────────────┘
                                       │ HTTP / REST
                                       ▼
                           ┌────────────────────────┐
                           │   Backend (Express 5)  │
                           │   Port: 5000           │
                           └─────┬───────┬───────┬──┘
                                 │       │       │
       ┌─────────────────────────┘       │       └────────────────────────┐
       ▼                                 ▼                                ▼
┌──────────────┐             ┌──────────────────────┐             ┌──────────────┐
│MongoDB Atlas │             │ Cloudinary Storage   │             │ AI Service   │
│  Database    │             │  Resumes (PDF/DOCX)  │             │  (FastAPI)   │
└──────────────┘             └──────────────────────┘             │  Port: 8000  │
                                                                  └──────────────┘
```

---

## 👥 Team Structure & Ownership

| Member | Role | Key Responsibilities |
| :--- | :--- | :--- |
| **M1** | **Lead & Backend Architect** | Core Express 5 REST API, JWT auth & RBAC, Job lifecycle, Candidate Ranking Engine, Async background workers, Swagger API documentation, Cloudinary storage integration, Multer file parsing, Nodemailer triggers. |
| **M3** | **AI Engineer** | Python FastAPI microservice, text extraction (`pypdf`, `mammoth`), and OpenAI semantic match scoring & skill extraction. |
| **M4** | **Frontend Lead** | Recruiter Portal: Executive dashboard with funnel analytics, interactive Kanban drag-and-drop pipeline, AI candidate ranking superpowers with skill comparison modal & CSV export, responsive sidebar drawer. |
| **M5** | **Frontend Developer / QA** | Applicant Portal: Public job board with debounced search & filters, application submission form with resume uploader, 4-step status timeline tracker, candidate profile strength meter, responsive mobile navigation. |

---

## 🚀 Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Recruiter**: Recruiter signup/login, multi-tenant job requisition management, candidate evaluation, pipeline movement, manual AI re-analysis triggers.
- **Applicant**: Candidate signup/login, live job search, application submission with resume upload, and real-time status tracking.

### 2. Recruiter Portal & Executive Dashboard
- **Visual Funnel Analytics**: Multi-segment visual pipeline progress bar with proportional stage breakdown (`Applied`, `Shortlisted`, `Interview`, `Offered`, `Rejected`).
- **Real-Time KPI Cards**: Total Active Jobs, Inflow Volume, Candidates Shortlisted, and Top AI Match Rate with month-over-month growth indicators.
- **Candidate Inflow Stream**: Chronological feed of recent applicants with one-click quick review links.
- **Top In-Demand Skills Cloud**: Aggregated skill frequency badges extracted from active job requisitions.
- **Quick Action Bar**: Instant shortcuts to Post Job, Pipeline Kanban, and Candidate Rankings.

### 3. Pipeline Kanban Board
- **Interactive Drag-and-Drop**: Visual stage columns with volume indicators and color accents.
- **Live Candidate Search**: Instant client-side filtering across all pipeline columns by candidate name, email, or job title.
- **Recruiter Scoping**: Strict isolation ensuring recruiters only view candidates for their own job requisitions.
- **Interview Scheduling Dialog**: Direct interview note and schedule trigger from the board.

### 4. AI Candidate Ranking Engine & Superpowers
- **Semantic Match Scoring**: AI microservice scores candidates from 0 to 100% against job requirements.
- **Interactive Score Filters**: Quick filter chips (`All`, `Top 80%+`, `Qualified 60–79%`, `< 60%`).
- **AI Skill Comparison Modal**: Side-by-side breakdown of matched skills vs. missing skills, circular match score badge, and AI candidate evaluation summary.
- **CSV Ranking Export**: Instant client-side CSV download of all candidate scores, skills, and application dates.
- **Manual AI Re-Analysis**: Re-trigger LLM evaluation on-demand with live status feedback.

### 5. Candidate Experience & Interactive Tracker
- **Job Board**: Live keyword and skill search with 250ms debouncing, location, and employment type filters.
- **Zero-Layout-Shift Shimmer**: Skeleton placeholders for smooth, flicker-free loading states.
- **4-Step Application Progress Stepper**: Interactive visual milestone tracker (`Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Offered`) with numbered check nodes and activity log.
- **Dynamic Profile Strength Meter**: 0%–100% completion progress bar with actionable tips for candidate profile completion.
- **Celebratory Status Banners**: Contextual banners for candidates when scheduled for interviews or extended offers.

### 6. Design System, Responsive Layouts & Unified Toast System
- **Modern Typography**: Google Fonts (`Plus Jakarta Sans` for headings, `Inter` for body).
- **Harmonious Palette**: Tailored Indigo (`#4F46E5`) and Violet (`#7C3AED`) accents with soft shadows and rounded cards (`16px`).
- **Responsive Drawer Navigation**:
  - Recruiter Portal: Temporary mobile drawer with hamburger toggle + permanent desktop sidebar.
  - Applicant Portal: Collapsible slide-down mobile menu with profile monogram badge and quick links.
- **Unified Global Toast Provider**: Centralized `ToastProvider` (`useToast` hook) with slide animations replacing scattered snackbar boilerplate.

### 7. Resume Processing & Storage
- Multer memory buffer ingestion with strict MIME validation (`application/pdf`, `.docx`, `.doc`) and 5MB size limit.
- Direct streaming to Cloudinary cloud storage with 15-minute expiring signed URLs for document privacy.

### 8. Asynchronous AI Match Engine
- Non-blocking background worker with exponential backoff (up to 3 retries) communicating with the Python AI microservice.
- Generates match score (0–100), identified skills, missing skills, calculated experience years, and candidate summary.

### 9. Transactional Email Notifications
- Automated, responsive HTML emails dispatched via Nodemailer on status updates and interview invitations.

---

## 📁 Repository Structure

```text
IntelliHire/
├── backend/                  # Node.js + Express 5 Core API
│   ├── src/
│   │   ├── config/           # MongoDB Atlas connection & Cloudinary setup
│   │   ├── controllers/      # Auth, Job, Application, and Ranking controllers
│   │   ├── middlewares/      # JWT Protect/Authorize, Multer Upload, Rate Limiters
│   │   ├── models/           # User, Job, Application, and AIAnalysis schemas
│   │   ├── routes/           # Express REST route definitions
│   │   └── services/         # Cloudinary, Nodemailer, and Async AI Worker
│   ├── docs/                 # Swagger / OpenAPI specification
│   ├── tests/                # Jest & Supertest API test suite
│   ├── server.js             # Express app entry point
│   └── package.json
│
├── ai-service/               # Python FastAPI Microservice
│   ├── app/
│   │   ├── main.py           # FastAPI entry points & parsing endpoints
│   │   ├── parser.py         # PyPDF & Mammoth resume text extraction
│   │   └── llm_matcher.py    # LLM semantic matching & score evaluation
│   ├── requirements.txt      # Python dependencies
│   └── tests/
│
└── frontend/                 # React 19 + Vite SPA (Tailwind CSS + MUI)
    ├── src/
    │   ├── components/       # Shared UI components & layouts (MainLayout, Navbar, Sidebar, Footer)
    │   ├── context/          # AuthContext, ToastContext (useToast hook)
    │   ├── features/         # Modular applicant features (jobs, applications, profile, auth)
    │   ├── pages/            # Recruiter & Applicant views (Dashboard, Jobs, Kanban, Ranking, JobBoard, etc.)
    │   ├── services/         # Axios API clients
    │   ├── theme/            # MUI design system tokens & typography
    │   └── utils/            # Formatters & helpers
    ├── index.html            # Google Fonts & viewport meta
    └── package.json
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB Atlas** account (or local MongoDB instance)
- **Cloudinary** account
- **SMTP Provider** (e.g., Mailtrap, Gmail, or SendGrid)
- **OpenAI API Key** (for AI semantic resume matching)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email Configuration
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

Start the backend server:

```bash
# Development mode with Nodemon
npm run dev

# Run test suite
npm test
```

---

### 2. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in `ai-service/`:

```env
OPENAI_API_KEY=your_openai_api_key
```

Run the FastAPI service:

```bash
uvicorn app.main:app --reload --port 8000
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at: `http://localhost:5173`

To build the production bundle:

```bash
npm run build
```

---

## 📖 API Documentation

Interactive Swagger documentation is available when running the backend:
- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Core Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register candidate or recruiter account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/profile` | Authenticated | Retrieve current user profile details |
| `PUT` | `/api/auth/profile` | Candidate | Update candidate profile & skills |
| `GET` | `/api/jobs` | Public | Fetch active jobs with keyword/skill search & pagination |
| `POST` | `/api/jobs` | Recruiter | Create a new job requisition |
| `PUT` | `/api/jobs/:id` | Recruiter | Update job requisition details |
| `PATCH`| `/api/jobs/:id/archive` | Recruiter | Soft-delete / archive job posting |
| `POST` | `/api/applications` | Applicant | Submit job application with resume file upload |
| `GET` | `/api/applications/me` | Applicant | Retrieve logged-in applicant's submission history |
| `GET` | `/api/applications/:id` | Applicant / Recruiter | Retrieve application details & timeline |
| `GET` | `/api/applications/job/:jobId` | Recruiter | Retrieve all candidate applications for a specific job |
| `PATCH`| `/api/applications/:id/status` | Recruiter | Move application stage & trigger automated email |
| `GET` | `/api/applications/:id/resume` | Recruiter / Owner | Generate 15-minute expiring signed resume view link |
| `GET` | `/api/applications/:id/analysis` | Recruiter | Retrieve AI evaluation results for an application |
| `POST` | `/api/applications/:id/reanalyze` | Recruiter | Manually re-trigger AI parsing worker |
| `GET` | `/api/rankings/job/:jobId` | Recruiter | Retrieve candidates ranked by AI score and experience |

---

## 🔒 Security & Best Practices

- **Role-Based Protection**: Route-level JWT verification with fine-grained recruiter/applicant role enforcement.
- **Resource Ownership Validation**: Recruiters can only modify, view candidates for, or update statuses of their own job postings.
- **Short-Lived Signed Document URLs**: Resumes are kept private; signed download links expire automatically after 15 minutes.
- **Tiered Rate Limiting**: General API rate limiting (100 req/15 min) and strict upload/AI trigger rate limiting (10 req/hour) for cost protection.
- **Graceful Shutdown**: Intercepts `SIGTERM` to safely terminate active MongoDB connections before process exit.
- **Secure File Validation**: Multer memory buffers with strict magic-number and MIME verification preventing arbitrary file uploads.
- **Error Boundaries & Toasts**: Unified error handling and global user notifications with zero console cascading re-render warnings.
