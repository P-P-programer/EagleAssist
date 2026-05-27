from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from hashlib import sha256
from itertools import cycle
from typing import Optional

from .schemas import FaceSummary, RecognitionRequest, RecognitionResponse


@dataclass
class FaceRegistry:
    faces: list[FaceSummary] = field(default_factory=list)
    _next_id: int = 1

    def seed(self) -> None:
        if self.faces:
            return

        self.enroll("Test User")
        self.enroll("Maria Lopez")
        self.enroll("Carlos Perez")

    def enroll(self, name: str) -> FaceSummary:
        normalized_name = name.strip()
        existing = self.find_by_name(normalized_name)

        if existing is not None:
            updated = FaceSummary(
                face_id=existing.face_id,
                name=existing.name,
                registered_at=datetime.now(timezone.utc),
                is_active=True,
            )
            self.faces = [updated if face.face_id == existing.face_id else face for face in self.faces]
            return updated

        face = FaceSummary(
            face_id=self._next_id,
            name=normalized_name,
            registered_at=datetime.now(timezone.utc),
            is_active=True,
        )
        self.faces.append(face)
        self._next_id += 1
        return face

    def deactivate(self, face_id: int) -> Optional[FaceSummary]:
        face = self.find_by_id(face_id)
        if face is None:
            return None

        updated = FaceSummary(
            face_id=face.face_id,
            name=face.name,
            registered_at=face.registered_at,
            is_active=False,
        )
        self.faces = [updated if current.face_id == face.face_id else current for current in self.faces]
        return updated

    def reactivate(self, face_id: int) -> Optional[FaceSummary]:
        face = self.find_by_id(face_id)
        if face is None:
            return None

        updated = FaceSummary(
            face_id=face.face_id,
            name=face.name,
            registered_at=face.registered_at,
            is_active=True,
        )
        self.faces = [updated if current.face_id == face.face_id else current for current in self.faces]
        return updated

    def find_by_id(self, face_id: int) -> Optional[FaceSummary]:
        return next((face for face in self.faces if face.face_id == face_id), None)

    def find_by_name(self, name: str) -> Optional[FaceSummary]:
        normalized_name = name.strip().casefold()
        return next((face for face in self.faces if face.name.casefold() == normalized_name), None)

    def recognize(self, request: RecognitionRequest) -> RecognitionResponse:
        active_faces = [face for face in self.faces if face.is_active]
        if not active_faces:
            return RecognitionResponse(
                ok=True,
                match=False,
                device_id=request.device_id,
                captured_at=request.captured_at,
                confidence=0.0,
                reason="No active faces available in the registry.",
            )

        digest = sha256(request.image_base64.encode("utf-8")).digest()
        face_index = digest[0] % len(active_faces)
        confidence_bucket = digest[1] / 255
        matched_face = active_faces[face_index]
        confidence = round(0.78 + (confidence_bucket * 0.2), 2)

        if confidence < 0.82:
            return RecognitionResponse(
                ok=True,
                match=False,
                device_id=request.device_id,
                captured_at=request.captured_at,
                confidence=confidence,
                reason="Confidence below threshold.",
            )

        return RecognitionResponse(
            ok=True,
            match=True,
            face_id=matched_face.face_id,
            name=matched_face.name,
            confidence=confidence,
            device_id=request.device_id,
            captured_at=request.captured_at,
        )

    def summary(self) -> dict[str, int]:
        active_count = sum(1 for face in self.faces if face.is_active)
        return {
            "total": len(self.faces),
            "active": active_count,
            "inactive": len(self.faces) - active_count,
        }
