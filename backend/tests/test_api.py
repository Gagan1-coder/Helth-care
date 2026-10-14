"""
LifeLink AI - Comprehensive Backend Test Suite
Tests health, emergency lifecycle, deduplication, hospital discovery,
contact management, Agentic AI, and analytics.
"""
import pytest


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "services" in data


def test_hospital_search_by_city(client):
    response = client.post("/api/v1/hospitals/search", json={
        "city_district": "Bhatkal"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total_found"] > 0
    # Must find Bhatkal Taluka Hospital
    names = [f["name"] for f in data["facilities"]]
    assert any("Bhatkal" in n for n in names)


def test_hospital_search_by_coordinates(client):
    # Bhatkal town coordinates: ~13.98, 74.55
    response = client.post("/api/v1/hospitals/search", json={
        "latitude": 13.9824,
        "longitude": 74.5516,
        "radius_km": 50.0
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["facilities"]) > 0
    # Facilities must be ordered by distance
    first_dist = data["facilities"][0]["distance_km"]
    assert first_dist is not None
    assert first_dist < 5.0  # Within 5km


def test_emergency_lifecycle_and_cancellation(client):
    # 1. Create emergency
    create_payload = {
        "user_id": "test_patient_1",
        "category": "cardiac",
        "sos_method": "thumb_press",
        "location": {
            "latitude": 13.9824,
            "longitude": 74.5516,
            "accuracy_meters": 12.0,
            "source": "browser_geolocation"
        },
        "is_simulation": True
    }
    res = client.post("/api/v1/emergency/create", json=create_payload)
    assert res.status_code == 200
    ev = res.json()
    event_id = ev["id"]
    assert ev["category"] == "cardiac"
    assert len(ev["timeline"]) >= 1

    # 2. Duplicate prevention test: immediately triggering another should return same or deduplicate
    res_dup = client.post("/api/v1/emergency/create", json=create_payload)
    assert res_dup.status_code == 200
    ev_dup = res_dup.json()
    assert ev_dup["id"] == event_id, "Should return existing event to avoid duplicate dispatch"

    # 3. Retrieve event
    res_get = client.get(f"/api/v1/emergency/{event_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == event_id

    # 4. Cancel event
    res_cancel = client.post(f"/api/v1/emergency/{event_id}/cancel", json={
        "reason": "Test false alarm verification",
        "user_id": "test_patient_1"
    })
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "cancelled"


def test_contacts_crud_and_preview(client):
    # 1. Add contact
    contact_payload = {
        "user_id": "user_test_99",
        "name": "Emergency Guardian",
        "phone": "+919876543210",
        "relationship": "Parent",
        "is_trusted": True,
        "notify_sms": True,
        "notify_whatsapp": True,
        "consent_to_share_location": True
    }
    res_add = client.post("/api/v1/contacts", json=contact_payload)
    assert res_add.status_code == 200
    contact = res_add.json()
    contact_id = contact["id"]
    assert contact["name"] == "Emergency Guardian"

    # 2. Alert preview
    res_prev = client.post("/api/v1/contacts/preview-alert", json={
        "contact_name": "Emergency Guardian",
        "category": "cardiac",
        "latitude": 13.98,
        "longitude": 74.55
    })
    assert res_prev.status_code == 200
    prev_data = res_prev.json()
    assert "CARDIAC" in prev_data["sms_text"]
    assert "wa.me" in prev_data["whatsapp_url"]

    # 3. Delete contact
    res_del = client.delete(f"/api/v1/contacts/{contact_id}")
    assert res_del.status_code == 200


def test_agentic_ai_coordinator(client):
    coord_payload = {
        "user_id": "test_patient_1",
        "category": "road_accident",
        "latitude": 13.98,
        "longitude": 74.55,
        "vital_signs": {
            "heart_rate": 135,
            "oxygen_saturation": 88
        }
    }
    res = client.post("/api/v1/agent/coordinate", json=coord_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["urgency_level"] == "CRITICAL"
    assert len(data["reasoning_trace"]) >= 5
    assert len(data["tool_executions"]) >= 4
    assert "first_aid" in data
    assert len(data["first_aid"]["steps"]) > 0


def test_federated_status(client):
    res = client.get("/api/v1/federated/status")
    assert res.status_code == 200
    data = res.json()
    assert "clients" in data
    assert "aggregation_strategy" in data
    assert data["aggregation_strategy"] == "FedAvg (Federated Averaging)"


def test_analytics_metrics(client):
    res = client.get("/api/v1/analytics/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "emergency_events" in data
    assert "notifications" in data
