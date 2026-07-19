# SkillLens — API Documentation

> **Base URL:** `http://localhost:8000`
>
> **Interactive Docs:** [Swagger UI](http://localhost:8000/docs) | [ReDoc](http://localhost:8000/redoc)

---

## Table of Contents

- [Response Envelope](#response-envelope)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [GET /api/v1/health](#get-apiv1health)
  - [POST /api/v1/skill-gap](#post-apiv1skill-gap)
  - [POST /api/v1/fit-verdict](#post-apiv1fit-verdict)
- [Schemas](#schemas)
- [Error Codes](#error-codes)
- [Rate Limits](#rate-limits)

---

## Response Envelope

All endpoints return responses wrapped in a standard envelope:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": { ... },
  "errors": []
}
```

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | `true` if the request succeeded |
| `message` | `string` | Human-readable status message |
| `data` | `object \| null` | Response payload (null on error) |
| `errors` | `string[]` | Array of error messages (empty on success) |

### Error Response Example

```json
{
  "success": false,
  "message": "Please provide either resume text or upload a resume file.",
  "data": null,
  "errors": ["Please provide either resume text or upload a resume file."]
}
```

---

## Error Handling

The API uses custom exception classes that map to HTTP status codes:

| Exception | HTTP Status | When |
|---|---|---|
| `ValidationError` | `400` | Missing or invalid input |
| `FileParsingError` | `400` | Unsupported file type, file too large, or corrupt PDF |
| `ExtractionError` | `400` | Extracted text too short or empty |
| `AIServiceError` | `502` | Azure OpenAI call failed after retries |

---

## Endpoints

### GET /api/v1/health

Verify the API is running and correctly configured.

**Request:**
```http
GET /api/v1/health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "model": "gpt-4o",
  "provider": "Azure OpenAI",
  "timestamp": "2026-07-19T14:00:00.000000+00:00"
}
```

**cURL:**
```bash
curl http://localhost:8000/api/v1/health
```

---

### POST /api/v1/skill-gap

Extract skills from a resume and job description, then compute matched skills, missing skills, and match percentage.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `resume_text` | `string` | One of `resume_text` or `resume_file` | Raw resume text (min 20 chars) |
| `resume_file` | `file` | One of `resume_text` or `resume_file` | Resume PDF upload (max 5 MB) |
| `jd_text` | `string` | One of `jd_text` or `jd_file` | Raw job description text (min 20 chars) |
| `jd_file` | `file` | One of `jd_text` or `jd_file` | Job description PDF upload (max 5 MB) |

> **Note:** If both text and file are provided for the same field, the file takes priority.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Skill gap analysis completed in 3200ms",
  "data": {
    "resume_skills": [
      "Python",
      "FastAPI",
      "React",
      "JavaScript",
      "Docker",
      "PostgreSQL",
      "Git"
    ],
    "jd_skills": [
      "Python",
      "FastAPI",
      "React",
      "AWS",
      "Kubernetes",
      "Docker",
      "PostgreSQL"
    ],
    "matched_skills": [
      "Docker",
      "FastAPI",
      "PostgreSQL",
      "Python",
      "React"
    ],
    "missing_skills": [
      "AWS",
      "Kubernetes"
    ],
    "match_percentage": 71.4
  },
  "errors": []
}
```

**Response Fields (`data`):**

| Field | Type | Description |
|---|---|---|
| `resume_skills` | `string[]` | All skills extracted from the resume |
| `jd_skills` | `string[]` | All skills extracted from the job description |
| `matched_skills` | `string[]` | Skills present in both (sorted alphabetically) |
| `missing_skills` | `string[]` | JD skills absent from resume (sorted alphabetically) |
| `match_percentage` | `float` | Percentage of JD skills matched (0–100, 1 decimal) |

**cURL Examples:**

```bash
# Text input
curl -X POST http://localhost:8000/api/v1/skill-gap \
  -F "resume_text=5 years experience in Python, FastAPI, React, Docker, PostgreSQL, Git" \
  -F "jd_text=Looking for a developer with Python, FastAPI, React, AWS, Kubernetes, Docker"

# PDF upload
curl -X POST http://localhost:8000/api/v1/skill-gap \
  -F "resume_file=@/path/to/resume.pdf" \
  -F "jd_file=@/path/to/job_description.pdf"

# Mixed (text resume + PDF JD)
curl -X POST http://localhost:8000/api/v1/skill-gap \
  -F "resume_text=Experienced in Python, React, Docker" \
  -F "jd_file=@/path/to/jd.pdf"
```

---

### POST /api/v1/fit-verdict

Generate a qualification verdict (Qualified / Almost There / Not Yet) with three evidence-backed supporting reasons.

**Request:** `multipart/form-data`

Same input fields as `/skill-gap` (see above).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Fit verdict analysis completed in 4800ms",
  "data": {
    "verdict": "Almost There",
    "reasons": [
      "Strong alignment with core backend technologies including Python, FastAPI, and Docker.",
      "Overall skill match is 71.4% against the job requirements, indicating a solid but incomplete fit.",
      "Missing cloud-native skills AWS and Kubernetes that are critical for the role's infrastructure requirements."
    ],
    "match_percentage": 71.4,
    "matched_skills": [
      "Docker",
      "FastAPI",
      "PostgreSQL",
      "Python",
      "React"
    ],
    "missing_skills": [
      "AWS",
      "Kubernetes"
    ]
  },
  "errors": []
}
```

**Response Fields (`data`):**

| Field | Type | Description |
|---|---|---|
| `verdict` | `string` | One of: `"Qualified"`, `"Almost There"`, `"Not Yet"` |
| `reasons` | `string[]` | Exactly 3 concise, evidence-backed reasons |
| `match_percentage` | `float` | Percentage of JD skills matched (0–100) |
| `matched_skills` | `string[]` | Skills present in both resume and JD |
| `missing_skills` | `string[]` | JD skills absent from resume |

**Verdict Thresholds:**

| Match % | Verdict | Description |
|---|---|---|
| ≥ 75% | `Qualified` | Strong overall alignment |
| 40–74% | `Almost There` | Good foundation, some gaps |
| < 40% | `Not Yet` | Significant skill gaps |

> **Fallback Logic:** If the AI verdict contradicts the deterministic threshold by more than one tier (e.g., AI says "Qualified" at 30% match), the system falls back to the deterministic verdict.

**cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/fit-verdict \
  -F "resume_text=Senior engineer with 5 years in Python, Django, React, Docker, AWS, CI/CD" \
  -F "jd_text=Seeking a full-stack developer: Python, FastAPI, React, TypeScript, AWS, Docker, Kubernetes"
```

---

## Schemas

### VerdictLabel (Enum)

```
"Qualified" | "Almost There" | "Not Yet"
```

### SkillGapResult

```typescript
{
  resume_skills: string[]      // All skills from resume
  jd_skills: string[]          // All skills from JD
  matched_skills: string[]     // Intersection (sorted)
  missing_skills: string[]     // JD - Resume (sorted)
  match_percentage: number     // 0.0 to 100.0
}
```

### FitVerdictResult

```typescript
{
  verdict: VerdictLabel        // Qualification label
  reasons: string[3]           // Exactly 3 reasons
  match_percentage: number     // 0.0 to 100.0
  matched_skills: string[]     // Skills in both
  missing_skills: string[]     // Missing from resume
}
```

### APIResponse\<T\>

```typescript
{
  success: boolean
  message: string
  data: T | null
  errors: string[]
}
```

---

## Error Codes

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide either resume text or upload a resume file.",
  "data": null,
  "errors": ["Please provide either resume text or upload a resume file."]
}
```

Common 400 errors:
- Missing resume or JD input
- File exceeds 5 MB limit
- Unsupported file type (only PDF and plain text)
- Extracted text too short (< 50 chars for files, < 20 chars for text)

### 502 Bad Gateway

```json
{
  "success": false,
  "message": "AI service failed after 2 attempts. Last error: Connection timeout",
  "data": null,
  "errors": ["AI service failed after 2 attempts. Last error: Connection timeout"]
}
```

Returned when Azure OpenAI is unreachable or returns invalid JSON after retries.

---

## Rate Limits

The API does **not** implement its own rate limiting. The following limits apply from Azure OpenAI:

| Resource | Typical Limit |
|---|---|
| Requests per minute | Varies by deployment tier |
| Tokens per minute | Varies by deployment tier |

The frontend sets a 30-second request timeout via the Axios client.

---

## CORS

The backend allows cross-origin requests from origins listed in the `CORS_ORIGINS` environment variable.

**Default allowed origins:**
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Docker frontend)

To add origins, set `CORS_ORIGINS` as a comma-separated list:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

---

## Supported File Types

| MIME Type | Extension | Notes |
|---|---|---|
| `application/pdf` | `.pdf` | Parsed with PyMuPDF (text-based PDFs only) |
| `text/plain` | `.txt` | Decoded as UTF-8 |

Maximum file size: **5 MB** (configurable via `MAX_FILE_SIZE_MB`).
