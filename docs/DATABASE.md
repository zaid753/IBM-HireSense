# Database Architecture

HireSense AI utilizes a relational database (PostgreSQL in production, SQLite in development) managed via SQLAlchemy ORM.

## Entity-Relationship (ER) Diagram

The core schema revolves around the `Recruiter`, their `Jobs`, and the `Candidates` applying with their `Resumes`.

```mermaid
erDiagram
    RECRUITER {
        int id PK
        string email
        string hashed_password
        string full_name
        string company
        boolean is_active
        boolean is_admin
    }
    
    JOB {
        int id PK
        int recruiter_id FK
        string title
        string department
        text description
        string location
        string employment_type
        text required_skills
        int experience_required
    }
    
    CANDIDATE {
        int id PK
        int recruiter_id FK
        string first_name
        string last_name
        string email
        string phone
        string status
    }
    
    RESUME {
        int id PK
        int candidate_id FK
        string original_filename
        string stored_filename
        string file_type
        int file_size
    }
    
    RESUME_ANALYSIS {
        int id PK
        int resume_id FK
        json parsed_json
        float ats_score
    }
    
    RECRUITER ||--o{ JOB : posts
    RECRUITER ||--o{ CANDIDATE : manages
    CANDIDATE ||--o{ RESUME : owns
    RESUME ||--|| RESUME_ANALYSIS : has
```
