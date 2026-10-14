"""
LifeLink AI - Federated Learning API Routes
Exposes authentic FL experiment results, training rounds, client metrics,
and triggers new federated training runs.
"""
import os
import sys
import json
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/federated", tags=["Federated Learning"])

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FL_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "..", "federated-learning"))
RESULTS_PATH = os.path.join(FL_DIR, "experiments", "fl_results.json")


@router.get("/status")
def get_federated_status():
    """
    Returns authentic Federated Learning metrics, client participation, and baseline comparison.
    """
    if os.path.exists(RESULTS_PATH):
        try:
            with open(RESULTS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read FL results: {e}")

    # If experiment hasn't been run yet, truthfully state not evaluated
    return {
        "experiment_id": "not_yet_evaluated",
        "model_name": "LifeLink Emergency Triage Classifier (MLP)",
        "target_task": "Predict Critical ICU / Emergency Urgency Level",
        "aggregation_strategy": "FedAvg (Federated Averaging)",
        "clients": [
            {"client_id": "client_1", "hospital_name": "Bhatkal Taluka Hospital", "facility_type": "Rural General"},
            {"client_id": "client_2", "hospital_name": "Manipal / KMC Trauma", "facility_type": "Urban Apex Tertiary"},
            {"client_id": "client_3", "hospital_name": "Coastal Cardiology Center", "facility_type": "Specialty Center"}
        ],
        "total_rounds_completed": 0,
        "is_live_experiment": False,
        "message": "Experiment has not yet run. Trigger a run via POST /api/v1/federated/run."
    }


@router.post("/run")
def trigger_federated_run(rounds: int = 5, local_epochs: int = 5):
    """
    Executes genuine 5-round Federated Learning experiment across the 3 simulated hospital clients.
    """
    if FL_DIR not in sys.path:
        sys.path.insert(0, FL_DIR)

    try:
        from experiments.run_experiment import run_federated_experiment
        results = run_federated_experiment(total_rounds=rounds, local_epochs=local_epochs)
        return {
            "message": f"Successfully completed {rounds} Federated Learning rounds.",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Federated Learning execution failed: {e}")
