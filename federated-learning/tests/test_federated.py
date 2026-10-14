"""
LifeLink AI - Federated Learning Tests
Validates client local updates, FedAvg mathematical aggregation,
metric computation, and non-IID dataset generation.
"""
import pytest
import numpy as np
import os
import sys

FL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if FL_ROOT not in sys.path:
    sys.path.insert(0, FL_ROOT)

from datasets.clinical_triage_data import get_all_federated_datasets
from models.triage_net import TriageNeuralNetwork
from clients.hospital_client import HospitalClient
from server.federated_aggregator import federated_averaging, FederatedServer


def test_dataset_generation_shapes():
    data = get_all_federated_datasets()
    assert "client_1" in data
    assert "client_2" in data
    assert "client_3" in data
    assert "held_out_test" in data

    X1, y1 = data["client_1"]
    assert X1.shape[1] == 8
    assert len(X1) == len(y1)
    assert set(np.unique(y1)).issubset({0, 1})


def test_neural_network_forward_and_loss():
    model = TriageNeuralNetwork(input_dim=8, hidden_dim=16, seed=42)
    X = np.random.randn(20, 8).astype(np.float32)
    y = np.random.randint(0, 2, size=20).astype(np.int32)

    initial_loss = model.evaluate(X, y)["loss"]
    assert initial_loss > 0.0

    # Train for 5 epochs
    for _ in range(5):
        model.train_step(X, y, lr=0.05)

    trained_loss = model.evaluate(X, y)["loss"]
    assert trained_loss <= initial_loss, "Model should reduce or maintain loss during training"


def test_fedavg_aggregation():
    # Test sample-weighted averaging with known weights
    w1 = {"W1": np.ones((8, 16), dtype=np.float32) * 2.0}
    w2 = {"W1": np.ones((8, 16), dtype=np.float32) * 4.0}

    # If client 1 has 100 samples and client 2 has 100 samples, avg should be 3.0
    agg = federated_averaging([(w1, 100), (w2, 100)])
    np.testing.assert_allclose(agg["W1"], 3.0)

    # If client 1 has 300 samples and client 2 has 100 samples (3:1 ratio)
    # (3*2 + 1*4)/4 = 10/4 = 2.5
    agg_weighted = federated_averaging([(w1, 300), (w2, 100)])
    np.testing.assert_allclose(agg_weighted["W1"], 2.5)


def test_client_training_privacy():
    """Verify raw client data is never contained in returned model weight dictionary."""
    data = get_all_federated_datasets()
    X1, y1 = data["client_1"]

    client = HospitalClient(
        client_id="test_client",
        hospital_name="Test General Hospital",
        facility_type="General",
        data_characteristics="Balanced",
        X_train=X1,
        y_train=y1
    )

    global_weights = client.model.get_weights()
    updated_weights, num_samples, metrics = client.train_round(global_weights, local_epochs=2)

    # Check weight keys only contain model parameters
    assert set(updated_weights.keys()) == {"W1", "b1", "W2", "b2"}
    assert num_samples == len(X1)
    assert "accuracy" in metrics
    assert "loss" in metrics
