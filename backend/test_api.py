"""
Automated unit and integration tests for HotelGuard AI ML Pipeline & FastAPI Backend.
"""

import sys
import os
# import pytest
from fastapi.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from backend.app import app, startup_event

client = TestClient(app)

def test_startup_and_health():
    startup_event()
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["dataset_loaded"] is True

def test_model_info_and_registry():
    response = client.get("/model-info")
    assert response.status_code == 200
    info = response.json()
    assert "champion" in info
    assert info["champion"]["name"] in ["LightGBM", "XGBoost", "CatBoost", "Random Forest"]
    assert "optimal_threshold" in info["champion"]

    reg_resp = client.get("/model-registry")
    assert reg_resp.status_code == 200
    reg = reg_resp.json()
    assert len(reg) >= 5

def test_model_comparison():
    response = client.get("/model-comparison")
    assert response.status_code == 200
    data = response.json()
    assert "champion" in data
    assert "models" in data
    assert "selection_weights" in data

def test_predict_single():
    sample_booking = {
        "hotel": "City Hotel",
        "lead_time": 60,
        "arrival_date_year": 2017,
        "arrival_date_month": "August",
        "arrival_date_week_number": 33,
        "arrival_date_day_of_month": 15,
        "stays_in_weekend_nights": 1,
        "stays_in_week_nights": 2,
        "adults": 2,
        "children": 0,
        "babies": 0,
        "meal": "BB",
        "country": "PRT",
        "market_segment": "Online TA",
        "distribution_channel": "TA/TO",
        "is_repeated_guest": 0,
        "previous_cancellations": 0,
        "previous_bookings_not_canceled": 0,
        "reserved_room_type": "A",
        "assigned_room_type": "A",
        "booking_changes": 0,
        "deposit_type": "No Deposit",
        "days_in_waiting_list": 0,
        "customer_type": "Transient",
        "adr": 120.0,
        "required_car_parking_spaces": 0,
        "total_of_special_requests": 1
    }
    response = client.post("/predict", json=sample_booking)
    assert response.status_code == 200
    res = response.json()
    assert "cancellation_probability" in res
    assert 0.0 <= res["cancellation_probability"] <= 1.0
    assert res["risk_tier"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "estimated_revenue_at_risk" in res
    assert res["estimated_revenue_at_risk"] >= 0.0
    assert "risk_story" in res

def test_what_if_simulation():
    sample_booking = {
        "hotel": "City Hotel",
        "lead_time": 180,
        "arrival_date_year": 2017,
        "arrival_date_month": "August",
        "arrival_date_week_number": 33,
        "arrival_date_day_of_month": 15,
        "stays_in_weekend_nights": 2,
        "stays_in_week_nights": 3,
        "adults": 2,
        "children": 0,
        "babies": 0,
        "meal": "BB",
        "country": "PRT",
        "market_segment": "Online TA",
        "distribution_channel": "TA/TO",
        "is_repeated_guest": 0,
        "previous_cancellations": 1,
        "previous_bookings_not_canceled": 0,
        "reserved_room_type": "A",
        "assigned_room_type": "A",
        "booking_changes": 0,
        "deposit_type": "No Deposit",
        "days_in_waiting_list": 0,
        "customer_type": "Transient",
        "adr": 150.0,
        "required_car_parking_spaces": 0,
        "total_of_special_requests": 0
    }
    sim_payload = {
        "base_booking": sample_booking,
        "modified_features": {
            "lead_time": 10,
            "total_of_special_requests": 3,
            "deposit_type": "No Deposit"
        }
    }
    response = client.post("/what-if/simulate", json=sim_payload)
    assert response.status_code == 200
    res = response.json()
    assert "base_probability" in res
    assert "scenario_probability" in res
    assert "probability_difference" in res

def test_analytics_endpoints():
    r_overview = client.get("/analytics/overview")
    assert r_overview.status_code == 200
    assert r_overview.json()["total_bookings"] > 100000

    r_canc = client.get("/analytics/cancellation")
    assert r_canc.status_code == 200
    assert "by_hotel" in r_canc.json()

    r_lead = client.get("/analytics/lead-time")
    assert r_lead.status_code == 200
    assert "lead_time_cohorts" in r_lead.json()

def test_copilot():
    resp = client.post("/copilot/query", json={"query": "Which model won and why?"})
    assert resp.status_code == 200
    assert "LightGBM" in resp.json()["answer"] or "Champion" in resp.json()["answer"]

if __name__ == "__main__":
    print("[RUNNING TEST SUITE]")
    test_startup_and_health()
    test_model_info_and_registry()
    test_model_comparison()
    test_predict_single()
    test_what_if_simulation()
    test_analytics_endpoints()
    test_copilot()
    print("[ALL TESTS PASSED SUCCESSFULLY]")
