<div align="center">
  <img src="frontend/public/logo.png" alt="HireSense AI Logo" width="150"/>
  <h1>HireSense AI</h1>
  <p><b>Hire Smarter. Screen Faster. Rank with AI.</b></p>
  <p>An enterprise-grade Applicant Tracking System powered by an intelligent Resume Parsing and Semantic Matching Engine.</p>
</div>

---

## 🚀 Overview

HireSense AI transforms the recruitment process. Instead of manually reading hundreds of resumes, recruiters can upload resumes and job descriptions, and the platform automatically extracts structured data, calculates ATS match scores, and ranks the best candidates.

## ✨ Features

- **Intelligent Parsing**: Extracts skills, experience, and education from PDFs and DOCX files using spaCy and Gemini.
- **Semantic Match Scoring**: Calculates compatibility between resumes and job descriptions using Sentence-Transformers.
- **Candidate Ranking Dashboard**: A highly polished, responsive UI to manage and filter top talent.
- **Enterprise Security**: JWT authentication, rate limiting, and strict file upload validation.
- **Platform Analytics**: Real-time metrics on parsing success, candidate pipelines, and system health.

## 🏗️ System Architecture

```text
HireSense AI
│
├── Frontend (React + TypeScript)
│   ├── Landing Page
│   ├── Dashboard
│   ├── Resume Upload
│   ├── Job Management
│   ├── Candidate Ranking
│   ├── Analytics
│   └── Reports
│
├── Backend (FastAPI)
│   ├── Authentication
│   ├── Resume APIs
│   ├── Job APIs
│   ├── Candidate APIs
│   ├── ATS Engine
│   ├── Ranking Engine
│   ├── Analytics APIs
│   └── Reports APIs
│
├── AI Layer
│   ├── Resume Parser
│   ├── Text Cleaning
│   ├── Skill Extraction
│   ├── ATS Scoring
│   ├── Candidate Ranking
│   └── Recruiter Insights
│
└── Deployment
    ├── Docker
    ├── CI/CD
    ├── Vercel
    ├── Render
    └── PostgreSQL Ready
```

## 🛠️ Tech Stack

**Frontend**
- React 19 (Vite)
- Tailwind CSS & Framer Motion
- Zustand & React Query
- React Router (Lazy Loaded)

**Backend & AI**
- FastAPI (Python 3.11)
- PostgreSQL (SQLAlchemy ORM)
- PyMuPDF & python-docx
- spaCy & Sentence-Transformers
- Google Gemini API

## 📚 Documentation

Detailed documentation can be found in the `docs/` directory:
- [Architecture & System Design](docs/ARCHITECTURE.md)
- [Database ER Diagram](docs/DATABASE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## ⚡ Quick Start (Docker)

The easiest way to run HireSense AI locally is via Docker.

```bash
# Clone the repository
git clone https://github.com/yourusername/hiresense-ai.git
cd hiresense-ai

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start the containers
docker compose up --build -d
```
The Frontend will be available at `http://localhost:80` and the Backend API at `http://localhost:8000`.

## 🔒 Security & Performance
- **A+ Security**: Implements `slowapi` rate limiting, strict CORS, `nosniff` headers, and XSS protection.
- **Optimized**: Utilizes React `Suspense` for code splitting and Nginx Gzip compression for lightning-fast loads.

## 👨‍💻 Author
Built by [Your Name] as a showcase of modern full-stack engineering and AI integration.
