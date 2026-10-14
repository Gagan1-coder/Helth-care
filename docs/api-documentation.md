# LifeLink AI — REST API Documentation

Base URL: `http://localhost:8000/api/v1`  
Interactive Swagger UI: `http://localhost:8000/docs`

---

## 1. System Health & Diagnostics

### `GET /health`
Returns system status, active database engine (Firestore vs local dev store), maps provider, and coordinator state.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "LifeLink AI - Emergency Healthcare Coordinator",
  "version": "1.0.0",
  "uptime_seconds": 142.5,
  "database": {
    "engine": "Local Development In-Memory Store",
    "firebase_connected": false,
    "status_label": "Local Dev Storage (Safe In-Memory Mode)"
  },
  "services": {
    "hospital_search": {
      "primary": "OpenStreetMap Overpass API (Live Zero-Cost)",
      "verified_registry": "Uttara Kannada & Karnataka Regional Registry Active"
    },
    "emergency_notifications": {
      "sms_provider": "mock",
      "mode": "Safe Local Mock / Dev Sandbox (No Live Charges)",
      "whatsapp": "Direct Click-to-Chat Deep-Links Active"
    }
  }
}
```

---

## 2. Emergency Workflow

### `POST /emergency/create`
Triggers an emergency SOS broadcast. Deduplicates within 60 seconds, attaches location, matches nearest facilities, and dispatches contact notifications.
- **Request Body**:
```json
{
  "user_id": "usr_123",
  "category": "cardiac",
  "sos_method": "thumb_press",
  "location": {
    "latitude": 13.9824,
    "longitude": 74.5516,
    "accuracy_meters": 15.0,
    "source": "browser_geolocation"
  },
  "is_simulation": false
}
```
- **Response `200 OK`**: Returns complete `EmergencyResponse` object with event ID, timeline, recommended hospitals, and notification logs.

### `POST /emergency/{event_id}/cancel`
Cancels an active emergency event with mandatory reason.
- **Request Body**:
```json
{
  "reason": "Accidental tap, resolved safely",
  "user_id": "usr_123"
}
```

### `POST /emergency/{event_id}/resolve`
Marks an active emergency as resolved once medical help arrives.

---

## 3. Hospital Discovery

### `POST /hospitals/search`
Searches verified emergency centers and OpenStreetMap live healthcare nodes using coordinates or text queries.
- **Request Body**:
```json
{
  "latitude": 13.9824,
  "longitude": 74.5516,
  "category": "cardiac",
  "radius_km": 30.0
}
```
- **Response `200 OK`**:
```json
{
  "query_coordinates": { "lat": 13.9824, "lon": 74.5516 },
  "total_found": 3,
  "data_source": "Verified Regional Healthcare Registry",
  "facilities": [
    {
      "id": "hosp_bhatkal_taluka",
      "name": "Bhatkal Taluka Government General Hospital",
      "address": "Hospital Road, Near Ranginkatte, Bhatkal, Karnataka 581320",
      "distance_km": 0.42,
      "drive_time_minutes": 2,
      "phone": "+91 8386 226224",
      "has_icu": true,
      "has_ambulance": true,
      "open_24x7": true,
      "match_reason": "Closest 24x7 verified emergency facility with ICU readiness."
    }
  ]
}
```

---

## 4. Emergency Contacts

### `GET /contacts/user/{user_id}`
Returns all contacts registered for a user.

### `POST /contacts`
Registers a new emergency contact with validated phone and consent.

### `POST /contacts/preview-alert`
Generates live SMS text and pre-encoded WhatsApp link without sending.

### `POST /contacts/acknowledge`
Records that a human contact confirmed receipt of the emergency alert.

---

## 5. Agentic AI Coordinator

### `POST /agent/coordinate`
Executes multi-tool agentic reasoning: evaluates vitals, analyzes location confidence, retrieves WHO/Red Cross first-aid guidance, searches facilities, and prepares approval gates.
- **Request Body**:
```json
{
  "user_id": "usr_123",
  "category": "cardiac",
  "latitude": 13.9824,
  "longitude": 74.5516,
  "vital_signs": {
    "heart_rate": 130,
    "oxygen_saturation": 89,
    "systolic_bp": 140
  }
}
```

---

## 6. Federated Learning

### `GET /federated/status`
Returns metrics, rounds, and baseline comparison from `fl_results.json`.

### `POST /federated/run`
Executes a 5-round FedAvg experiment across the 3 simulated hospital clients and re-evaluates on the held-out test set.
