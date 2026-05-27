# EagleAssist Python Recognition Service

Servicio Python de intermediación para el reconocimiento facial.

## Qué hace
- Recibe imágenes desde el ESP32-CAM.
- Simula el reconocimiento facial con una respuesta consistente para demo.
- Administra enrolamiento, desactivación y reactivación de rostros en memoria.
- Devuelve `face_id`, nombre y confianza para que Laravel persista la asistencia.

## Endpoints
- `GET /health`
- `GET /faces`
- `POST /enroll`
- `POST /recognize`
- `PATCH /faces/{face_id}/deactivate`
- `PATCH /faces/{face_id}/reactivate`

## Payload de reconocimiento
```json
{
  "image_base64": "...",
  "device_id": "esp32-cam-01",
  "captured_at": "2026-05-27T11:00:00Z"
}
```

## Ejecutar localmente
```bash
cd python-recognition-service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Seguridad (token)
Para mayor seguridad puedes definir `RECOGNITION_TOKEN` en el entorno. Si está presente, el servicio exigirá un header `Authorization: Bearer <token>` o `X-Api-Key: <token>` en los endpoints de enrolamiento y reconocimiento.
