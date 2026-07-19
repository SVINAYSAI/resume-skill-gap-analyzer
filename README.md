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

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS 3 |
| **Backend**  | FastAPI + Pydantic v2 + Uvicorn     |
| **AI**       | Azure OpenAI — GPT-4o              |
| **PDF**      | PyMuPDF (fitz)                      |
| **Docker**   | Multi-stage builds + Docker Compose |

---

## Quick Start — Docker (Recommended)

```bash
# 1. Clone and configure
git clone <repository-url>
cd Techotilst_Fullstack_AI_ML
cp backend/.env.example backend/.env
# Edit backend/.env with your Azure OpenAI credentials

# 2. Build and run
docker compose up --build

# 3. Open http://localhost:3000
```

| Service | URL |
|---|---|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| Swagger Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |

## Quick Start — Manual Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows (source venv/bin/activate for Linux/Mac)
pip install -r requirements.txt
cp .env.example .env         # Edit with your Azure OpenAI credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                  # Opens at http://localhost:5173
```

---

## Documentation

| Document | Description |
|---|---|
| 📖 [**Full README**](docs/README.md) | Comprehensive setup, assumptions, trade-offs, and environment variables |
| 🏗️ [**Architecture**](docs/architecture.md) | System diagrams, request flows, component hierarchy, and design patterns |
| 📡 [**API Reference**](docs/api.md) | Endpoint documentation, request/response schemas, error codes, and cURL examples |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check — returns API status and model info |
| `POST` | `/api/v1/skill-gap` | Skill Gap Analysis — matched/missing skills + percentage |
| `POST` | `/api/v1/fit-verdict` | Fit Verdict — verdict label + 3 supporting reasons |

---

## Project Structure

```
├── backend/                    # FastAPI + Azure OpenAI
│   ├── app/                    # Application source
│   ├── tests/                  # Unit tests
│   ├── Dockerfile              # Multi-stage production build
│   └── requirements.txt
├── frontend/                   # React + Vite + Tailwind
│   ├── src/                    # Components, pages, hooks, API client
│   ├── Dockerfile              # Multi-stage Nginx build
│   └── nginx.conf              # SPA routing config
├── docs/                       # Documentation
│   ├── architecture.md         # Architecture diagrams
│   └── api.md                  # API reference
├── docker-compose.yml          # Orchestrates both services
├── README.md                   # Comprehensive README
└── .gitignore
```

---

## License

This project was built as a take-home assignment and is not licensed for production use.
