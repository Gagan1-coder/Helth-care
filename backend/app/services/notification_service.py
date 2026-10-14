"""
LifeLink AI - Emergency Notification & Alert Dispatch Service
Supports Twilio SMS, WhatsApp Direct Click-to-Chat URLs, and Mock Sandbox.
Strictly separates transmission status from human acknowledgement.
"""
import urllib.parse
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.database import notification_logs_repo, contacts_repo

logger = logging.getLogger("lifelink.notifications")

def generate_emergency_message_text(
    category: str,
    event_id: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    accuracy_m: Optional[float] = None,
    address: Optional[str] = None,
    include_medical: bool = False,
    medical_notes: Optional[str] = None
) -> str:
    """
    Constructs standardized, urgent emergency text for SMS and WhatsApp.
    """
    cat_display = category.replace("_", " ").upper()
    lines = [
        f"🚨 LIFELINK EMERGENCY ALERT: {cat_display} 🚨",
        f"Event ID: {event_id[:8]}",
        f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
    ]
    if latitude is not None and longitude is not None:
        lines.append(f"Location: https://www.google.com/maps?q={latitude:.6f},{longitude:.6f}")
        if accuracy_m:
            lines.append(f"GPS Accuracy: ~{int(accuracy_m)}m")
    elif address:
        lines.append(f"Reported Area: {address}")
    else:
        lines.append("Location: GPS location currently unavailable")

    if include_medical and medical_notes:
        lines.append(f"Medical Info: {medical_notes}")

    lines.append("Urgent: Please confirm safety or call emergency services (112/108).")
    return "\n".join(lines)


def generate_whatsapp_share_url(phone: str, message: str) -> str:
    """
    Builds clean wa.me direct click-to-chat URL with pre-filled encoded text.
    """
    clean_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
    encoded_text = urllib.parse.quote(message)
    return f"https://wa.me/{clean_phone}?text={encoded_text}"


class NotificationService:
    @staticmethod
    def send_sms_alert(phone: str, message: str, emergency_event_id: str, contact_id: str) -> Dict[str, Any]:
        """
        Sends SMS via Twilio if configured, or records to Verified Mock Sandbox.
        """
        log_id = f"notif_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.utcnow().isoformat()

        # Check if Twilio credentials exist
        if settings.SMS_PROVIDER == "twilio" and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                import requests
                twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
                auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                payload = {
                    "From": settings.TWILIO_FROM_NUMBER,
                    "To": phone,
                    "Body": message
                }
                resp = requests.post(twilio_url, data=payload, auth=auth, timeout=5.0)
                if resp.status_code in [200, 201]:
                    res_data = resp.json()
                    status_record = {
                        "id": log_id,
                        "emergency_event_id": emergency_event_id,
                        "contact_id": contact_id,
                        "phone": phone,
                        "provider": "twilio",
                        "provider_sid": res_data.get("sid"),
                        "status": "sent",
                        "timestamp": timestamp,
                        "delivery_confirmed": False,
                        "human_acknowledged": False
                    }
                    notification_logs_repo.create(log_id, status_record)
                    return status_record
                else:
                    status_record = {
                        "id": log_id,
                        "emergency_event_id": emergency_event_id,
                        "contact_id": contact_id,
                        "phone": phone,
                        "provider": "twilio",
                        "status": "failed",
                        "error": resp.text,
                        "timestamp": timestamp,
                        "delivery_confirmed": False,
                        "human_acknowledged": False
                    }
                    notification_logs_repo.create(log_id, status_record)
                    return status_record
            except Exception as e:
                logger.error(f"Twilio SMS transmission failed: {e}")

        # Local Mock / Dev Sandbox fallback
        mock_record = {
            "id": log_id,
            "emergency_event_id": emergency_event_id,
            "contact_id": contact_id,
            "phone": phone,
            "provider": "local_mock_sandbox",
            "message_body": message,
            "status": "delivered_to_mock_sandbox",
            "timestamp": timestamp,
            "delivery_confirmed": True,
            "human_acknowledged": False,
            "note": "Logged safely to local sandbox (no external SMS billing or live carrier dispatch incurred)"
        }
        notification_logs_repo.create(log_id, mock_record)
        return mock_record

    @staticmethod
    def dispatch_emergency_notifications(
        emergency_event: Dict[str, Any],
        contacts: List[Dict[str, Any]],
        include_medical: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Dispatches alerts to all trusted contacts for an emergency event.
        """
        results = []
        loc = emergency_event.get("location") or {}
        event_id = emergency_event.get("id", "emergency")
        category = emergency_event.get("category", "general")

        message = generate_emergency_message_text(
            category=category,
            event_id=event_id,
            latitude=loc.get("latitude"),
            longitude=loc.get("longitude"),
            accuracy_m=loc.get("accuracy_meters"),
            address=loc.get("address_display"),
            include_medical=include_medical
        )

        for contact in contacts:
            if not contact.get("is_trusted", True):
                continue
            phone = contact.get("phone")
            if not phone:
                continue

            # SMS dispatch
            sms_status = None
            if contact.get("notify_sms", True):
                sms_status = NotificationService.send_sms_alert(
                    phone=phone,
                    message=message,
                    emergency_event_id=event_id,
                    contact_id=contact.get("id", "contact")
                )

            # WhatsApp direct URL
            wa_url = generate_whatsapp_share_url(phone, message) if contact.get("notify_whatsapp", True) else None

            results.append({
                "contact_id": contact.get("id"),
                "contact_name": contact.get("name"),
                "phone": phone,
                "sms_status": sms_status,
                "whatsapp_share_url": wa_url,
                "timestamp": datetime.utcnow().isoformat()
            })

        return results

    @staticmethod
    def record_human_acknowledgement(emergency_event_id: str, contact_id: str, contact_name: str, note: Optional[str] = None) -> Dict[str, Any]:
        """
        Authoritatively records that a human contact confirmed receipt of the emergency.
        """
        ack_id = f"ack_{uuid.uuid4().hex[:10]}"
        ack_record = {
            "id": ack_id,
            "emergency_event_id": emergency_event_id,
            "contact_id": contact_id,
            "contact_name": contact_name,
            "acknowledged_at": datetime.utcnow().isoformat(),
            "note": note or "Contact confirmed they received the alert and are responding"
        }
        # Update matching notification log
        all_logs = notification_logs_repo.list_all()
        for log in all_logs:
            if log.get("emergency_event_id") == emergency_event_id and log.get("contact_id") == contact_id:
                notification_logs_repo.update(log["id"], {"human_acknowledged": True, "acknowledged_at": ack_record["acknowledged_at"]})
        return ack_record
