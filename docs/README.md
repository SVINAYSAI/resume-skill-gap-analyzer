<div align="center">

# SkillLens — AI-Powered Resume Analysis

> Compare candidate resumes against job descriptions using AI to identify skill gaps and generate fit verdicts.

Built as a take-home assignment for **Techotlist Connects LLP** — two AI-powered features in one application.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)

</div>

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start — Docker (Recommended)](#quick-start--docker-recommended)
- [Quick Start — Manual Setup](#quick-start--manual-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Architecture Decisions & Trade-offs](#architecture-decisions--trade-offs)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Testing](#testing)
- [v2 Roadmap](#v2-roadmap)
- [License](#license)

---

## Features

### Assignment 1: Skill Gap Checker (`/skill-gap`)
- Extracts skills from resume and job description using Azure OpenAI (GPT-4o)
- Computes matched skills, missing skills, and match percentage
- Visual radial gauge with color-coded thresholds
- Animated skill chips for matched (teal) and missing (amber) skills

### Assignment 2: Fit Verdict (`/fit-verdict`)
- Generates a qualification verdict: **Qualified** / **Almost There** / **Not Yet**
- Three concise, evidence-backed reasons supporting the verdict
- Deterministic fallback thresholds for reliability (≥75% Qualified, 40–74% Almost There, <40% Not Yet)
- Skills breakdown with match percentage

---

## Architecture

> See the full architecture diagram at [`docs/architecture.md`](./architecture.md)

```
┌─────────────────────────┐       HTTP        ┌──────────────────────────────┐
│     React Frontend      │ ◄──────────────── │     Nginx (Docker only)      │
│  Vite + Tailwind CSS    │                   │   Static files + SPA routing │
│  Port: 5173 (dev)       │                   │   Port: 3000 (prod)          │
└────────┬────────────────┘                   └──────────────────────────────┘
         │  Axios POST
         │  multipart/form-data
         ▼
┌─────────────────────────┐       HTTPS       ┌──────────────────────────────┐
│   FastAPI Backend       │ ─────────────────► │     Azure OpenAI (GPT-4o)   │
│   Uvicorn ASGI          │                   │   Skill Extraction           │
│   Port: 8000            │                   │   Verdict Generation         │
└─────────────────────────┘                   └──────────────────────────────┘
```

---

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS 3 |
| **Backend**  | FastAPI + Pydantic v2 + Uvicorn     |
| **AI**       | Azure OpenAI — GPT-4o              |
| **PDF**      | PyMuPDF (fitz)                      |
| **Routing**  | React Router v6                     |
| **Icons**    | Lucide React                        |
| **HTTP**     | Axios (frontend) / OpenAI SDK (backend) |
| **Docker**   | Multi-stage builds + Docker Compose |

---

## Prerequisites

| Requirement | Min Version | Purpose |
|---|---|---|
| Docker + Docker Compose | 20.10+ / v2 | Container orchestration |
| _or_ Python | 3.11+ | Backend (manual setup) |
| _or_ Node.js | 18+ | Frontend (manual setup) |
| Azure OpenAI API Key | — | Required for AI features |

---

## Quick Start — Docker (Recommended)

**1. Clone and configure:**
```bash
git clone <repository-url>
cd Techotilst_Fullstack_AI_ML

# Copy and edit backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your Azure OpenAI credentials
```

**2. Build and run:**
```bash
docker compose up --build
```

**3. Access the app:**

| Service | URL |
|---|---|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| Swagger Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| ReDoc | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

**4. Stop:**
```bash
docker compose down
```

> **Customize ports:** Set `BACKEND_PORT` and `FRONTEND_PORT` environment variables before running `docker compose up`.

---

## Quick Start — Manual Setup

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Azure OpenAI credentials

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — defaults to localhost:8000)
cp .env.example .env

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `AZURE_OPENAI_API_KEY` | ✅ | — | Your Azure OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | ✅ | `https://vinay-mali-openai.services.ai.azure.com/` | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_DEPLOYMENT` | ❌ | `gpt-4o` | Model deployment name |
| `AZURE_OPENAI_API_VERSION` | ❌ | `2024-12-01-preview` | API version |
| `CORS_ORIGINS` | ❌ | `http://localhost:5173,http://localhost:3000` | Comma-separated allowed origins |
| `MAX_FILE_SIZE_MB` | ❌ | `5` | Maximum upload file size in MB |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | ❌ | `http://localhost:8000` | Backend API base URL |

---

## API Reference

> See full API documentation at [`docs/api.md`](./api.md)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check — returns API status and model info |
| `POST` | `/api/v1/skill-gap` | Skill Gap Analysis — matched/missing skills + percentage |
| `POST` | `/api/v1/fit-verdict` | Fit Verdict — verdict label + 3 supporting reasons |

Both `POST` endpoints accept `multipart/form-data`:
- `resume_text` (string) or `resume_file` (PDF upload)
- `jd_text` (string) or `jd_file` (PDF upload)

Interactive docs available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

---

## Project Structure

```
Techotilst_Fullstack_AI_ML/
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI app factory
│   │   ├── core/
│   │   │   ├── config.py                # Pydantic settings from .env
│   │   │   └── exceptions.py            # Custom exceptions + global handler
│   │   ├── schemas/
│   │   │   └── analysis.py              # Request/response models + API envelope
│   │   ├── services/
│   │   │   ├── ai_service.py            # Azure OpenAI client (extract + verdict)
│   │   │   ├── parser_service.py        # PDF + text extraction with validation
│   │   │   ├── comparison_service.py    # Skill normalization + set comparison
│   │   │   └── verdict_service.py       # Deterministic + AI verdict with fallback
│   │   └── api/v1/
│   │       ├── analysis.py              # /skill-gap and /fit-verdict routes
│   │       └── health.py               # /health route
│   ├── tests/
│   │   └── test_comparison.py           # Unit tests for comparison logic
│   ├── Dockerfile                       # Multi-stage backend image
│   ├── .dockerignore
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                         # Axios client + analysis service
│   │   ├── components/
│   │   │   ├── ui/                      # Button, Card, Toast, Badge, etc.
│   │   │   ├── layout/                  # AppShell, Sidebar, HealthIndicator
│   │   │   └── analysis/               # SkillChip, MatchRing, VerdictBadge
│   │   ├── context/                     # Toast + Health context providers
│   │   ├── hooks/                       # useAnalysis, useDocumentInput
│   │   ├── pages/                       # SkillGapPage, FitVerdictPage
│   │   ├── utils/                       # Constants, validation, formatting
│   │   ├── App.jsx                      # Root component with routing
│   │   └── main.jsx                     # Entry point with BrowserRouter
│   ├── Dockerfile                       # Multi-stage frontend image (Nginx)
│   ├── .dockerignore
│   ├── nginx.conf                       # SPA routing + gzip config
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── README.md                        # ← You are here
│   ├── architecture.md                  # Architecture diagram + explanation
│   └── api.md                           # Full API documentation
├── docker-compose.yml                   # Orchestrates both services
└── .gitignore
```

---

## Architecture Decisions & Trade-offs

### 1. Separate API Endpoints
**Decision:** `/skill-gap` and `/fit-verdict` are independent endpoints, each performing their own AI extraction.

**Trade-off:** This means two AI calls if a user runs both analyses on the same documents. We chose isolation and testability over efficiency. A production system would cache extraction results.

### 2. Deterministic Verdict Fallback
**Decision:** A threshold-based verdict is computed alongside the AI verdict. If they contradict by more than one tier, the system falls back to the deterministic result.

**Trade-off:** This prevents embarrassing inconsistencies during a live demo (e.g., 90% match labeled "Not Yet"), but may occasionally override a nuanced AI judgment.

### 3. Skill Normalization via Alias Map
**Decision:** ~40 hardcoded aliases (JS→JavaScript, K8s→Kubernetes) resolve common abbreviations before set-based comparison.

**Trade-off:** Fast and predictable, but cannot handle synonyms not in the map. A production system would use embedding-based semantic similarity.

### 4. Azure OpenAI with JSON Mode
**Decision:** `response_format: json_object` ensures structured output. On JSON parse failure, the service retries with a stricter system prompt.

**Trade-off:** Tightly coupled to Azure OpenAI's API. Switching providers would require adapter changes.

### 5. No Component Library (Custom UI)
**Decision:** All UI components are built from scratch with Tailwind CSS.

**Trade-off:** More development effort, but produces a distinctive design that stands out from generic component library submissions.

### 6. Multi-stage Docker Builds
**Decision:** Both frontend and backend use multi-stage Docker builds with non-root users.

**Trade-off:** Slightly more complex Dockerfiles, but production images are smaller and more secure.

---

## Assumptions

1. **Azure OpenAI access** — The user has a valid Azure OpenAI API key with a GPT-4o deployment
2. **PDF resumes** — Most resumes are text-based PDFs (not scanned images); OCR is not supported
3. **English language** — Skill extraction prompts are English-only
4. **Single-user** — No authentication, no concurrent session management
5. **Stateless** — No database; results are not persisted between requests
6. **Modern browsers** — Frontend targets latest Chrome, Firefox, Safari, Edge
7. **Docker networking** — Docker Compose runs both services on the same bridge network
8. **API key security** — In Docker mode, API keys are injected via `.env` file (not baked into images)

---

## Known Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| **No DOCX support** | Users must use PDF or paste text | v2 roadmap: python-docx integration |
| **Hardcoded skill aliases** (~40) | Unrecognized abbreviations won't match | Embedding-based matching in v2 |
| **No authentication** | Anyone with the URL can access | Add Firebase Auth or JWT |
| **No persistence** | Results lost on page refresh | Add MySQL/PostgreSQL in v2 |
| **No rate limiting** | Relies on Azure's built-in limits | Add FastAPI rate limiter middleware |
| **No OCR** | Scanned PDFs return empty text | Integrate Tesseract or Azure Form Recognizer |

---

## Testing

### Run Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Test Coverage
```bash
cd backend
python -m pytest tests/ -v --cov=app --cov-report=term-missing
```

### Manual API Testing
```bash
# Health check
curl http://localhost:8000/api/v1/health

# Skill gap analysis (text input)
curl -X POST http://localhost:8000/api/v1/skill-gap \
  -F "resume_text=Experienced in Python, FastAPI, React, Docker" \
  -F "jd_text=Looking for Python, FastAPI, AWS, Kubernetes, Docker"

# Fit verdict (PDF upload)
curl -X POST http://localhost:8000/api/v1/fit-verdict \
  -F "resume_file=@resume.pdf" \
  -F "jd_file=@job_description.pdf"
```

---

## v2 Roadmap

- [ ] Firebase Authentication (login, signup, OAuth)
- [ ] MySQL/PostgreSQL persistence — save analysis history
- [ ] History page with filtering and search
- [ ] DOCX support via python-docx
- [ ] Embedding-based skill matching (semantic similarity)
- [ ] Deployment to Vercel (frontend) + Azure App Service (backend)
- [ ] Export results as PDF report
- [ ] Rate limiting middleware
- [ ] OCR for scanned PDFs

---

## License

This project was built as a take-home assignment and is not licensed for production use.
