# Portfolio Kit for HireSense AI

Use these assets to present HireSense AI in interviews, on LinkedIn, and in your portfolio.

## 1. Elevator Pitch (60 Seconds)
"I built HireSense AI, a modern enterprise-grade Applicant Tracking System. It solves the massive time-sink of manual resume screening by using an AI Intelligence Engine powered by NLP and Gemini. It automatically extracts structured data from resumes, calculates a multi-dimensional ATS match score against job descriptions, and ranks candidates instantly. It’s built with React, Tailwind, and FastAPI, featuring secure JWT auth, lazy loading, and a highly polished UI. It transforms days of manual screening into a 5-second process."

## 2. LinkedIn Post Template
🚀 **Excited to launch my latest project: HireSense AI!** 🚀

Screening resumes manually is a huge bottleneck for recruiters. I wanted to solve this by building an intelligent Applicant Tracking System (ATS) from scratch.

HireSense AI doesn't just store resumes—it reads them. Using Python, NLP (spaCy/Sentence-Transformers), and the Gemini API, it extracts skills, calculates semantic match scores against job descriptions, and ranks top candidates instantly. 

🛠️ **Tech Stack:**
- **Frontend**: React 19, Vite, Tailwind CSS, Zustand, React Query
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy
- **AI Engine**: PyMuPDF, spaCy, Sentence-Transformers, Gemini Pro
- **Deployment**: Vercel & Render (Dockerized)

Check out the code on GitHub: [Link to Repo]

#SoftwareEngineering #AI #React #Python #FastAPI #WebDevelopment #HireSense

## 3. Interview Talking Points
- **Architecture**: Emphasize the decoupled architecture (React SPA + FastAPI backend) and how it allows independent scaling of the heavy AI engine.
- **Performance**: Discuss how you implemented Vite Code Splitting, React.lazy, and gzip compression to optimize frontend load times.
- **Security**: Mention the custom rate limiter, strict MIME type checking for file uploads, and secure JWT configurations.
- **AI Integration**: Explain the multi-layered ATS scoring: using fast NLP (spaCy) for NER extraction and heavier LLMs (Gemini) for complex generative inferences.
