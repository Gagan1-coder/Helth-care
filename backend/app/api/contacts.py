"""
LifeLink AI - Emergency Contacts API Routes
Manages trusted contacts, alert previews, SMS/WhatsApp dispatches, and human acknowledgement.
"""
import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException
from app.core.database import contacts_repo
from app.schemas.contact import (
    ContactCreate,
    ContactUpdate,
    ContactResponse,
    AlertPreviewRequest,
    AlertPreviewResponse,
    ContactAcknowledgement
)
from app.services.notification_service import (
    generate_emergency_message_text,
    generate_whatsapp_share_url,
    NotificationService
)

router = APIRouter(prefix="/contacts", tags=["Emergency Contacts"])


@router.get("/user/{user_id}", response_model=List[ContactResponse])
def get_user_contacts(user_id: str):
    """
    Retrieves all contacts configured for a user.
    """
    contacts = contacts_repo.find_by_user(user_id)
    return contacts


@router.post("", response_model=ContactResponse)
def add_contact(req: ContactCreate):
    """
    Registers a new emergency contact with validated phone and consent.
    """
    contact_id = f"cnt_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.utcnow().isoformat()
    record = {
        "id": contact_id,
        "user_id": req.user_id,
        "name": req.name,
        "phone": req.phone,
        "relationship": req.relationship,
        "is_trusted": req.is_trusted,
        "notify_sms": req.notify_sms,
        "notify_whatsapp": req.notify_whatsapp,
        "consent_to_share_location": req.consent_to_share_location,
        "consent_to_share_medical": req.consent_to_share_medical,
        "created_at": now_iso,
        "updated_at": now_iso
    }
    contacts_repo.create(contact_id, record)
    return record


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: str, req: ContactUpdate):
    """
    Updates contact preferences or phone number.
    """
    existing = contacts_repo.get(contact_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Contact not found.")

    updates = {k: v for k, v in req.dict(exclude_unset=True).items() if v is not None}
    updated = contacts_repo.update(contact_id, updates)
    return updated


@router.delete("/{contact_id}")
def delete_contact(contact_id: str):
    """
    Removes an emergency contact.
    """
    deleted = contacts_repo.delete(contact_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Contact not found.")
    return {"message": "Contact deleted successfully."}


@router.post("/preview-alert", response_model=AlertPreviewResponse)
def preview_alert(req: AlertPreviewRequest):
    """
    Generates preview of SMS text and WhatsApp click-to-chat URL without sending.
    """
    msg = generate_emergency_message_text(
        category=req.category,
        event_id="DEMO-PREVIEW",
        latitude=req.latitude,
        longitude=req.longitude,
        address=req.location_address,
        include_medical=req.include_medical
    )
    wa_url = generate_whatsapp_share_url("919876543210", msg)
    return AlertPreviewResponse(
        sms_text=msg,
        whatsapp_url=wa_url,
        generated_at=datetime.utcnow().isoformat()
    )


@router.post("/acknowledge")
def acknowledge_alert(req: ContactAcknowledgement):
    """
    Authoritatively records that a contact received and confirmed the emergency alert.
    """
    ack = NotificationService.record_human_acknowledgement(
        emergency_event_id=req.emergency_event_id,
        contact_id=req.contact_id,
        contact_name=req.acknowledged_by_name,
        note=req.note
    )
    return ack
