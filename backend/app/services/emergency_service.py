"""
LifeLink AI - Emergency State Machine & Coordination Engine
Manages emergency lifecycle: creation, deduplication, facility matching,
notification orchestration, audit logging, and resolution.
"""
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.database import emergency_events_repo, contacts_repo
from app.schemas.emergency import (
    EmergencyCreateRequest,
    EmergencyResponse,
    EmergencyStatus,
    TimelineItem,
    LocationConfidence
)
from app.services.location_service import (
    assess_location_confidence,
    generate_google_maps_url
)
from app.services.hospital_service import search_hospitals
from app.services.notification_service import NotificationService

logger = logging.getLogger("lifelink.emergency")

class EmergencyService:
    @staticmethod
    def create_emergency_event(req: EmergencyCreateRequest) -> Dict[str, Any]:
        """
        Creates, validates, and initializes emergency lifecycle with deduplication.
        """
        now = datetime.utcnow()
        now_iso = now.isoformat()

        # Deduplication check
        if req.idempotency_key:
            existing = emergency_events_repo.get(req.idempotency_key)
            if existing:
                logger.info(f"Returning existing emergency event for idempotency key {req.idempotency_key}")
                return existing

        # Time window deduplication (prevent accidental multi-clicks within window)
        user_recent_events = emergency_events_repo.find_by_user(req.user_id)
        for ev in user_recent_events:
            if ev.get("status") in [EmergencyStatus.CREATED.value, EmergencyStatus.PROCESSING.value, EmergencyStatus.NOTIFICATION_SENT.value]:
                try:
                    ev_time = datetime.fromisoformat(ev.get("created_at"))
                    if (now - ev_time).total_seconds() < settings.DUPLICATE_SOS_WINDOW_SECONDS:
                        logger.warning(f"Duplicate SOS blocked for user {req.user_id} within {settings.DUPLICATE_SOS_WINDOW_SECONDS}s")
                        return ev
                except Exception:
                    pass

        event_id = req.idempotency_key or f"emg_{uuid.uuid4().hex[:12]}"

        # Process Location
        loc_data = None
        if req.location and req.location.latitude is not None and req.location.longitude is not None:
            confidence = assess_location_confidence(req.location.accuracy_meters)
            maps_url = generate_google_maps_url(req.location.latitude, req.location.longitude)
            loc_data = {
                "latitude": req.location.latitude,
                "longitude": req.location.longitude,
                "accuracy_meters": req.location.accuracy_meters,
                "confidence": confidence.value,
                "source": req.location.source or "browser_geolocation",
                "timestamp": req.location.timestamp or now_iso,
                "google_maps_url": maps_url,
                "address_display": req.location.address_display or f"Lat: {req.location.latitude:.4f}, Lon: {req.location.longitude:.4f}"
            }

        # Initial Timeline
        timeline = [
            {
                "timestamp": now_iso,
                "status": EmergencyStatus.CREATED.value,
                "message": f"SOS activated via {req.sos_method.value.replace('_', ' ').title()}.",
                "details": {"category": req.category.value, "is_simulation": req.is_simulation}
            }
        ]

        # Hospital Search Match
        recommended_hospitals = []
        if loc_data and loc_data.get("latitude") and loc_data.get("longitude"):
            hosp_response = search_hospitals(
                latitude=loc_data["latitude"],
                longitude=loc_data["longitude"],
                category=req.category.value,
                radius_km=30.0
            )
            recommended_hospitals = [f.dict() for f in hosp_response.facilities[:3]]
            timeline.append({
                "timestamp": datetime.utcnow().isoformat(),
                "status": EmergencyStatus.PROCESSING.value,
                "message": f"Found {len(recommended_hospitals)} nearby verified emergency facilities.",
                "details": {"data_source": hosp_response.data_source}
            })
        else:
            # Fallback search Bhatkal regional facilities
            hosp_response = search_hospitals(city_district="Bhatkal", category=req.category.value)
            recommended_hospitals = [f.dict() for f in hosp_response.facilities[:3]]
            timeline.append({
                "timestamp": datetime.utcnow().isoformat(),
                "status": EmergencyStatus.PROCESSING.value,
                "message": "GPS unavailable. Loaded regional default emergency centers (Bhatkal/Uttara Kannada).",
                "details": {"data_source": hosp_response.data_source}
            })

        # Base Event Object
        event_record = {
            "id": event_id,
            "user_id": req.user_id,
            "category": req.category.value,
            "sos_method": req.sos_method.value,
            "status": EmergencyStatus.PROCESSING.value,
            "location": loc_data,
            "timeline": timeline,
            "created_at": now_iso,
            "updated_at": now_iso,
            "is_simulation": req.is_simulation,
            "dispatched_notifications": [],
            "recommended_hospitals": recommended_hospitals,
            "notes": req.notes,
            "agent_coordination_summary": None
        }

        # Dispatch Notifications to Trusted Contacts
        user_contacts = contacts_repo.find_by_user(req.user_id)
        if user_contacts and not req.is_simulation:
            event_record["timeline"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "status": EmergencyStatus.NOTIFICATION_PENDING.value,
                "message": f"Preparing alerts for {len(user_contacts)} emergency contacts.",
                "details": {}
            })
            notifications = NotificationService.dispatch_emergency_notifications(
                emergency_event=event_record,
                contacts=user_contacts
            )
            event_record["dispatched_notifications"] = notifications
            event_record["status"] = EmergencyStatus.NOTIFICATION_SENT.value
            event_record["timeline"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "status": EmergencyStatus.NOTIFICATION_SENT.value,
                "message": f"Dispatched alerts to {len(notifications)} contacts via SMS & WhatsApp.",
                "details": {"contacts_alerted": [n.get("contact_name") for n in notifications]}
            })
        elif req.is_simulation:
            event_record["timeline"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "status": EmergencyStatus.NOTIFICATION_SENT.value,
                "message": "Judge Demo Mode Active: Live external SMS transmission safely suppressed.",
                "details": {"demo": True}
            })

        # Save to database
        emergency_events_repo.create(event_id, event_record)
        return event_record

    @staticmethod
    def cancel_emergency(event_id: str, reason: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Safely cancels an emergency event with audit logging.
        """
        event = emergency_events_repo.get(event_id)
        if not event:
            return None

        now_iso = datetime.utcnow().isoformat()
        timeline = event.get("timeline", [])
        timeline.append({
            "timestamp": now_iso,
            "status": EmergencyStatus.CANCELLED.value,
            "message": f"Emergency cancelled by user: {reason}",
            "details": {"cancelled_by": user_id}
        })

        updates = {
            "status": EmergencyStatus.CANCELLED.value,
            "timeline": timeline,
            "cancellation_reason": reason,
            "updated_at": now_iso
        }
        return emergency_events_repo.update(event_id, updates)

    @staticmethod
    def resolve_emergency(event_id: str, resolution_notes: str) -> Optional[Dict[str, Any]]:
        """
        Marks an emergency as resolved once assistance is delivered.
        """
        event = emergency_events_repo.get(event_id)
        if not event:
            return None

        now_iso = datetime.utcnow().isoformat()
        timeline = event.get("timeline", [])
        timeline.append({
            "timestamp": now_iso,
            "status": EmergencyStatus.RESOLVED.value,
            "message": f"Emergency resolved: {resolution_notes}",
            "details": {"resolution_notes": resolution_notes}
        })

        updates = {
            "status": EmergencyStatus.RESOLVED.value,
            "timeline": timeline,
            "resolution_notes": resolution_notes,
            "updated_at": now_iso
        }
        return emergency_events_repo.update(event_id, updates)
