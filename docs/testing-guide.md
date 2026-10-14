# LifeLink AI — Testing and Verification Guide

## 1. Test Overview

LifeLink AI includes comprehensive test coverage across backend endpoints, emergency state transitions, spatial algorithms, Agentic AI tool execution, and Federated Learning model aggregation.

```text
Test Suite Summary:
├── backend/tests/test_api.py (8 Test Cases) -> 100% Passed
├── federated-learning/tests/test_federated.py (4 Test Cases) -> 100% Passed
└── frontend build verification (Vite production bundle) -> 100% Success
```

---

## 2. Running Automated Backend Tests

Execute pytest on `backend/tests/test_api.py`:
```bash
python -m pytest backend/tests/test_api.py -v
```

### Verified Test Cases:
1. `test_health_endpoint`: Asserts health reporting, DB engine status, and provider configuration.
2. `test_hospital_search_by_city`: Validates regional query for Bhatkal returns Taluka General Hospital.
3. `test_hospital_search_by_coordinates`: Verifies Haversine distance calculation and sorting by proximity.
4. `test_emergency_lifecycle_and_cancellation`: Tests creation, 60s duplicate prevention, status retrieval, and cancellation.
5. `test_contacts_crud_and_preview`: Tests contact addition, phone validation, alert preview, and deletion.
6. `test_agentic_ai_coordinator`: Tests multi-tool workflow execution, critical triage rating, and first-aid retrieval.
7. `test_federated_status`: Verifies FedAvg aggregation strategy and client registration.
8. `test_analytics_metrics`: Validates real performance measurements and privacy redaction.

---

## 3. Running Federated Learning Tests

Execute pytest on `federated-learning/tests/test_federated.py`:
```bash
python -m pytest federated-learning/tests/test_federated.py -v
```

### Verified Test Cases:
1. `test_dataset_generation_shapes`: Ensures non-IID clinical vitals conform to $(N, 8)$ feature matrix and binary target labels.
2. `test_neural_network_forward_and_loss`: Verifies forward pass, ReLU/Sigmoid activations, and loss descent during training.
3. `test_fedavg_aggregation`: Numerically verifies sample-weighted parameter averaging math ($w = \sum \frac{n_k}{N} w_k$).
4. `test_client_training_privacy`: Enforces privacy constraint — returned client update payloads only contain model weights ($W1, b1, W2, b2$), never raw patient records.

---

## 4. Frontend Production Build Verification

Verify that React, JSX, plain CSS, and asset bundling compile with zero errors:
```bash
cd frontend
npm run build
# On Windows PowerShell:
npm.cmd run build
```
Expected output:
```text
✓ 1607 modules transformed.
✓ built in ~1.5s
dist/index.html
dist/assets/index.css
dist/assets/index.js
```
