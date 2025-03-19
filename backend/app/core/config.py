from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Alvenio"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "ai_branch_manager"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # File Storage
    UPLOAD_DIR: Path = Path("uploads")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Video Processing
    VIDEO_FORMATS: list = ["mp4", "webm", "mov"]
    MAX_VIDEO_DURATION: int = 300  # 5 minutes
    
    # Document Processing
    ALLOWED_DOCUMENT_TYPES: list = ["image/jpeg", "image/png", "application/pdf"]
    
    # Face Verification
    FACE_MATCH_THRESHOLD: float = 0.6
    
    class Config:
        case_sensitive = True
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.SQLALCHEMY_DATABASE_URI:
            self.SQLALCHEMY_DATABASE_URI = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
            )
        
        # Create upload directory if it doesn't exist
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings() 