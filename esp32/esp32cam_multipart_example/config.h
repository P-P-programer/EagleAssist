// Universal ESP32 config - keep values empty for per-environment overrides
#ifndef EAGLEASSIST_ESP32_CONFIG_H
#define EAGLEASSIST_ESP32_CONFIG_H

// WiFi credentials (set in example_config.h or via provisioning)
#define WIFI_SSID "UNIESPINAL"
#define WIFI_PASS ""

// Backend endpoints (change to your LAN IP / hostnames)
// Python recognizer (optional) and Laravel API base
#define RECOGNITION_URL "http://127.0.0.1:8000"
#define LARAVEL_URL "http://127.0.0.1:8001"
#define ATTENDANCE_ENDPOINT "/api/v1/attendance/from-image"

// Optional ESP32-CAM preview endpoints for local UI testing
#define CAMERA_STREAM_URL ""
#define CAMERA_SNAPSHOT_URL ""

// Shared token between services (RECOGNITION_TOKEN)
#define RECOGNITION_TOKEN ""

// Device identification
#define DEVICE_ID "esp32-cam-01"

// Capture options
#define JPEG_QUALITY 10
#define IMAGE_MAX_SIZE 60000

#endif // EAGLEASSIST_ESP32_CONFIG_H
