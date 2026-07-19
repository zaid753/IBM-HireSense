# API Reference

HireSense AI provides a secure, RESTful API built with FastAPI. Complete interactive documentation is available at `/api/v1/docs` (Swagger UI) when the backend is running.

## Authentication
All protected endpoints require a JWT token in the Authorization header: `Bearer <token>`.

- `POST /api/v1/auth/login` - Authenticate and receive JWT.
- `POST /api/v1/auth/register` - Create a new recruiter account.

## Resumes
- `POST /api/v1/resume/upload` - Upload a PDF/DOCX resume (max 5MB).
- `GET /api/v1/resume` - List all uploaded resumes.
- `POST /api/v1/resume/parse/{id}` - Trigger the AI intelligence engine to extract structured JSON data.

## Jobs
- `POST /api/v1/job` - Create a new Job Description.
- `GET /api/v1/job` - List all active jobs.

## Candidates & ATS
- `POST /api/v1/candidate/rank/{job_id}` - Calculate ATS scores and rank all parsed candidates against a specific job description.
- `GET /api/v1/candidate/{id}` - Retrieve candidate details and analysis.

## Health & Analytics
- `GET /api/v1/health` - Advanced system health check.
- `GET /api/v1/analytics/dashboard` - Get system-wide platform metrics.
