// Example values for local development - COPY this file to config.h and edit
#ifndef EAGLEASSIST_ESP32_EXAMPLE_CONFIG_H
#define EAGLEASSIST_ESP32_EXAMPLE_CONFIG_H

// WiFi - replace with your network
#undef WIFI_SSID
#undef WIFI_PASS
#define WIFI_SSID "MiRedWifi"
#define WIFI_PASS "MiPasswordSegura"

// Backend - use IPs reachable from the ESP32 (LAN)
#undef LARAVEL_URL
#define LARAVEL_URL "http://192.168.1.10:8001"

// Optional local preview stream/snapshot URLs for the browser UI
#undef CAMERA_STREAM_URL
#define CAMERA_STREAM_URL "http://192.168.1.50:81/stream"

#undef CAMERA_SNAPSHOT_URL
#define CAMERA_SNAPSHOT_URL "http://192.168.1.50/capture"

// If you use the Python service directly, set RECOGNITION_URL accordingly
#undef RECOGNITION_URL
#define RECOGNITION_URL "http://192.168.1.10:8000"

// Shared token (must match RECOGNITION_TOKEN in Laravel .env)
#undef RECOGNITION_TOKEN
#define RECOGNITION_TOKEN "secret-token"

// Device id
#undef DEVICE_ID
#define DEVICE_ID "esp32-cam-lobby"

// Capture settings
#undef JPEG_QUALITY
#define JPEG_QUALITY 10

#endif // EAGLEASSIST_ESP32_EXAMPLE_CONFIG_H
