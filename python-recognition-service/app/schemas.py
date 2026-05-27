from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EnrollmentRequest(BaseModel):
    name: str = Field(min_length=3, max_length=255)
    source: Optional[str] = Field(default=None, max_length=120)


class EnrollmentResponse(BaseModel):
    ok: bool = True
    face_id: int
    name: str
    registered_at: datetime
    is_active: bool = True


class RecognitionRequest(BaseModel):
    image_base64: str = Field(min_length=32)
    device_id: str = Field(min_length=1, max_length=100)
    captured_at: datetime


class RecognitionResponse(BaseModel):
    ok: bool = True
    match: bool
    face_id: Optional[int] = None
    name: Optional[str] = None
    confidence: float = 0.0
    device_id: str
    captured_at: datetime
    reason: Optional[str] = None


class FaceSummary(BaseModel):
    face_id: int
    name: str
    registered_at: datetime
    is_active: bool = True


class HealthResponse(BaseModel):
    ok: bool = True
    service: str
    version: str
    known_faces: int
    uptime_seconds: int
