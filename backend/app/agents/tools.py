"""
LifeLink AI - Agentic AI Tool Registry
Provides structured, validated tools for the emergency coordinator.
Each tool produces validated outputs with source citations and timestamps.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.services.location_service import (
    calculate_haversine_distance,
    estimate_drive_time,
    assess_location_confidence,
    generate_google_directions_url
)
from app.services.hospital_service import search_hospitals
from app.core.database import contacts_repo, notification_logs_repo

# Standardized First-Aid Protocols (WHO / Red Cross validated guidance)
FIRST_AID_GUIDELINES: Dict[str, Dict[str, Any]] = {
    "cardiac": {
        "title": "Suspected Cardiac Arrest / Heart Attack Protocol",
        "urgency": "CRITICAL",
        "source": "American Heart Association / International Red Cross Guidelines",
        "immediate_actions": [
            "Call 108 (Ambulance) or 112 immediately. State 'Suspected Cardiac Emergency'.",
            "Keep patient seated upright or in a comfortable resting position. Do not let them walk.",
            "Loosen tight clothing around the neck, chest, and waist.",
            "Ask if they have prescribed Aspirin or Nitroglycerin. Only assist if prescribed.",
            "If patient becomes unresponsive and stops breathing normally, begin Hands-Only CPR (100-120 compressions/minute in center of chest).",
            "Locate nearest Automated External Defibrillator (AED) if available."
        ],
        "warnings": [
            "Do NOT leave the patient unattended.",
            "Do NOT give food, water, or unprescribed medication.",
            "Do NOT allow the patient to drive themselves to the hospital."
        ]
    },
    "road_accident": {
        "title": "Road Traffic Accident & Severe Trauma Protocol",
        "urgency": "CRITICAL",
        "source": "WHO Trauma Care Guidelines / Red Cross First Aid",
        "immediate_actions": [
            "Ensure scene safety before approaching (hazard lights, warning triangles, watch traffic).",
            "Do NOT move the patient unless there is immediate danger of fire or explosion (suspected spinal trauma).",
            "Control severe bleeding: apply direct, firm pressure with a clean cloth or bandage.",
            "Keep the patient warm and calm. Cover with a blanket or jacket to prevent shock.",
            "Check airway and breathing without tilting the neck if spinal injury is suspected."
        ],
        "warnings": [
            "Do NOT remove a motorcycle helmet unless trained and airway is completely blocked.",
            "Do NOT attempt to push back protruding organs or pull out impaled objects.",
            "Do NOT give fluids by mouth."
        ]
    },
    "severe_trauma": {
        "title": "Severe Hemorrhage and Trauma Stabilization",
        "urgency": "CRITICAL",
        "source": "Stop The Bleed / International Trauma Life Support",
        "immediate_actions": [
            "Call 112 / 108 immediately.",
            "Apply direct firm pressure over the bleeding site with sterile dressing or clean cloth.",
            "Maintain continuous pressure for at least 5-10 minutes without lifting to check.",
            "If bleeding penetrates dressing, add more cloth on top; do not remove the base layer."
        ],
        "warnings": [
            "Avoid direct contact with blood without barrier if possible.",
            "Watch for signs of shock: pallor, cold clammy skin, confusion."
        ]
    },
    "respiratory": {
        "title": "Acute Respiratory Distress / Choking / Severe Asthma",
        "urgency": "HIGH",
        "source": "Global Initiative for Asthma / Red Cross First Aid",
        "immediate_actions": [
            "Help person sit comfortably upright to ease lung expansion.",
            "Assist with their prescribed rescue inhaler (e.g. Salbutamol / Albuterol) if available.",
            "Ensure plenty of fresh air. Remove crowds or irritants (smoke, fumes).",
            "If severe wheezing, inability to speak full sentences, or blue lips: dial 108 immediately."
        ],
        "warnings": [
            "Do NOT force the person to lie flat on their back.",
            "Do NOT give sedative medications."
        ]
    },
    "stroke": {
        "title": "Acute Stroke Assessment (FAST Protocol)",
        "urgency": "CRITICAL",
        "source": "World Stroke Organization Guidelines",
        "immediate_actions": [
            "F - Face Drooping: Ask them to smile. Does one side droop?",
            "A - Arm Weakness: Ask them to raise both arms. Does one arm drift downward?",
            "S - Speech Difficulty: Ask them to repeat a simple phrase. Is speech slurred?",
            "T - Time to call 108: If any sign is present, time is brain tissue. Call immediately.",
            "Note the exact time symptoms first began."
        ],
        "warnings": [
            "Do NOT give aspirin (some strokes are hemorrhagic and aspirin will worsen bleeding).",
            "Do NOT give food or drink (swallowing reflex may be impaired)."
        ]
    },
    "general": {
        "title": "General Emergency Assessment & Triage",
        "urgency": "MODERATE",
        "source": "National Disaster Management Authority / Basic First Aid",
        "immediate_actions": [
            "Check responsiveness: Tap shoulder and ask 'Are you okay?'.",
            "Call 112 for police / ambulance / disaster coordination in India.",
            "Ensure the person is resting comfortably and breathing easily.",
            "Notify verified emergency contacts through LifeLink."
        ],
        "warnings": [
            "Always prioritize patient safety and do not administer unfamiliar medications."
        ]
    }
}


# Tool Definitions
def tool_get_emergency_location(latitude: Optional[float], longitude: Optional[float], accuracy_m: Optional[float]) -> Dict[str, Any]:
    """Retrieves and evaluates spatial location confidence."""
    now_iso = datetime.utcnow().isoformat()
    if latitude is None or longitude is None:
        return {
            "status": "unavailable",
            "confidence": "unavailable",
            "message": "GPS coordinates not available from client device.",
            "retrieved_at": now_iso
        }
    confidence = assess_location_confidence(accuracy_m)
    return {
        "status": "success",
        "latitude": latitude,
        "longitude": longitude,
        "accuracy_meters": accuracy_m,
        "confidence": confidence.value,
        "google_maps_url": f"https://www.google.com/maps?q={latitude:.6f},{longitude:.6f}",
        "retrieved_at": now_iso
    }


def tool_search_nearby_hospitals(latitude: Optional[float], longitude: Optional[float], category: str, radius_km: float = 35.0) -> Dict[str, Any]:
    """Searches verified facilities and OSM live elements for emergency matching."""
    now_iso = datetime.utcnow().isoformat()
    response = search_hospitals(
        latitude=latitude,
        longitude=longitude,
        city_district="Bhatkal" if (latitude is None or longitude is None) else None,
        category=category,
        radius_km=radius_km
    )
    return {
        "status": "success",
        "total_facilities": response.total_found,
        "data_source": response.data_source,
        "facilities": [f.dict() for f in response.facilities[:3]],
        "retrieved_at": now_iso
    }


def tool_lookup_first_aid(category: str) -> Dict[str, Any]:
    """Retrieves medical-board vetted first aid guidance."""
    cat = category.lower().strip()
    guide = FIRST_AID_GUIDELINES.get(cat, FIRST_AID_GUIDELINES["general"])
    return {
        "status": "success",
        "category": cat,
        "guide": guide,
        "retrieved_at": datetime.utcnow().isoformat()
    }


def tool_verify_contacts(user_id: str) -> Dict[str, Any]:
    """Checks configured trusted emergency contacts and acknowledgement status."""
    contacts = contacts_repo.find_by_user(user_id)
    trusted = [c for c in contacts if c.get("is_trusted", True)]
    return {
        "status": "success",
        "total_contacts": len(contacts),
        "trusted_contacts_count": len(trusted),
        "contacts_summary": [{"name": c.get("name"), "phone": c.get("phone"), "notify_sms": c.get("notify_sms")} for c in trusted],
        "retrieved_at": datetime.utcnow().isoformat()
    }


def tool_assess_triage_urgency(vital_signs: Optional[Dict[str, Any]], category: str) -> Dict[str, Any]:
    """Evaluates triage risk level based on clinical vital signs and category."""
    urgency = "HIGH"
    risk_factors = []
    
    if category in ["cardiac", "stroke", "severe_trauma"]:
        urgency = "CRITICAL"
        risk_factors.append(f"Category '{category}' carries high mortality risk without rapid tertiary intervention.")

    if vital_signs:
        hr = vital_signs.get("heart_rate")
        spo2 = vital_signs.get("oxygen_saturation")
        sbp = vital_signs.get("systolic_bp")

        if spo2 and spo2 < 90:
            urgency = "CRITICAL"
            risk_factors.append(f"Severe hypoxia detected (SpO2 {spo2}% < 90%).")
        if hr and (hr > 130 or hr < 45):
            urgency = "CRITICAL"
            risk_factors.append(f"Dangerous cardiac rate (HR {hr} bpm).")
        if sbp and (sbp < 90 or sbp > 190):
            urgency = "CRITICAL"
            risk_factors.append(f"Hemodynamic instability (Systolic BP {sbp} mmHg).")

    return {
        "status": "success",
        "urgency_level": urgency,
        "risk_factors": risk_factors,
        "evaluated_at": datetime.utcnow().isoformat()
    }
