"""
LifeLink AI - Federated Learning Aggregation Server
Coordinates multi-round FedAvg aggregation, baseline comparison, and evaluation.
Strictly computes genuine metrics on independent held-out evaluation sets.
"""
import copy
import logging
from typing import List, Dict, Any, Tuple
import numpy as np
from models.triage_net import TriageNeuralNetwork

logger = logging.getLogger("lifelink.fl_server")


def federated_averaging(
    client_updates: List[Tuple[Dict[str, np.ndarray], int]]
) -> Dict[str, np.ndarray]:
    """
    Computes sample-weighted FedAvg across participating client weight dictionaries.
    w_global = sum((n_k / N_total) * w_k)
    """
    total_samples = sum(num_samples for _, num_samples in client_updates)
    if total_samples == 0:
        raise ValueError("Total sample count cannot be zero for FedAvg.")

    first_weights, _ = client_updates[0]
    aggregated = {
        key: np.zeros_like(val, dtype=np.float32)
        for key, val in first_weights.items()
    }

    for weights, num_samples in client_updates:
        weight_factor = float(num_samples) / float(total_samples)
        for key in aggregated:
            aggregated[key] += weight_factor * weights[key].astype(np.float32)

    return aggregated


class FederatedServer:
    def __init__(self, seed: int = 42):
        self.global_model = TriageNeuralNetwork(input_dim=8, hidden_dim=16, seed=seed)
        self.round_history: List[Dict[str, Any]] = []

    def get_global_weights(self) -> Dict[str, np.ndarray]:
        return self.global_model.get_weights()

    def aggregate_and_evaluate(
        self,
        round_num: int,
        client_updates: List[Tuple[Dict[str, np.ndarray], int]],
        client_metrics: Dict[str, Dict[str, float]],
        X_test: np.ndarray,
        y_test: np.ndarray,
        baseline_metrics: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Executes FedAvg, applies new global weights, and evaluates on held-out test data.
        """
        # FedAvg
        new_weights = federated_averaging(client_updates)
        self.global_model.set_weights(new_weights)

        # Global Evaluation
        global_eval = self.global_model.evaluate(X_test, y_test)

        round_record = {
            "round_number": round_num,
            "participating_clients": list(client_metrics.keys()),
            "client_local_metrics": client_metrics,
            "global_metrics": global_eval,
            "baseline_centralized_metrics": baseline_metrics,
            "status": "completed"
        }
        self.round_history.append(round_record)
        return round_record
