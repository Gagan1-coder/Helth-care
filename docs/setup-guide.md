# LifeLink AI — Local Installation & Setup Guide

This guide describes how to run LifeLink AI locally on Windows, macOS, or Linux using standard native development tools.

> **Notice:** This project runs directly on host operating systems using **standard Python and Node.js commands** (No Docker required).

---

## 1. System Prerequisites

Ensure you have the following installed on your machine:
1. **Python**: Version 3.8 or newer (`python --version`)
2. **Node.js & npm**: Version 18 or newer (`node --version`, `npm --version`)
3. **Web Browser**: Chrome, Edge, Firefox, or Safari with Geolocation enabled.

---

## 2. Step-by-Step Installation

### Step A: Clone or Navigate to the Workspace
```bash
cd "c:\life limk"
```

### Step B: Backend Setup (FastAPI)
1. Install Python backend dependencies:
   ```bash
   python -m pip install fastapi uvicorn pydantic requests python-dotenv httpx pytest numpy
   ```

2. Configure backend environment variables (Optional):
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Note: If environment keys are left blank, the backend operates in Local Dev / Demo Sandbox mode with zero setup friction.*

3. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
   ```
   - **Backend API**: http://127.0.0.1:8000
   - **Interactive API Documentation (Swagger)**: http://127.0.0.1:8000/docs
   - **Health Diagnostic Endpoint**: http://127.0.0.1:8000/api/v1/health

---

### Step C: Frontend Setup (React + Vite)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   # On Windows PowerShell with restricted execution policy:
   npm.cmd install
   ```

3. Configure frontend environment variables (Optional):
   ```bash
   cp .env.example .env
   ```
   *Default API base URL is set to `http://localhost:8000`.*

4. Launch the Vite development server:
   ```bash
   npm run dev
   # Or on Windows PowerShell:
   npm.cmd run dev
   ```
   - **Frontend Application**: http://localhost:5173

---

## 3. Running Federated Learning

To execute the 5-round multi-hospital Federated Learning training experiment:
```bash
python federated-learning/experiments/run_experiment.py
```
This trains across 3 simulated hospitals, runs FedAvg aggregation, evaluates the global model on the held-out clinical test set, and updates `fl_results.json`.

---

## 4. Running the Complete Automated Test Suite

To run all backend and Federated Learning test suites:
```bash
# Run backend API test suite
python -m pytest backend/tests/test_api.py -v

# Run Federated Learning test suite
python -m pytest federated-learning/tests/test_federated.py -v
```

---

## 5. Verification Checklist

- [x] Backend responds with HTTP 200 at `http://127.0.0.1:8000/api/v1/health`
- [x] Swagger UI opens at `http://127.0.0.1:8000/docs`
- [x] Frontend opens at `http://localhost:5173`
- [x] Location permission prompt requests device coordinates
- [x] Language switcher instantly translates between English and Kannada
- [x] All 12 automated unit and integration tests pass
