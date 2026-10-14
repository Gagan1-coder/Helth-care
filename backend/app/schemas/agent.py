"""
LifeLink AI - Agentic AI Coordinator Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ToolExecutionTrace(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any
    timestamp: str
    status: str = "success"  # or 'failed', 'skipped'
    evidence_source: Optional[str] = None


class AgentCoordinateRequest(BaseModel):
    emergency_event_id: Optional[str] = None
    user_id: str
    category: str = "general"
    user_query: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    vital_signs: Optional[Dict[str, Any]] = None
    require_dispatch_approval: bool = True


class FirstAidGuide(BaseModel):
    title: str
    steps: List[str]
    warnings: List[str]
    source: str = "World Health Organization / Red Cross Guidelines"


class AgentCoordinateResponse(BaseModel):
    summary: str
    category_detected: str
    urgency_level: str  # Critical, High, Moderate, Low
    reasoning_trace: List[str]
    tool_executions: List[ToolExecutionTrace]
    first_aid: FirstAidGuide
    recommended_hospitals: List[Dict[str, Any]]
    suggested_actions: List[str]
    actions_awaiting_approval: List[str]
    uncertainty_statement: str
    execution_time_ms: float
    is_rules_fallback: bool
