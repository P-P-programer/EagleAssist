from __future__ import annotations

from datetime import datetime, timezone
from time import monotonic

import os

from fastapi import FastAPI, HTTPException, Depends, Header, status

from .schemas import EnrollmentRequest, EnrollmentResponse, FaceSummary, HealthResponse, RecognitionRequest, RecognitionResponse
from .service import FaceRegistry

app = FastAPI(
    title="EagleAssist Recognition Service",
    version="0.1.0",
    description="Python intermediary for face recognition before Laravel persistence.",
)

started_at = monotonic()
registry = FaceRegistry()
registry.seed()


def verify_token(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None, alias="X-Api-Key"),
) -> None:
    expected = os.environ.get('RECOGNITION_TOKEN')
    if not expected:
        return None

    token = None
    if authorization and authorization.startswith('Bearer '):
        token = authorization.split(' ', 1)[1]
    elif x_api_key:
        token = x_api_key

    if token != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or missing API token')


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    uptime_seconds = int(monotonic() - started_at)
    summary = registry.summary()

    return HealthResponse(
        service="EagleAssist Recognition Service",
        version="0.1.0",
        known_faces=summary["total"],
        uptime_seconds=uptime_seconds,
    )


@app.get("/faces", response_model=list[FaceSummary])
def list_faces() -> list[FaceSummary]:
    return registry.faces


@app.post("/enroll", response_model=EnrollmentResponse)
def enroll_face(payload: EnrollmentRequest, _=Depends(verify_token)) -> EnrollmentResponse:
    face = registry.enroll(payload.name)
    return EnrollmentResponse(
        face_id=face.face_id,
        name=face.name,
        registered_at=face.registered_at,
        is_active=face.is_active,
    )


@app.post("/recognize", response_model=RecognitionResponse)
def recognize_face(payload: RecognitionRequest, _=Depends(verify_token)) -> RecognitionResponse:
    return registry.recognize(payload)


@app.patch("/faces/{face_id}/deactivate", response_model=FaceSummary)
def deactivate_face(face_id: int, _=Depends(verify_token)) -> FaceSummary:
    face = registry.deactivate(face_id)
    if face is None:
        raise HTTPException(status_code=404, detail="Face not found")
    return face


@app.patch("/faces/{face_id}/reactivate", response_model=FaceSummary)
def reactivate_face(face_id: int, _=Depends(verify_token)) -> FaceSummary:
    face = registry.reactivate(face_id)
    if face is None:
        raise HTTPException(status_code=404, detail="Face not found")
    return face
