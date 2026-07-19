from app.repositories.recruiter import recruiter
from app.repositories.base import BaseRepository
from app.models.job import JobDescription
from app.schemas.job import JobDescriptionCreate, JobDescriptionUpdate
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate

class RepositoryJob(BaseRepository[JobDescription, JobDescriptionCreate, JobDescriptionUpdate]):
    pass

job = RepositoryJob(JobDescription)

class RepositoryResume(BaseRepository[Resume, ResumeCreate, ResumeCreate]):
    pass

resume = RepositoryResume(Resume)
