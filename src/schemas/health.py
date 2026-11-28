"""Pydantic schemas for the application health endpoint."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ComponentStatus(BaseModel):
    """Represent the health and latency of an application component."""

    status: Literal["healthy", "degraded", "down"]
    latency_ms: float = Field(..., ge=0, allow_inf_nan=False)
    message: str = "Operating normally"


class HealthResponse(BaseModel):
    """Represent the overall application health response."""

    status: Literal["healthy", "degraded", "down"]
    version: str = Field(..., min_length=1)
    uptime_seconds: float = Field(..., ge=0, allow_inf_nan=False)
    timestamp: datetime
    model_loaded: bool = True
    database: ComponentStatus
