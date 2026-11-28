from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from src.api.schemas import (
    DetectionBoxSchema,
    DetectionItemSchema,
    DetectionResponseSchema,
)
from src.schemas.health import ComponentStatus, HealthResponse


def test_detection_response_schema():
    box = DetectionBoxSchema(xmin=0.1, ymin=0.2, xmax=0.5, ymax=0.6)
    item = DetectionItemSchema(
        class_id=0,
        class_name="plastic_bottle",
        confidence=0.95,
        box=box,
    )
    response = DetectionResponseSchema(
        num_detections=1,
        inference_time_ms=12.4,
        detections=[item],
    )

    assert response.status == "success"
    assert response.num_detections == 1
    assert response.detections[0].class_name == "plastic_bottle"


def health_payload():
    """Return a valid health response payload for validation tests."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "uptime_seconds": 120.0,
        "timestamp": datetime.now(timezone.utc),
        "database": {
            "status": "healthy",
            "latency_ms": 35.0,
        },
    }


def test_health_response_schema():
    response = HealthResponse(**health_payload())

    assert response.status == "healthy"
    assert response.version == "1.0.0"
    assert response.uptime_seconds == 120.0
    assert response.model_loaded is True
    assert response.database.latency_ms == 35.0


def test_component_status_defaults_message():
    component = ComponentStatus(status="healthy", latency_ms=10.0)

    assert component.message == "Operating normally"


def test_component_status_rejects_negative_latency():
    with pytest.raises(ValidationError):
        ComponentStatus(status="healthy", latency_ms=-10)


@pytest.mark.parametrize("latency", [float("inf"), float("-inf"), float("nan")])
def test_component_status_rejects_non_finite_latency(latency):
    with pytest.raises(ValidationError):
        ComponentStatus(status="healthy", latency_ms=latency)


def test_component_status_rejects_invalid_status():
    with pytest.raises(ValidationError):
        ComponentStatus(status="unknown", latency_ms=10.0)


def test_health_response_rejects_invalid_status():
    payload = health_payload()
    payload["status"] = "unknown"

    with pytest.raises(ValidationError):
        HealthResponse(**payload)


def test_health_response_rejects_negative_uptime():
    payload = health_payload()
    payload["uptime_seconds"] = -1.0

    with pytest.raises(ValidationError):
        HealthResponse(**payload)


@pytest.mark.parametrize("uptime", [float("inf"), float("-inf"), float("nan")])
def test_health_response_rejects_non_finite_uptime(uptime):
    payload = health_payload()
    payload["uptime_seconds"] = uptime

    with pytest.raises(ValidationError):
        HealthResponse(**payload)


def test_health_response_rejects_empty_version():
    payload = health_payload()
    payload["version"] = ""

    with pytest.raises(ValidationError):
        HealthResponse(**payload)
