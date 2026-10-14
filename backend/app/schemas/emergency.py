"""
LifeLink AI - Emergency Workflow Schemas
"""
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class EmergencyCategory(str, Enum):
    CARDIAC = "cardiac"
    ROAD_ACCIDENT = "road_accident"
    SEVERE_TRAUMA = "severe_trauma"
    RESPIRATORY = "respiratory"
    STROKE = "stroke"
    MATERNAL = "maternal"
    GENERAL = "general"


class SOSMethod(str, Enum):
    THUMB_PRESS = "thumb_press"
    HIDDEN_GESTURE = "hidden_gesture"
    BACK_TAP = "back_tap"
    VOLUME_PATTERN = "volume_pattern"
    POWER_BUTTON = "power_button"


class EmergencyStatus(str, Enum):
    CREATED = "created"
    PROCESSING = "processing"
    NOTIFICATION_PENDING = "notification_pending"
    NOTIFICATION_SENT = "notification_sent"
    NOTIFICATION_DELIVERED = "notification_delivered"
    NOTIFICATION_FAILED = "notification_failed"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class LocationConfidence(str, Enum):
    PRECISE = "precise"        # < 20 meters
    APPROXIMATE = "approximate"# 20 - 200 meters
    STALE = "stale"            # > 5 minutes old
    MANUAL = "manual"          # selected on map/search
    UNAVAILABLE = "unavailable"# permission denied / hardware error


class LocationPayload(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy_meters: Optional[float] = None
    confidence: LocationConfidence = LocationConfidence.UNAVAILABLE
    source: str = "browser_geolocation"
    timestamp: Optional[str] = None
    google_maps_url: Optional[str] = None
    address_display: Optional[str] = None


class TimelineItem(BaseModel):
    timestamp: str
    status: EmergencyStatus
    message: str
    details: Optional[Dict[str, Any]] = None


class EmergencyCreateRequest(BaseModel):
    user_id: str = Field(..., description="Authenticated user ID or guest session ID")
    category: EmergencyCategory = EmergencyCategory.GENERAL
    sos_method: SOSMethod = SOSMethod.THUMB_PRESS
    location: Optional[LocationPayload] = None
    notes: Optional[str] = None
    idempotency_key: Optional[str] = None
    is_simulation: bool = False


class EmergencyCancelRequest(BaseModel):
    reason: Optional[str] = "False alarm or resolved by user"
    user_id: str


class EmergencyResponse(BaseModel):
    id: str
    user_id: str
    category: EmergencyCategory
    sos_method: SOSMethod
    status: EmergencyStatus
    location: Optional[LocationPayload] = None
    timeline: List[TimelineItem] = []
    created_at: str
    updated_at: str
    is_simulation: bool = False
    dispatched_notifications: List[Dict[str, Any]] = []
    recommended_hospitals: List[Dict[str, Any]] = []
    agent_coordination_summary: Optional[str] = None
