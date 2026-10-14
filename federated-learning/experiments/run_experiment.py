"""
LifeLink AI - Federated Learning Experiment Runner
Runs 3 simulated hospital clients with FedAvg aggregation over 5 rounds.
Evaluates on an independent held-out clinical test set and compares with a centralized baseline.
Outputs authentic metrics to fl_results.json.
"""
import sys
import os
import json
import time
from datetime import datetime
import numpy as np

# Ensure federated-learning directory is on Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FL_ROOT = os.path.dirname(CURRENT_DIR)
if FL_ROOT not in sys.path:
    sys.path.insert(0, FL_ROOT)

from datasets.clinical_triage_data import get_all_federated_datasets
from models.triage_net import TriageNeuralNetwork
from clients.hospital_client import HospitalClient
from server.federated_aggregator import FederatedServer


def run_federated_experiment(total_rounds: int = 5, local_epochs: int = 5) -> dict:
    print("=" * 70)
    print("  LIFELINK AI — FEDERATED LEARNING FOR EMERGENCY TRIAGE")
    print("=" * 70)
    start_total_time = time.time()

    # 1. Load Datasets
    print("\n[1/5] Loading non-IID clinical triage datasets for 3 simulated hospitals...")
    datasets = get_all_federated_datasets()
    X1, y1 = datasets["client_1"]
    X2, y2 = datasets["client_2"]
    X3, y3 = datasets["client_3"]
    X_test, y_test = datasets["held_out_test"]

    print(f"  • Client 1 (Rural District - Bhatkal Taluka Hospital): {len(X1)} records")
    print(f"  • Client 2 (Urban Tertiary - Manipal/KMC Trauma):       {len(X2)} records")
    print(f"  • Client 3 (Private Specialty - Cardiac Care Center):   {len(X3)} records")
    print(f"  • Independent Held-Out Evaluation Dataset:              {len(X_test)} records")

    # 2. Train Centralized Baseline Model (Pool all data)
    print("\n[2/5] Training Centralized Baseline Model (all data pooled into one center)...")
    X_central = np.vstack([X1, X2, X3])
    y_central = np.concatenate([y1, y2, y3])
    baseline_model = TriageNeuralNetwork(input_dim=8, hidden_dim=16, seed=42)

    for epoch in range(total_rounds * local_epochs):
        baseline_model.train_step(X_central, y_central, lr=0.04)

    baseline_metrics = baseline_model.evaluate(X_test, y_test)
    print(f"  Baseline Results on Held-Out Test Set:")
    print(f"  -> Accuracy:  {baseline_metrics['accuracy']:.2f}%")
    print(f"  -> F1-Score:  {baseline_metrics['f1_score']:.2f}%")
    print(f"  -> Precision: {baseline_metrics['precision']:.2f}%")
    print(f"  -> Recall:    {baseline_metrics['recall']:.2f}%")
    print(f"  -> Loss:      {baseline_metrics['loss']:.4f}")

    # 3. Initialize Federated System
    print("\n[3/5] Initializing Federated Server and 3 Simulated Hospital Clients...")
    server = FederatedServer(seed=42)

    clients = [
        HospitalClient(
            client_id="client_1_bhatkal_rural",
            hospital_name="Bhatkal Taluka Government General Hospital",
            facility_type="Rural Secondary General Hospital",
            data_characteristics="Elderly demographics, respiratory & heat stress cases",
            X_train=X1,
            y_train=y1
        ),
        HospitalClient(
            client_id="client_2_manipal_trauma",
            hospital_name="Kasturba Hospital Manipal (KMC)",
            facility_type="Urban Apex Tertiary Trauma Care",
            data_characteristics="High acute polytrauma, severe shock & injury severity",
            X_train=X2,
            y_train=y2
        ),
        HospitalClient(
            client_id="client_3_cardiac_specialty",
            hospital_name="Coastal Cardiology Emergency Center",
            facility_type="Specialty Cardiac Emergency Hospital",
            data_characteristics="Acute coronary syndromes, malignant arrhythmias & hypertension",
            X_train=X3,
            y_train=y3
        )
    ]

    # 4. Federated Training Rounds
    print(f"\n[4/5] Executing {total_rounds} Federated Learning Rounds (FedAvg)...")
    rounds_summary = []

    for r in range(1, total_rounds + 1):
        round_start = time.time()
        global_weights = server.get_global_weights()
        client_updates = []
        client_metrics = {}

        print(f"\n--- [Round {r}/{total_rounds}] ---")
        for client in clients:
            weights, num_samples, metrics = client.train_round(
                global_weights=global_weights,
                local_epochs=local_epochs,
                learning_rate=0.04
            )
            client_updates.append((weights, num_samples))
            client_metrics[client.client_id] = {
                "hospital_name": client.hospital_name,
                "samples": num_samples,
                "local_loss": metrics["loss"],
                "local_accuracy": metrics["accuracy"],
                "duration_ms": metrics["training_duration_ms"]
            }
            print(f"  [{client.hospital_name[:28]}] Local Acc: {metrics['accuracy']:.2f}% | Loss: {metrics['loss']:.4f}")

        # Server-side FedAvg & Global Evaluation
        round_result = server.aggregate_and_evaluate(
            round_num=r,
            client_updates=client_updates,
            client_metrics=client_metrics,
            X_test=X_test,
            y_test=y_test,
            baseline_metrics=baseline_metrics
        )
        round_duration = round(time.time() - round_start, 2)
        gm = round_result["global_metrics"]
        print(f"  >> FedAvg Global Model (Round {r}): Acc={gm['accuracy']:.2f}% | F1={gm['f1_score']:.2f}% | Loss={gm['loss']:.4f} (Round time: {round_duration}s)")

        rounds_summary.append({
            "round_number": r,
            "participating_clients": [c.client_id for c in clients],
            "client_local_metrics": client_metrics,
            "global_metrics": gm,
            "baseline_centralized_metrics": baseline_metrics,
            "training_duration_seconds": round_duration,
            "timestamp": datetime.utcnow().isoformat()
        })

    total_experiment_duration = round(time.time() - start_total_time, 2)

    # 5. Compile Final Results Artifact
    print(f"\n[5/5] Compiling and saving genuine experiment results to fl_results.json...")
    final_payload = {
        "experiment_id": f"fl_exp_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        "model_name": "LifeLink Emergency Triage Classifier (MLP)",
        "architecture": "Input(8) -> Dense(16, ReLU) -> Dense(1, Sigmoid)",
        "target_task": "Predict Critical ICU / Emergency Urgency Level",
        "aggregation_strategy": "FedAvg (Federated Averaging)",
        "dataset_provenance": "Synthetic Non-IID clinical vital signs generated from standard physiological distributions (HR, SBP, DBP, RR, SpO2, Temp, Age, GCS)",
        "privacy_notice": "Raw patient vital signs never leave client devices. Only model parameter updates are communicated and averaged.",
        "clients": [
            {
                "client_id": c.client_id,
                "hospital_name": c.hospital_name,
                "facility_type": c.facility_type,
                "sample_count": c.sample_count,
                "data_characteristics": c.data_characteristics,
                "status": "active"
            }
            for c in clients
        ],
        "total_rounds_completed": total_rounds,
        "latest_global_metrics": rounds_summary[-1]["global_metrics"],
        "baseline_metrics": baseline_metrics,
        "rounds": rounds_summary,
        "total_runtime_seconds": total_experiment_duration,
        "is_live_experiment": True,
        "completed_at": datetime.utcnow().isoformat()
    }

    # Save to experiments/fl_results.json
    results_path = os.path.join(CURRENT_DIR, "fl_results.json")
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(final_payload, f, indent=2)

    print(f"\n[DONE] Experiment completed successfully in {total_experiment_duration}s.")
    print(f"Results saved to: {results_path}")
    print("=" * 70)
    return final_payload


if __name__ == "__main__":
    run_federated_experiment(total_rounds=5, local_epochs=5)
