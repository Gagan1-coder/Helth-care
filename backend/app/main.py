"""
LifeLink AI - Intelligent Emergency Healthcare Coordination
Main FastAPI Application Entrypoint
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import initialize_database, contacts_repo
from app.api import (
    health,
    emergency,
    hospitals,
    contacts,
    agent,
    federated,
    analytics,
    user_profile
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("lifelink.main")

app = FastAPI(
    title="LifeLink AI - Emergency Healthcare Coordination API",
    description=(
        "Production REST API for emergency SOS coordination, real GPS processing, "
        "evidence-based hospital matching, contact notifications, Agentic AI, "
        "and privacy-preserving Federated Learning."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if settings.CORS_ORIGINS:
    for orig in settings.CORS_ORIGINS:
        if orig not in allowed_origins:
            allowed_origins.append(orig)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under API prefix
api_prefix = settings.API_V1_PREFIX
app.include_router(health.router, prefix=api_prefix)
app.include_router(emergency.router, prefix=api_prefix)
app.include_router(hospitals.router, prefix=api_prefix)
app.include_router(contacts.router, prefix=api_prefix)
app.include_router(agent.router, prefix=api_prefix)
app.include_router(federated.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(user_profile.router, prefix=api_prefix)


@app.on_event("startup")
def startup_event():
    logger.info("Initializing LifeLink AI backend services...")
    initialize_database()

    # Seed default sample emergency contacts if empty for seamless evaluation
    default_contacts = contacts_repo.find_by_user("demo_user")
    if not default_contacts:
        logger.info("Seeding default trusted emergency contacts for demo_user...")
        contacts_repo.create("cnt_demo_1", {
            "id": "cnt_demo_1",
            "user_id": "demo_user",
            "name": "Dr. Sarah (Family Physician)",
            "phone": "+919876543210",
            "relationship": "Physician",
            "is_trusted": True,
            "notify_sms": True,
            "notify_whatsapp": True,
            "consent_to_share_location": True,
            "consent_to_share_medical": True,
            "created_at": "2026-10-14T00:00:00Z",
            "updated_at": "2026-10-14T00:00:00Z"
        })
        contacts_repo.create("cnt_demo_2", {
            "id": "cnt_demo_2",
            "user_id": "demo_user",
            "name": "Arjun Kumar (Brother)",
            "phone": "+919845012345",
            "relationship": "Family",
            "is_trusted": True,
            "notify_sms": True,
            "notify_whatsapp": True,
            "consent_to_share_location": True,
            "consent_to_share_medical": False,
            "created_at": "2026-10-14T00:00:00Z",
            "updated_at": "2026-10-14T00:00:00Z"
        })


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "api_docs": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health"
    }
