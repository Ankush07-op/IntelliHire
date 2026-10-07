# IntelliHire — AI-Powered Applicant Tracking System (ATS)

IntelliHire is a full-stack recruitment platform designed to automate resume screening, candidate ranking, and hiring pipeline management using AI-driven semantic match scoring and automated recruiter workflows.

---

## 📌 Project Overview

Traditional applicant tracking systems rely on basic keyword matching that misses qualified candidates or lets unqualified applicants slip through. IntelliHire bridges this gap by combining:
- **Cloud Resume Storage & Parsing**: Secure resume ingestion (PDF and DOCX) via Cloudinary.
- **LLM-Powered Semantic Matching**: Microservice-driven skill extraction, experience evaluation, and match scoring.
- **Recruiter Kanban Pipeline**: Interactive candidate tracking with automated transactional email notifications.
- **Candidate Ranking Engine**: Multi-criteria candidate filtering by AI match score, years of experience, and matched skills.

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
| **M1** | **Lead & Backend Architect** | Core Express API, JWT auth & RBAC, Job lifecycle, Candidate Ranking Engine, Async background workers, Swagger API documentation, Cloudinary storage integration, Multer file parsing, Nodemailer triggers. |
| **M3** | **AI Engineer** | Python FastAPI microservice, text extraction (`pypdf`, `mammoth`), and OpenAI/Gemini semantic match scoring. |
| **M4** | **Frontend Lead** | Recruiter Portal: Management dashboard, interactive Kanban drag-and-drop pipeline, and candidate ranking filters. |
| **M5** | **Frontend Developer / QA** | Applicant Portal: Public job board, application submission form with resume upload, applicant tracking, and testing. |

---

## 🚀 Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Recruiter**: Job posting, pipeline management, applicant evaluation, candidate ranking, and re-triggering AI evaluations.
- **Applicant**: Job browsing, one-click application submission with resume upload, and application status tracking.

### 2. Job Lifecycle Management
- Job creation, editing, soft-delete archiving, and public paginated listings with keyword/skill search.

### 3. Resume Processing & Storage
- Multer memory buffer ingestion with strict filetype validation (`application/pdf`, `.docx`, `.doc`) and 5MB size limit.
- Direct streaming to Cloudinary cloud storage with expiring signed URLs for secure access.

### 4. Asynchronous AI Match Engine
- Non-blocking background worker with exponential backoff (up to 3 retries) communicating with the Python AI microservice.
- Generates match score (0–100), identified skills, missing skills, calculated experience years, and a candidate summary.

### 5. Candidate Ranking Engine
- Dynamically ranks candidates per job posting based on AI match score and verified experience.
- Supports multi-variable filters: `minScore`, `maxScore`, `minExperience`, and specific skill keywords.

### 6. Pipeline Automation & Email Notifications
- Recruiter status transitions (`Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Offered` ➔ `Rejected`).
- Automated, styled transactional HTML emails dispatched via Nodemailer on status updates and interview schedule dispatches.

---

## 📁 Repository Structure

```text
IntelliHire/
├── backend/                  # Node.js + Express 5 Core API
│   ├── src/
│   │   ├── config/           # MongoDB Atlas Mongoose connection
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
└── frontend/                 # React 19 + Vite SPA
    ├── src/
    │   ├── components/       # Shared UI components (MUI)
    │   ├── pages/            # Recruiter & Applicant views
    │   └── services/         # Axios API clients
    └── package.json
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account
- **SMTP Provider** (e.g., Mailtrap, Gmail, or SendGrid)

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

---

## 📖 API Documentation

Interactive Swagger documentation is available when running the backend:
- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Core Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register candidate or recruiter account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT |
| `GET` | `/api/jobs` | Public | Fetch active jobs with keyword/skill search & pagination |
| `POST` | `/api/jobs` | Recruiter | Create a new job requisition |
| `PUT` | `/api/jobs/:id` | Recruiter | Update job requisition details |
| `PATCH`| `/api/jobs/:id/archive` | Recruiter | Soft-delete / archive job posting |
| `POST` | `/api/applications` | Applicant | Submit job application with resume file upload |
| `GET` | `/api/applications/me` | Applicant | Retrieve logged-in applicant's submission history |
| `GET` | `/api/applications/job/:jobId` | Recruiter | Retrieve all candidate applications for a specific job |
| `PATCH`| `/api/applications/:id/status` | Recruiter | Move application stage & trigger automated email |
| `GET` | `/api/applications/:id/resume` | Recruiter / Owner | Generate 15-minute expiring signed resume view link |
| `GET` | `/api/rankings/job/:jobId` | Recruiter | Retrieve candidates ranked by AI score and experience |
| `POST` | `/api/applications/:id/reanalyze` | Recruiter | Manually re-trigger AI parsing worker |

---

## 🔒 Security & Best Practices

- **Role-Based Protection**: Route-level JWT verification with fine-grained recruiter/applicant role enforcement.
- **Resource Ownership Validation**: Recruiters can only modify, view candidates for, or update statuses of their own job postings.
- **Short-Lived Signed Document URLs**: Resumes are kept private; signed download links expire automatically after 15 minutes.
- **Tiered Rate Limiting**: General API rate limiting (100 req/15 min) and strict upload/AI trigger rate limiting (10 req/hour) for cost protection.
- **Graceful Shutdown**: Intercepts `SIGTERM` to safely terminate active MongoDB connections before process exit.
