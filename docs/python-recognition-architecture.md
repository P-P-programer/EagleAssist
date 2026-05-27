# Python Recognition Architecture

## Decision
Use a Python recognition service as the face-comparison engine, while Laravel remains the orchestrator for persistence, business rules, and the web API.

## Why this approach
- The ESP32-CAM can stay lightweight and only capture/send images.
- Python has better tooling for image processing and face recognition.
- Laravel remains focused on users, faces, attendance records, and audit data.
- The architecture scales better than forcing computer vision into the PHP app.

## Responsibility split

### ESP32-CAM
- Capture a frame from the camera.
- Send the image to the Python service.
- Retry or report failure if the service is not reachable.

### Python service
- Receive the image.
- Detect and compare the face against stored templates.
- Return the match result with `face_id`, `name`, and `confidence`.
- Optionally expose a health endpoint for monitoring.

### Laravel
- Store faces, attendance records, and activation state.
- Orchestrate enroll and attendance flows.
- Persist the result returned by the Python service.
- Expose the dashboard consumed by the frontend.

## Suggested endpoints

### Python service
- `GET /health`
- `POST /recognize`
- `POST /enroll`

### Laravel API
- `GET /api/v1/dashboard`
- `POST /api/v1/faces/enroll`
- `PATCH /api/v1/faces/{face}/deactivate`
- `PATCH /api/v1/faces/{face}/reactivate`
- `POST /api/v1/attendance/validate`

## Suggested recognition payload

```json
{
  "image_base64": "...",
  "device_id": "esp32-cam-01",
  "captured_at": "2026-05-27T11:00:00Z"
}
```

## Suggested recognition response

```json
{
  "ok": true,
  "face_id": 12,
  "name": "Andrea Ramos",
  "confidence": 0.94,
  "match": true
}
```

## Next implementation step
Build the Python service contract first, then wire Laravel so it sends the image to Python and stores the returned `face_id` in `attendance_records`.