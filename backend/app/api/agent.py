"""
LifeLink AI - Agentic AI Coordinator API Route
Runs multi-step agentic emergency coordination with structured tool calling.
"""
from fastapi import APIRouter
from app.schemas.agent import AgentCoordinateRequest, AgentCoordinateResponse
from app.agents.coordinator import AgenticEmergencyCoordinator

router = APIRouter(prefix="/agent", tags=["Agentic AI Coordinator"])


@router.post("/coordinate", response_model=AgentCoordinateResponse)
def coordinate_emergency_ai(req: AgentCoordinateRequest):
    """
    Executes autonomous coordination workflow:
    1. Evaluates emergency category & vital signs
    2. Runs spatial confidence tool
    3. Retrieves clinical first-aid protocol
    4. Searches specialized facilities
    5. Checks trusted contacts readiness
    6. Identifies actions requiring user approval
    """
    response = AgenticEmergencyCoordinator.coordinate_emergency(req)
    return response
