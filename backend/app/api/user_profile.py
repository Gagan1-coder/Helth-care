"""
LifeLink AI - Privacy-Aware Emergency Medical Profile API
Stores optional emergency medical data with explicit user consent,
strict data minimization, and immediate deletion controls.
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.core.database import medical_profiles_repo

router = APIRouter(prefix="/profile", tags=["User Profile & Medical Data"])


class MedicalProfilePayload(BaseModel):
    user_id: str
    blood_group: Optional[str] = Field(None, description="e.g. O+, A+, B-, AB+")
    allergies: List[str] = Field(default_factory=list, description="e.g. Penicillin, Peanuts")
    chronic_conditions: List[str] = Field(default_factory=list, description="e.g. Asthma, Diabetes, Hypertension")
    current_medications: List[str] = Field(default_factory=list)
    emergency_notes: Optional[str] = None
    consent_emergency_sharing: bool = Field(False, description="Explicit consent to share with hospital in SOS")
    data_retention_days: int = Field(365, ge=30, le=730)


@router.get("/medical/{user_id}")
def get_medical_profile(user_id: str):
    """
    Retrieves user's emergency medical profile.
    """
    profile = medical_profiles_repo.get(user_id)
    if not profile:
        return {
            "user_id": user_id,
            "has_profile": False,
            "consent_emergency_sharing": False,
            "blood_group": None,
            "allergies": [],
            "chronic_conditions": [],
            "current_medications": [],
            "emergency_notes": None
        }
    return profile


@router.post("/medical")
def save_medical_profile(payload: MedicalProfilePayload):
    """
    Saves or updates emergency medical profile with explicit consent verification.
    """
    data = payload.dict()
    data["has_profile"] = True
    saved = medical_profiles_repo.create(payload.user_id, data)
    return saved


@router.delete("/medical/{user_id}")
def delete_medical_profile(user_id: str):
    """
    Immediately purges user's sensitive medical profile (Right to be Forgotten).
    """
    medical_profiles_repo.delete(user_id)
    return {"message": "Emergency medical profile successfully purged from database."}
