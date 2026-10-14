"""
LifeLink AI - Triage Classification Neural Network
Vectorized Multi-Layer Perceptron (8 -> 16 -> 1) with ReLU and Sigmoid activations.
Supports exact parameter extraction, weight updates, and clinical metric evaluation.
"""
import numpy as np
from typing import Dict, Any, Tuple


class TriageNeuralNetwork:
    def __init__(self, input_dim: int = 8, hidden_dim: int = 16, seed: int = 42):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        rng = np.random.RandomState(seed)

        # He / Xavier initialization
        self.W1 = (rng.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)).astype(np.float32)
        self.b1 = np.zeros((1, hidden_dim), dtype=np.float32)
        self.W2 = (rng.randn(hidden_dim, 1) * np.sqrt(2.0 / hidden_dim)).astype(np.float32)
        self.b2 = np.zeros((1, 1), dtype=np.float32)

    def forward(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Computes forward pass:
        Z1 = X @ W1 + b1
        A1 = max(0, Z1) (ReLU)
        Z2 = A1 @ W2 + b2
        A2 = 1 / (1 + exp(-Z2)) (Sigmoid)
        """
        Z1 = np.dot(X, self.W1) + self.b1
        A1 = np.maximum(0, Z1)  # ReLU
        Z2 = np.dot(A1, self.W2) + self.b2
        A2 = 1.0 / (1.0 + np.exp(-np.clip(Z2, -15.0, 15.0)))  # Sigmoid
        return A1, A2

    def train_step(self, X: np.ndarray, y: np.ndarray, lr: float = 0.05) -> float:
        """
        Performs one epoch / batch of gradient descent.
        """
        m = X.shape[0]
        y_col = y.reshape(-1, 1).astype(np.float32)

        # Forward
        A1, A2 = self.forward(X)

        # Compute Binary Cross-Entropy Loss
        eps = 1e-7
        loss = -np.mean(y_col * np.log(A2 + eps) + (1.0 - y_col) * np.log(1.0 - A2 + eps))

        # Backward pass
        dZ2 = (A2 - y_col) / m
        dW2 = np.dot(A1.T, dZ2)
        db2 = np.sum(dZ2, axis=0, keepdims=True)

        dA1 = np.dot(dZ2, self.W2.T)
        dZ1 = dA1 * (A1 > 0).astype(np.float32)  # ReLU derivative
        dW1 = np.dot(X.T, dZ1)
        db1 = np.sum(dZ1, axis=0, keepdims=True)

        # Gradient update
        self.W1 -= lr * dW1
        self.b1 -= lr * db1
        self.W2 -= lr * dW2
        self.b2 -= lr * db2

        return float(loss)

    def get_weights(self) -> Dict[str, np.ndarray]:
        """Returns deep copy of model parameters."""
        return {
            "W1": np.copy(self.W1),
            "b1": np.copy(self.b1),
            "W2": np.copy(self.W2),
            "b2": np.copy(self.b2)
        }

    def set_weights(self, weights: Dict[str, np.ndarray]):
        """Sets model parameters from aggregated weights."""
        self.W1 = np.copy(weights["W1"])
        self.b1 = np.copy(weights["b1"])
        self.W2 = np.copy(weights["W2"])
        self.b2 = np.copy(weights["b2"])

    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """
        Calculates genuine classification metrics on evaluation data.
        """
        _, probs = self.forward(X)
        preds = (probs >= 0.5).astype(int).flatten()
        y_true = y.flatten()

        eps = 1e-7
        y_col = y_true.reshape(-1, 1).astype(np.float32)
        loss = float(-np.mean(y_col * np.log(probs + eps) + (1.0 - y_col) * np.log(1.0 - probs + eps)))

        accuracy = float(np.mean(preds == y_true))

        tp = np.sum((preds == 1) & (y_true == 1))
        fp = np.sum((preds == 1) & (y_true == 0))
        fn = np.sum((preds == 0) & (y_true == 1))

        precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        f1_score = float(2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

        return {
            "loss": round(loss, 4),
            "accuracy": round(accuracy * 100.0, 2),
            "precision": round(precision * 100.0, 2),
            "recall": round(recall * 100.0, 2),
            "f1_score": round(f1_score * 100.0, 2)
        }
