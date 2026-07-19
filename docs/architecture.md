# SkillLens — Architecture

## System Architecture Diagram

```mermaid
graph TB
    subgraph Client["🌐 Client Browser"]
        UI["React 18 SPA<br/>Vite + Tailwind CSS"]
    end

    subgraph Docker["🐳 Docker Compose Network"]
        subgraph FE["Frontend Container"]
            NGINX["Nginx 1.27<br/>Static Files + SPA Routing<br/>Port 80 → 3000"]
        end

        subgraph BE["Backend Container"]
            UVICORN["Uvicorn ASGI Server<br/>Port 8000"]
            FASTAPI["FastAPI Application"]

            subgraph Services["Service Layer"]
                PARSER["Parser Service<br/>PDF + Text Extraction"]
                AI["AI Service<br/>Azure OpenAI Client"]
                COMPARE["Comparison Service<br/>Skill Normalization"]
                VERDICT["Verdict Service<br/>Deterministic + AI"]
            end

            subgraph Core["Core"]
                CONFIG["Config<br/>Pydantic Settings"]
                ERRORS["Exception Handlers"]
                SCHEMAS["Pydantic Schemas"]
            end
        end
    end

    subgraph External["☁️ External Services"]
        AZURE["Azure OpenAI<br/>GPT-4o"]
    end

    UI -->|"Axios POST<br/>multipart/form-data"| NGINX
    NGINX -->|"Reverse proxy<br/>(dev: direct)"| UVICORN
    UVICORN --> FASTAPI
    FASTAPI --> PARSER
    FASTAPI --> AI
    FASTAPI --> COMPARE
    FASTAPI --> VERDICT
    AI -->|"HTTPS<br/>JSON mode"| AZURE
    VERDICT --> AI
    VERDICT --> COMPARE

    CONFIG -.-> FASTAPI
    CONFIG -.-> AI
    ERRORS -.-> FASTAPI
    SCHEMAS -.-> FASTAPI

    style Client fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
    style Docker fill:#0f172a,stroke:#2563eb,color:#e2e8f0
    style FE fill:#1e3a5f,stroke:#38bdf8,color:#e2e8f0
    style BE fill:#1e3a5f,stroke:#38bdf8,color:#e2e8f0
    style External fill:#1a1a2e,stroke:#8b5cf6,color:#e2e8f0
    style Services fill:#172554,stroke:#60a5fa,color:#e2e8f0
    style Core fill:#172554,stroke:#60a5fa,color:#e2e8f0
```

---

## Request Flow

### Skill Gap Analysis (`POST /api/v1/skill-gap`)

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as FastAPI
    participant Parser as Parser Service
    participant AI as AI Service
    participant Azure as Azure OpenAI
    participant Compare as Comparison Service

    User->>Frontend: Upload resume + JD<br/>(PDF or text)
    Frontend->>API: POST /api/v1/skill-gap<br/>multipart/form-data

    API->>Parser: Resolve inputs
    Parser-->>API: Extracted text

    API->>AI: extract_skills(resume_text)
    AI->>Azure: Chat Completion<br/>(JSON mode)
    Azure-->>AI: {"skills": [...]}
    AI-->>API: resume_skills[]

    API->>AI: extract_skills(jd_text)
    AI->>Azure: Chat Completion<br/>(JSON mode)
    Azure-->>AI: {"skills": [...]}
    AI-->>API: jd_skills[]

    API->>Compare: compare_skills(resume, jd)
    Note over Compare: Normalize aliases<br/>Set intersection/difference<br/>Calculate percentage
    Compare-->>API: SkillGapResult

    API-->>Frontend: APIResponse{success, data}
    Frontend-->>User: Render radial gauge<br/>+ skill chips
