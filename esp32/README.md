ESP32 integration notes and example sketch

Overview
- Place device-specific values in `esp32/config.h` (or copy `example_config.h` to `config.h`).
- For local-only testing you do not need Cloudflare Tunnel yet. Use your LAN IPs and connect the ESP32 to WiFi.

Multipart workflow (recommended):
1. Capture JPEG frame from the camera.
2. POST `multipart/form-data` to `LARAVEL_URL + ATTENDANCE_ENDPOINT` with fields:
  - `image` = JPEG file bytes
  - `device_id` = `esp32-cam-01`
  - `captured_at` = ISO-8601 timestamp
  - `action` = `Entrada` or `Salida`
3. Include token if required: header `Authorization: Bearer <RECOGNITION_TOKEN>` or `X-Api-Key: <RECOGNITION_TOKEN>`

Local preview stream/snapshot
- `CAMERA_STREAM_URL` can point to the ESP32-CAM MJPEG stream for preview in the browser UI.
- `CAMERA_SNAPSHOT_URL` can point to a single JPEG endpoint if you prefer snapshot capture.
- If the camera stream does not allow CORS, the browser can still display it as an `<img>` source, but direct canvas capture may need a same-origin proxy later.

Base64 fallback (manual testing only):
Use JSON with `image_base64` when you want to test from curl/Postman without multipart support.

Minimal Arduino-style sketch (pseudo-code using base64 JSON):
See `esp32/esp32cam_multipart_example.ino` for a complete multipart upload sketch.

Notes
- For large images you may need to reduce quality or stream multipart.
- For production, use HTTPS/tunneling and per-device tokens if desired.
