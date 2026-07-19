# Architecture & System Design

HireSense AI is built on a modern, decoupled architecture designed for scale, performance, and seamless AI integration.

## High-Level Architecture

The system consists of three primary layers:
1. **Frontend (Client Layer)**: React 19 SPA built with Vite, styled with TailwindCSS, and state managed by Zustand/React Query.
2. **Backend (API Layer)**: FastAPI (Python 3.11) handling business logic, authentication, and communication with the database.
3. **Intelligence Layer**: Specialized micro-services within the backend handling Resume Parsing (PyMuPDF, spaCy), Semantic Matching (Sentence-Transformers), and generative logic (Gemini API).

```mermaid
graph TD
    Client[Client (React/Vite)] -->|REST API| API[FastAPI Backend]
    API -->|Read/Write| DB[(PostgreSQL)]
    API -->|Auth| JWT[JWT Authentication]
    API -->|Parse| ResumeEngine[Resume Intelligence Engine]
    ResumeEngine -->|NLP| spaCy[spaCy NER]
    ResumeEngine -->|Embeddings| SentenceTransformers[Sentence-Transformers]
    ResumeEngine -->|Generative AI| Gemini[Gemini Pro]
```

## ATS Scoring Workflow

The ATS calculation involves multiple weighted dimensions to generate a unified match score.

```mermaid
sequenceDiagram
    participant Recruiter
    participant Backend
    participant DB
    participant AI Engine

    Recruiter->>Backend: Select Candidate & Job
    Backend->>DB: Fetch Resume JSON & Job Description
    Backend->>AI Engine: Calculate Semantic Similarity (Embeddings)
    Backend->>AI Engine: Extract Skill Overlap (NER)
    Backend->>AI Engine: Calculate Experience Match (Years)
    AI Engine-->>Backend: Return Individual Scores
    Backend->>Backend: Apply Weighted Algorithm
    Backend-->>Recruiter: Return Unified ATS Score (0-100)
```

## Deployment Architecture

The application is deployed across managed serverless platforms.

```mermaid
graph LR
    User((User)) -->|HTTPS| Vercel[Vercel Edge Network]
    Vercel -->|Static Assets| Frontend[React SPA]
    Frontend -->|API Requests| Render[Render Web Service]
    Render -->|Queries| PostgreSQL[(Render Managed DB)]
```
