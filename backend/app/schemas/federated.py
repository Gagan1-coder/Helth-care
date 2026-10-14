"""
LifeLink AI - Federated Learning Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class EvaluationMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    loss: float


class ClientInfo(BaseModel):
    client_id: str
    hospital_name: str
    facility_type: str
    sample_count: int
    data_characteristics: str
    status: str = "connected"


class RoundSummary(BaseModel):
    round_number: int
    participating_clients: List[str]
    global_metrics: EvaluationMetrics
    baseline_centralized_metrics: EvaluationMetrics
    training_duration_seconds: float
    timestamp: str


class FederatedExperimentStatus(BaseModel):
    experiment_id: str
    model_name: str = "LifeLink Emergency Triage Classifier (MLP)"
    target_task: str = "Predict Critical ICU / Emergency Urgency Level"
    aggregation_strategy: str = "FedAvg (Federated Averaging)"
    clients: List[ClientInfo]
    total_rounds_completed: int
    latest_global_metrics: Optional[EvaluationMetrics] = None
    baseline_metrics: Optional[EvaluationMetrics] = None
    rounds: List[RoundSummary] = []
    privacy_notice: str = "Local patient vital signs never leave client boundaries. Only model weight updates are transmitted and aggregated."
    is_live_experiment: bool