```

### Fit Verdict (`POST /api/v1/fit-verdict`)

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as FastAPI
    participant Parser as Parser Service
    participant AI as AI Service
    participant Azure as Azure OpenAI
    participant Compare as Comparison Service
    participant Verdict as Verdict Service

    User->>Frontend: Upload resume + JD
    Frontend->>API: POST /api/v1/fit-verdict

    API->>Parser: Resolve inputs
    Parser-->>API: Extracted text

    API->>AI: extract_skills(resume)
    AI->>Azure: Chat Completion
    Azure-->>AI: resume_skills[]

    API->>AI: extract_skills(jd)
    AI->>Azure: Chat Completion
    Azure-->>AI: jd_skills[]

    API->>Compare: compare_skills(resume, jd)
    Compare-->>API: SkillGapResult

    API->>Verdict: get_verdict(matched, missing, %)
    Verdict->>Verdict: Compute deterministic verdict
    Verdict->>AI: generate_verdict(comparison_data)
    AI->>Azure: Chat Completion<br/>(JSON mode)
    Azure-->>AI: {"verdict": "...", "reasons": [...]}
    AI-->>Verdict: AI verdict + reasons

    alt AI verdict contradicts deterministic by >1 tier
        Verdict->>Verdict: Fallback to deterministic
    end

    Verdict-->>API: FitVerdictResult

    API-->>Frontend: APIResponse{success, data}
    Frontend-->>User: Render verdict badge<br/>+ reasons list
```

---

## Component Architecture (Frontend)

```mermaid
graph TD
    subgraph Entry["Entry Point"]
        Main["main.jsx<br/>BrowserRouter"]
        App["App.jsx<br/>Routes"]
    end

    subgraph Providers["Context Providers"]
        Toast["ToastProvider<br/>Toast notifications"]
        Health["HealthProvider<br/>API health polling"]
    end

    subgraph Pages["Pages"]
        SG["SkillGapPage"]
        FV["FitVerdictPage"]
    end

    subgraph Layout["Layout"]
        Shell["AppShell"]
        Sidebar["Sidebar<br/>Navigation"]
        HI["HealthIndicator"]
    end

    subgraph Analysis["Analysis Components"]
        DIP["DocumentInputPanel<br/>Text + File input"]
        FD["FileDropzone<br/>PDF upload"]
        CC["CharCounter"]
        AB["AnalyzeButton"]
        MPR["MatchPercentageRing<br/>Radial gauge"]
        SC["SkillChip<br/>Matched/Missing"]
        SCL["SkillChipList"]
        VB["VerdictBadge"]
        RL["ReasonsList"]
        RS["ResultsSkeleton"]
    end

    subgraph UI["Reusable UI"]
        Btn["Button"]
        Card["Card"]
        Badge["Badge"]
        Tabs["Tabs"]
        Spinner["Spinner"]
        ES["EmptyState"]
        EB["ErrorBanner"]
    end

    subgraph Hooks["Custom Hooks"]
        UA["useAnalysis"]
        UDI["useDocumentInput"]
    end

    subgraph API["API Layer"]
        Client["axios client<br/>Base URL + interceptors"]
        Service["analysisService<br/>getHealth, analyzeSkillGap,<br/>analyzeFitVerdict"]
    end

    Main --> App
    App --> Toast --> Health --> Shell
    Shell --> Sidebar
    Shell --> Pages
    Sidebar --> HI
    SG --> DIP
    SG --> MPR
    SG --> SCL
    FV --> DIP
    FV --> VB
    FV --> RL
    FV --> MPR
    DIP --> FD
    DIP --> CC
    SCL --> SC
    SG --> UA
    FV --> UA
    DIP --> UDI
    UA --> Service
    Service --> Client

    style Entry fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
    style Providers fill:#1e293b,stroke:#8b5cf6,color:#e2e8f0
    style Pages fill:#1e293b,stroke:#10b981,color:#e2e8f0
    style Layout fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style Analysis fill:#1e293b,stroke:#14b8a6,color:#e2e8f0
    style UI fill:#1e293b,stroke:#6366f1,color:#e2e8f0
    style Hooks fill:#1e293b,stroke:#ec4899,color:#e2e8f0
    style API fill:#1e293b,stroke:#f43f5e,color:#e2e8f0
```

