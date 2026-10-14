"""
LifeLink AI - Emergency API Routes
Handles SOS activation, lifecycle status, cancellation, and user history.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.emergency import (
    EmergencyCreateRequest,
    EmergencyResponse,
    EmergencyCancelRequest
)
from app.services.emergency_service import EmergencyService
from app.core.database import emergency_events_repo

router = APIRouter(prefix="/emergency", tags=["Emergency Workflow"])


@router.post("/create", response_model=EmergencyResponse)
def trigger_sos(req: EmergencyCreateRequest):
    """
    Triggers emergency SOS. Creates event, evaluates location, matches nearest facilities,
    and dispatches alerts to trusted contacts.
    """
    event = EmergencyService.create_emergency_event(req)
    return event


@router.get("/{event_id}", response_model=EmergencyResponse)
def get_emergency_status(event_id: str):
    """
    Retrieves full event status, location, facilities, and real-time timeline.
    """
    event = emergency_events_repo.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Emergency event not found.")
    return event


@router.post("/{event_id}/cancel", response_model=EmergencyResponse)
def cancel_emergency(event_id: str, req: EmergencyCancelRequest):
    """
    Safely cancels an emergency event with mandatory reason.
    """
    updated = EmergencyService.cancel_emergency(event_id, req.reason or "Cancelled by user", req.user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Emergency event not found.")
    return updated


@router.post("/{event_id}/resolve", response_model=EmergencyResponse)
def resolve_emergency(event_id: str, notes: str = Query("Emergency resolved safely")):
    """
    Marks an active emergency as resolved once assistance is delivered.
    """
    updated = EmergencyService.resolve_emergency(event_id, notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Emergency event not found.")
    return updated


@router.get("/user/{user_id}", response_model=List[EmergencyResponse])
def get_user_emergencies(user_id: str):
    """
    Returns user's emergency event history sorted by date.
    """
    events = emergency_events_repo.find_by_user(user_id)
    events.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return events
