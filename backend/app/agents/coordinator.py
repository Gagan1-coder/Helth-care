"""
LifeLink AI - Autonomous Agentic Emergency Coordinator
Executes validated multi-tool workflows, constructs explainable reasoning traces,
and enforces safety gates (consequential actions require user approval).
"""
import time
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.database import agent_audit_logs_repo
from app.schemas.agent import (
    AgentCoordinateRequest,
    AgentCoordinateResponse,
    ToolExecutionTrace,
    FirstAidGuide
)
from app.agents.tools import (
    tool_get_emergency_location,
    tool_assess_triage_urgency,
    tool_lookup_first_aid,
    tool_search_nearby_hospitals,
    tool_verify_contacts
)

logger = logging.getLogger("lifelink.agent")

class AgenticEmergencyCoordinator:
    @staticmethod
    def coordinate_emergency(req: AgentCoordinateRequest) -> AgentCoordinateResponse:
        start_time = time.time()
        audit_id = f"audit_{uuid.uuid4().hex[:12]}"
        reasoning_trace: List[str] = []
        tool_executions: List[ToolExecutionTrace] = []

        category = (req.category or "general").lower().strip()
        reasoning_trace.append(f"Step 1: Analyzed intake payload. Identified emergency category as '{category.upper()}'.")

        # 1. Execute Location Tool
        loc_res = tool_get_emergency_location(req.latitude, req.longitude, 15.0 if req.latitude else None)
        tool_executions.append(ToolExecutionTrace(
            tool_name="get_emergency_location",
            arguments={"latitude": req.latitude, "longitude": req.longitude},
            result=loc_res,
            timestamp=loc_res["retrieved_at"],
            evidence_source="Device Browser Geolocation API"
        ))
        conf_str = loc_res.get("confidence", "unavailable")
        reasoning_trace.append(f"Step 2: Geolocation tool executed. Confidence rated as '{conf_str.upper()}'.")

        # 2. Execute Triage Urgency Assessment Tool
        triage_res = tool_assess_triage_urgency(req.vital_signs, category)
        tool_executions.append(ToolExecutionTrace(
            tool_name="assess_triage_urgency",
            arguments={"category": category, "vital_signs": req.vital_signs},
            result=triage_res,
            timestamp=triage_res["evaluated_at"],
            evidence_source="LifeLink Emergency Clinical Decision Rules"
        ))
        urgency = triage_res.get("urgency_level", "HIGH")
        reasoning_trace.append(f"Step 3: Clinical risk assessment tool returned urgency level: '{urgency}'.")

        # 3. Execute First Aid Protocol Tool
        first_aid_res = tool_lookup_first_aid(category)
        guide_data = first_aid_res["guide"]
        tool_executions.append(ToolExecutionTrace(
            tool_name="lookup_first_aid_protocols",
            arguments={"category": category},
            result=first_aid_res,
            timestamp=first_aid_res["retrieved_at"],
            evidence_source=guide_data["source"]
        ))
        reasoning_trace.append(f"Step 4: Retrieved validated first-aid protocol from '{guide_data['source']}'.")

        # 4. Execute Hospital Facility Match Tool
        hosp_res = tool_search_nearby_hospitals(req.latitude, req.longitude, category, radius_km=35.0)
        tool_executions.append(ToolExecutionTrace(
            tool_name="search_nearby_hospitals",
            arguments={"latitude": req.latitude, "longitude": req.longitude, "category": category},
            result=hosp_res,
            timestamp=hosp_res["retrieved_at"],
            evidence_source=hosp_res["data_source"]
        ))
        hosp_count = hosp_res.get("total_facilities", 0)
        reasoning_trace.append(f"Step 5: Facility search tool identified {hosp_count} matching emergency centers.")

        # 5. Execute Contact Verification Tool
        contact_res = tool_verify_contacts(req.user_id)
        tool_executions.append(ToolExecutionTrace(
            tool_name="verify_trusted_contacts",
            arguments={"user_id": req.user_id},
            result=contact_res,
            timestamp=contact_res["retrieved_at"],
            evidence_source="LifeLink Encrypted Contact Storage"
        ))
        trusted_count = contact_res.get("trusted_contacts_count", 0)
        reasoning_trace.append(f"Step 6: Verified {trusted_count} trusted emergency contacts configured for notification.")

        # Formulate Actions & Approvals
        suggested_actions = [
            "Dial 108 or 112 immediately for emergency medical dispatch.",
            "Remain at the location if safe and follow immediate first-aid instructions.",
            "Keep phone screen active for incoming contact responses."
        ]

        actions_awaiting_approval = []
        if req.require_dispatch_approval:
            actions_awaiting_approval.append("Authorize sending high-priority SMS alerts with live GPS link to all trusted contacts.")
            actions_awaiting_approval.append("Authorize transmitting medical profile (blood group / allergies) to nearest destination hospital.")

        summary = (
            f"LifeLink Agent coordinated emergency response for suspected {category.upper()}. "
            f"Classified as {urgency} urgency. Matched {len(hosp_res.get('facilities', []))} specialized centers. "
            f"Vetted first-aid guidance retrieved. Pending user approval for external data transmissions."
        )

        execution_duration_ms = round((time.time() - start_time) * 1000, 2)

        # Audit Log
        audit_record = {
            "id": audit_id,
            "emergency_event_id": req.emergency_event_id,
            "user_id": req.user_id,
            "category": category,
            "urgency": urgency,
            "execution_time_ms": execution_duration_ms,
            "tool_executions": [t.dict() for t in tool_executions],
            "reasoning_trace": reasoning_trace,
            "timestamp": datetime.utcnow().isoformat()
        }
        agent_audit_logs_repo.create(audit_id, audit_record)

        return AgentCoordinateResponse(
            summary=summary,
            category_detected=category,
            urgency_level=urgency,
            reasoning_trace=reasoning_trace,
            tool_executions=tool_executions,
            first_aid=FirstAidGuide(
                title=guide_data["title"],
                steps=guide_data["immediate_actions"],
                warnings=guide_data["warnings"],
                source=guide_data["source"]
            ),
            recommended_hospitals=hosp_res.get("facilities", []),
            suggested_actions=suggested_actions,
            actions_awaiting_approval=actions_awaiting_approval,
            uncertainty_statement="AI recommendations are supportive guidance and do not replace professional on-scene medical assessment.",
            execution_time_ms=execution_duration_ms,
            is_rules_fallback=True
        )
