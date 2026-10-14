"""
LifeLink AI - Emergency Contacts Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
import re


class ContactCreate(BaseModel):
    user_id: str
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., description="Phone number with country code")
    relationship: str = Field(default="Family", description="e.g. Spouse, Parent, Doctor, Neighbor")
    is_trusted: bool = True
    notify_sms: bool = True
    notify_whatsapp: bool = True
    consent_to_share_location: bool = True
    consent_to_share_medical: bool = False

    @validator("phone")
    def validate_phone(cls, v):
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?[0-9]{10,15}$", cleaned):
            raise ValueError("Phone number must contain 10-15 digits and optional leading +")
        return cleaned


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    is_trusted: Optional[bool] = None
    notify_sms: Optional[bool] = None
    notify_whatsapp: Optional[bool] = None
    consent_to_share_location: Optional[bool] = None
    consent_to_share_medical: Optional[bool] = None


class ContactResponse(BaseModel):
    id: str
    user_id: str
    name: str
    phone: str
    relationship: str
    is_trusted: bool
    notify_sms: bool
    notify_whatsapp: bool
    consent_to_share_location: bool
    consent_to_share_medical: bool
    created_at: str
    updated_at: str


class AlertPreviewRequest(BaseModel):
    contact_name: str
    category: str
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    include_medical: bool = False


class AlertPreviewResponse(BaseModel):
    sms_text: str
    whatsapp_url: str
    generated_at: str


class ContactAcknowledgement(BaseModel):
    contact_id: str
    emergency_event_id: str
    acknowledged_by_name: str
    note: Optional[str] = None
