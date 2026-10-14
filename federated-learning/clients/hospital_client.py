"""
LifeLink AI - Simulated Hospital Federated Client
Executes strictly client-local training. Raw patient records remain local.
Only mathematical weight updates are communicated to the aggregation server.
"""
import time
import numpy as np
from typing import Dict, Any, Tuple
from models.triage_net import TriageNeuralNetwork


class HospitalClient:
    def __init__(
        self,
        client_id: str,
        hospital_name: str,
        facility_type: str,
        data_characteristics: str,
        X_train: np.ndarray,
        y_train: np.ndarray
    ):
        self.client_id = client_id
        self.hospital_name = hospital_name
        self.facility_type = facility_type
        self.data_characteristics = data_characteristics
        self.X_train = X_train
        self.y_train = y_train
        self.model = TriageNeuralNetwork(input_dim=8, hidden_dim=16, seed=hash(client_id) % 1000)

    @property
    def sample_count(self) -> int:
        return len(self.X_train)

    def train_round(
        self,
        global_weights: Dict[str, np.ndarray],
        local_epochs: int = 5,
        learning_rate: float = 0.05
    ) -> Tuple[Dict[str, np.ndarray], int, Dict[str, float]]:
        """
        Receives global weights, performs local client epochs, and returns updated weights.
        """
        start_time = time.time()
        self.model.set_weights(global_weights)

        # Local training loop
        epoch_losses = []
        for _ in range(local_epochs):
            loss = self.model.train_step(self.X_train, self.y_train, lr=learning_rate)
            epoch_losses.append(loss)

        local_metrics = self.model.evaluate(self.X_train, self.y_train)
        duration_ms = round((time.time() - start_time) * 1000, 2)
        local_metrics["training_duration_ms"] = duration_ms
        local_metrics["final_epoch_loss"] = round(float(epoch_losses[-1]), 4)

        return self.model.get_weights(), self.sample_count, local_metrics
