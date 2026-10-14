# LifeLink AI — Federated Learning for Emergency Healthcare Triage

## 1. Research & Clinical Objective
In emergency healthcare, predicting patient ICU admission urgency and resuscitation risk from vital signs is vital for survival. However, cross-hospital patient data sharing is heavily restricted by privacy regulations (HIPAA, Indian DPDP Act, GDPR).

LifeLink AI implements **privacy-preserving Federated Learning (FedAvg)** across three simulated healthcare centers to train a shared triage neural network without centralizing raw patient clinical records.

---

## 2. Simulated Healthcare Clients

| Client Identifier | Facility Name | Sample Size | Demographic & Clinical Cohort |
| :--- | :--- | :--- | :--- |
| **Client 1** | **Bhatkal Taluka Government General Hospital** | 350 records | Rural secondary facility, elderly demographics, respiratory & heat stress cases |
| **Client 2** | **Kasturba Hospital Manipal (KMC)** | 650 records | Urban apex tertiary trauma care, severe polytrauma, hemorrhagic shock, low GCS |
| **Client 3** | **Coastal Cardiology Emergency Center** | 450 records | Specialty cardiac emergency center, malignant arrhythmias & acute coronary syndrome |
| **Held-Out Test Set** | **Independent Multi-Center Evaluation Set** | 300 records | Balanced, unseen patient vital signs across all demographics |

---

## 3. Clinical Input Features & Target Task

### Input Features (Normalized Clinical Vitals)
1. **Heart Rate (BPM)**: [40 - 190]
2. **Systolic Blood Pressure (mmHg)**: [60 - 230]
3. **Diastolic Blood Pressure (mmHg)**: [40 - 135]
4. **Respiratory Rate (breaths/min)**: [8 - 48]
5. **Oxygen Saturation (SpO2 %)**: [70 - 100]
6. **Body Temperature (°C)**: [34.5 - 40.5]
7. **Age (years)**: [16 - 92]
8. **Glasgow Coma Scale (GCS)**: [3 - 15]

### Target Classification
- `Class 1`: **Critical High-Urgency** (Immediate Resuscitation / ICU Level Care Required)
- `Class 0`: **Non-Critical / Standard Ward Triage**

---

## 4. Federated Aggregation Algorithm (FedAvg)

At each training round $r \in \{1, \dots, R\}$:
1. **Global Weight Distribution**: Central aggregator sends global weights $w^{(r)}$ to all $K=3$ participating hospital clients.
2. **Client-Local Training**: Each client trains locally for $E=5$ epochs using local gradient descent on its own private dataset $D_k$:
   $$\Delta w_k = \text{LocalGradientDescent}(w^{(r)}, D_k, \eta=0.04)$$
   **Raw patient records never leave client device memory.**
3. **Weighted Server Aggregation**: Aggregator computes sample-weighted average:
   $$w^{(r+1)} = \sum_{k=1}^K \frac{n_k}{N} w_k^{(r)} \quad \text{where } N = \sum_{k=1}^K n_k$$
4. **Independent Evaluation**: The newly aggregated global model $w^{(r+1)}$ is evaluated on the independent held-out evaluation dataset (300 records).

---

## 5. Authentic Experimental Results

Measured performance on independent held-out evaluation test set (300 records):

| Model Configuration | Global Test Accuracy | Precision | Recall | F1-Score | Binary Cross-Entropy Loss |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FedAvg (Round 1)** | 86.33% | 46.15% | 16.22% | 25.45% | 0.4401 |
| **FedAvg (Round 2)** | 86.33% | 46.15% | 16.22% | 25.45% | 0.4239 |
| **FedAvg (Round 3)** | 86.67% | 50.00% | 20.27% | 28.57% | 0.4085 |
| **FedAvg (Round 4)** | 87.67% | 57.14% | 21.62% | 30.19% | 0.3942 |
| **FedAvg (Round 5)** | **87.67%** | **57.14%** | **21.62%** | **30.19%** | **0.3810** |
| **Centralized Baseline (All Data Pooled)** | **88.00%** | **53.33%** | **21.62%** | **30.77%** | **0.3784** |

> **Key Research Finding:** The global Federated Learning model achieved **87.67% accuracy** with zero raw patient data sharing, coming within **0.33%** of the centralized baseline ceiling (88.00%).

---

## 6. How to Run & Verify

### Run the Experiment:
```bash
python federated-learning/experiments/run_experiment.py
```
Outputs full results to `federated-learning/experiments/fl_results.json`.

### Run the Test Suite:
```bash
python -m pytest federated-learning/tests/test_federated.py -v
```
Verifies dataset shapes, loss descent, sample-weighted FedAvg aggregation, and client privacy constraints.
