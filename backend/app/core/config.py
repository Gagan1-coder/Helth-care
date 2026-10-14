"""
LifeLink AI - Application Configuration
Uses pydantic-settings or standard os.getenv with validated defaults.
"""
import os
from typing import List
from dotenv import load_dotenv

# Load .env if present
load_dotenv()


class Settings:
    PROJECT_NAME: str = "LifeLink AI - Emergency Healthcare Coordinator"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lifelink-emergency-secret-key-2025")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "lifelink-emergency-ai")
    
    # Maps & Location
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # Agentic AI
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "rules_based_fallback")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    
    # SMS
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "mock")
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_NUMBER: str = os.getenv("TWILIO_FROM_NUMBER", "")
    
    # Safety & Rate Limiting
    MAX_SOS_PER_USER_PER_HOUR: int = int(os.getenv("MAX_SOS_PER_USER_PER_HOUR", "5"))
    DUPLICATE_SOS_WINDOW_SECONDS: int = int(os.getenv("DUPLICATE_SOS_WINDOW_SECONDS", "60"))


settings = Settings()