---

## Backend Service Layer

```mermaid
graph LR
    subgraph API["API Layer (v1)"]
        A1["/skill-gap"]
        A2["/fit-verdict"]
        A3["/health"]
    end

    subgraph Services["Service Layer"]
        PS["ParserService<br/>• extract_text_from_pdf<br/>• extract_text_from_upload<br/>• validate_text_input"]
        AIS["AIService (Singleton)<br/>• extract_skills<br/>• generate_verdict<br/>• _call_openai (retry)"]
        CS["ComparisonService<br/>• normalize_skill<br/>• compare_skills<br/>• SKILL_ALIASES map"]
        VS["VerdictService<br/>• get_deterministic_verdict<br/>• get_verdict<br/>• _generate_fallback_reasons"]
    end

    subgraph Models["Schemas"]
        SGR["SkillGapResult"]
        FVR["FitVerdictResult"]
        VL["VerdictLabel (Enum)"]
        AR["APIResponse (Generic)"]
    end

    A1 --> PS
    A1 --> AIS
    A1 --> CS
    A2 --> PS
    A2 --> AIS
    A2 --> CS
    A2 --> VS
    VS --> AIS

    CS --> SGR
    VS --> FVR
    VS --> VL

    style API fill:#172554,stroke:#3b82f6,color:#e2e8f0
    style Services fill:#172554,stroke:#10b981,color:#e2e8f0
    style Models fill:#172554,stroke:#f59e0b,color:#e2e8f0
```

---

## Docker Architecture

```mermaid
graph TB
    subgraph Host["Host Machine"]
        subgraph DC["docker-compose.yml"]
            subgraph FE["Frontend Container<br/>(skilllens-frontend)"]
                N["Nginx 1.27-alpine"]
                DIST["dist/ (Vite build)"]
            end

            subgraph BE["Backend Container<br/>(skilllens-backend)"]
                PY["Python 3.11-slim"]
                UV["Uvicorn (2 workers)"]
                APP["FastAPI App"]
            end

            NET["Bridge Network<br/>(skilllens-network)"]
        end

        ENV[".env files<br/>(mounted at runtime)"]
    end

    Internet["🌐 Internet"] -->|":3000"| N
    Internet -->|":8000"| UV
    N --> DIST
    UV --> APP
    APP -->|"HTTPS"| AZURE["☁️ Azure OpenAI"]
    FE ---|NET| BE
    ENV -.->|"env_file"| BE

    style Host fill:#0f172a,stroke:#2563eb,color:#e2e8f0
    style DC fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
    style FE fill:#172554,stroke:#38bdf8,color:#e2e8f0
    style BE fill:#172554,stroke:#38bdf8,color:#e2e8f0
```

### Image Sizes (Approximate)

| Image | Base | Estimated Size |
|---|---|---|
| Backend | `python:3.11-slim` | ~180 MB |
| Frontend | `nginx:1.27-alpine` | ~25 MB |

---

## Key Design Patterns

| Pattern | Where | Why |
|---|---|---|
| **App Factory** | `main.py:create_app()` | Configurable FastAPI instance creation |
| **Singleton** | `ai_service.get_ai_service()` | Single OpenAI client reused across requests |
| **Generic Envelope** | `APIResponse[T]` | Consistent response shape for all endpoints |
| **Deterministic Fallback** | `verdict_service.py` | AI failures don't break the user experience |
| **Alias Normalization** | `comparison_service.py` | Handles common skill abbreviations |
| **Context Providers** | React `ToastProvider`, `HealthProvider` | Global state without prop drilling |
| **Custom Hooks** | `useAnalysis`, `useDocumentInput` | Reusable stateful logic |
