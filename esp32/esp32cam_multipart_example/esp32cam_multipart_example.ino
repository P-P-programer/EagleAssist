#include <WiFi.h>
#include <esp_camera.h>

#include "config.h"

// AI Thinker ESP32-CAM pin map
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

static bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = JPEG_QUALITY;
  config.fb_count = 1;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;

  esp_err_t err = esp_camera_init(&config);
  return err == ESP_OK;
}

static String buildIsoTimestamp() {
  return "2026-05-27T12:00:00Z";
}

static bool postMultipartImage(const uint8_t *image, size_t imageSize) {
  WiFiClient client;

  String url = String(LARAVEL_URL);
  String host = url;
  String path = ATTENDANCE_ENDPOINT;
  uint16_t port = 80;

  int schemeSeparator = url.indexOf("://");
  if (schemeSeparator >= 0) {
    String remainder = url.substring(schemeSeparator + 3);
    int pathStart = remainder.indexOf('/');
    if (pathStart >= 0) {
      host = remainder.substring(0, pathStart);
    } else {
      host = remainder;
    }
  }

  int portSeparator = host.indexOf(':');
  if (portSeparator >= 0) {
    port = host.substring(portSeparator + 1).toInt();
    host = host.substring(0, portSeparator);
  }

  if (!client.connect(host.c_str(), port)) {
    Serial.println("[HTTP] connect failed");
    return false;
  }

  String boundary = "----EagleAssistBoundary7MA4YWxkTrZu0gW";
  String prefix =
    String("--") + boundary + "\r\n" +
    "Content-Disposition: form-data; name=\"action\"\r\n\r\n" +
    "Entrada\r\n" +
    String("--") + boundary + "\r\n" +
    "Content-Disposition: form-data; name=\"device_id\"\r\n\r\n" +
    String(DEVICE_ID) + "\r\n" +
    String("--") + boundary + "\r\n" +
    "Content-Disposition: form-data; name=\"captured_at\"\r\n\r\n" +
    buildIsoTimestamp() + "\r\n" +
    String("--") + boundary + "\r\n" +
    "Content-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\n" +
    "Content-Type: image/jpeg\r\n\r\n";

  String suffix = String("\r\n--") + boundary + "--\r\n";

  size_t totalLength = prefix.length() + imageSize + suffix.length();
  if (totalLength > IMAGE_MAX_SIZE) {
    Serial.println("[HTTP] payload too large");
    return false;
  }

  client.print(String("POST ") + path + " HTTP/1.1\r\n");
  client.print(String("Host: ") + host + "\r\n");
  client.print("Connection: close\r\n");
  if (strlen(RECOGNITION_TOKEN) > 0) {
    client.print(String("Authorization: Bearer ") + RECOGNITION_TOKEN + "\r\n");
  }
  client.print(String("Content-Type: multipart/form-data; boundary=") + boundary + "\r\n");
  client.print(String("Content-Length: ") + String(totalLength) + "\r\n\r\n");
  client.print(prefix);
  client.write(image, imageSize);
  client.print(suffix);

  int statusCode = -1;
  if (client.find("HTTP/1.1 ")) {
    statusCode = client.parseInt();
  }

  unsigned long deadline = millis() + 15000;
  while (client.connected() && millis() < deadline) {
    while (client.available()) {
      String line = client.readStringUntil('\n');
      Serial.println(line);
    }
    delay(10);
  }

  client.stop();
  return statusCode >= 200 && statusCode < 300;
}

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("EagleAssist ESP32-CAM multipart demo");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("Connecting to WiFi '%s'...\n", WIFI_SSID);

  const int maxAttempts = 40; // ~20 seconds (40 * 500ms)
  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    attempts++;
    Serial.print('.');
    if (attempts % 10 == 0) {
      Serial.printf(" still trying (%d/%d)\n", attempts, maxAttempts);
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected successfully.");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi connection FAILED (timeout).");
    Serial.println("Starting fallback Access Point 'EagleAssist-Setup' for provisioning.");
    WiFi.softAP("EagleAssist-Setup", "setup1234");
    Serial.print("Fallback AP IP: ");
    Serial.println(WiFi.softAPIP());
  }

  if (!initCamera()) {
    Serial.println("Camera init failed");
    while (true) {
      delay(1000);
    }
  }
  Serial.println("Camera ready");
}

void loop() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Failed to capture image");
    delay(3000);
    return;
  }

  Serial.printf("Captured frame %u bytes\n", (unsigned)fb->len);
  bool ok = postMultipartImage(fb->buf, fb->len);
  Serial.println(ok ? "Upload OK" : "Upload failed");

  esp_camera_fb_return(fb);
  delay(5000);
}
