"""
LifeLink AI - Synthetic Clinical Triage Dataset Generator
Generates realistic, non-IID clinical vital signs for 3 simulated hospitals
and an independent held-out test set for federated evaluation.
"""
import numpy as np
from typing import Dict, Tuple

FEATURE_NAMES = [
    "Heart Rate (bpm)",
    "Systolic BP (mmHg)",
    "Diastolic BP (mmHg)",
    "Respiratory Rate (/min)",
    "Oxygen Saturation (%)",
    "Body Temp (°C)",
    "Age (years)",
    "Glasgow Coma Scale"
]

def generate_client_dataset(
    n_samples: int,
    seed: int,
    bias_type: str = "balanced"
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generates synthetic clinical vital signs with realistic physiological distributions.
    """
    rng = np.random.RandomState(seed)

    if bias_type == "rural":
        # Older demographics, respiratory/infection presentations
        age = rng.normal(58, 14, n_samples).clip(18, 90)
        hr = rng.normal(82, 16, n_samples).clip(45, 160)
        sbp = rng.normal(128, 22, n_samples).clip(75, 210)
        dbp = (sbp * 0.65) + rng.normal(0, 8, n_samples).clip(45, 120)
        rr = rng.normal(20, 5, n_samples).clip(10, 42)
        spo2 = rng.normal(94, 4, n_samples).clip(78, 100)
        temp = rng.normal(37.4, 0.9, n_samples).clip(35.5, 40.5)
        gcs = rng.choice([15, 14, 13, 12, 11, 10], size=n_samples, p=[0.7, 0.12, 0.08, 0.05, 0.03, 0.02])

    elif bias_type == "trauma":
        # Younger demographics, acute severe shock / tachycardia / hypoxemia
        age = rng.normal(36, 15, n_samples).clip(16, 80)
        hr = rng.normal(98, 24, n_samples).clip(50, 180)
        sbp = rng.normal(110, 26, n_samples).clip(60, 200)
        dbp = (sbp * 0.62) + rng.normal(0, 10, n_samples).clip(40, 115)
        rr = rng.normal(24, 7, n_samples).clip(8, 48)
        spo2 = rng.normal(92, 6, n_samples).clip(70, 100)
        temp = rng.normal(36.8, 0.7, n_samples).clip(34.8, 39.5)
        gcs = rng.choice([15, 14, 13, 11, 8, 5, 3], size=n_samples, p=[0.45, 0.15, 0.15, 0.10, 0.08, 0.04, 0.03])

    elif bias_type == "cardiac":
        # Older demographics, extreme hypertension/hypotension, severe tachycardia/bradycardia
        age = rng.normal(64, 11, n_samples).clip(35, 92)
        hr = rng.normal(92, 26, n_samples).clip(38, 190)
        sbp = rng.normal(146, 28, n_samples).clip(70, 230)
        dbp = (sbp * 0.68) + rng.normal(0, 9, n_samples).clip(50, 135)
        rr = rng.normal(21, 4, n_samples).clip(12, 38)
        spo2 = rng.normal(93, 4, n_samples).clip(80, 100)
        temp = rng.normal(37.0, 0.5, n_samples).clip(36.0, 39.0)
        gcs = rng.choice([15, 14, 13, 12, 10], size=n_samples, p=[0.75, 0.12, 0.06, 0.04, 0.03])

    else:
        # General balanced population
        age = rng.normal(48, 18, n_samples).clip(18, 88)
        hr = rng.normal(84, 18, n_samples).clip(45, 170)
        sbp = rng.normal(124, 20, n_samples).clip(75, 210)
        dbp = (sbp * 0.65) + rng.normal(0, 7, n_samples).clip(45, 120)
        rr = rng.normal(19, 4, n_samples).clip(10, 40)
        spo2 = rng.normal(95, 3, n_samples).clip(80, 100)
        temp = rng.normal(37.1, 0.6, n_samples).clip(35.5, 40.0)
        gcs = rng.choice([15, 14, 13, 11, 8], size=n_samples, p=[0.70, 0.15, 0.08, 0.04, 0.03])

    X = np.column_stack([hr, sbp, dbp, rr, spo2, temp, age, gcs])

    # Clinically realistic risk equation
    # Critical risk if: hypoxia (SpO2 < 90), severe shock (SBP < 90), severe tachycardia (HR > 130), low GCS (< 12)
    risk_score = (
        0.35 * (spo2 < 91).astype(float) +
        0.30 * (sbp < 90).astype(float) +
        0.20 * (hr > 125).astype(float) +
        0.25 * (gcs < 12).astype(float) +
        0.15 * (rr > 28).astype(float) +
        0.10 * (age > 70).astype(float) +
        rng.normal(0, 0.08, n_samples)
    )
    y = (risk_score >= 0.35).astype(int)

    # Normalize X with standard clinical means and standard deviations
    means = np.array([85.0, 125.0, 80.0, 20.0, 95.0, 37.0, 50.0, 14.0])
    stds = np.array([20.0, 25.0, 15.0, 5.0, 4.0, 0.8, 18.0, 2.0])
    X_norm = (X - means) / stds

    return X_norm.astype(np.float32), y.astype(np.int32)


def get_all_federated_datasets() -> Dict[str, Tuple[np.ndarray, np.ndarray]]:
    """
    Returns separate non-IID training datasets for 3 hospitals and 1 independent held-out test set.
    """
    client1_data = generate_client_dataset(n_samples=350, seed=101, bias_type="rural")
    client2_data = generate_client_dataset(n_samples=650, seed=102, bias_type="trauma")
    client3_data = generate_client_dataset(n_samples=450, seed=103, bias_type="cardiac")
    test_data = generate_client_dataset(n_samples=300, seed=999, bias_type="balanced")

    return {
        "client_1": client1_data,
        "client_2": client2_data,
        "client_3": client3_data,
        "held_out_test": test_data
    }
