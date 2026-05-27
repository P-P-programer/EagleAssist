# EagleAssist

EagleAssist is a lightweight, local-first attendance and recognition prototype that connects an ESP32-CAM camera to a Laravel backend and a Python facial-recognition microservice. The goal is a simple, testable flow for capturing images from ESP32 devices, sending them to the Laravel API, forwarding to the Python recognizer, and persisting attendance records.

**Architecture (high level)**
- **ESP32-CAM**: captures images and uploads them (multipart/form-data) to the Laravel API.
- **Laravel backend**: orchestrates the flow, persists attendance (`AttendanceRecord`), and forwards images to the Python recognition service.
- **Python recognition service**: FastAPI app that accepts images, returns recognition results, and can be used for enroll/list operations.
- **Frontend**: Vite + React UI for preview, manual capture, and viewing attendance history.

**Repository layout (important paths)**
- `app/Http/Controllers/Api/` : Laravel API controllers (attendance endpoints).
- `routes/api.php` : API route definitions (including `/api/v1/attendance/from-image`).
- `python-recognition-service/` : FastAPI recognizer service (see its own README).
- `esp32/esp32cam_multipart_example/` : ESP32 example sketch and config templates.
- `resources/js/components/App.jsx` : Frontend camera & workflow UI.

**Quick Start (development)**

1) Laravel backend

```bash
# from repo root
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve --host 0.0.0.0 --port=8001
```

2) Python recognition service

```bash
cd python-recognition-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# run on port 8000 (change port if busy)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3) Frontend (development)

```bash
pnpm install
pnpm dev
```

4) ESP32-CAM: configure and flash

- Copy `esp32/example_config.h` → `esp32/config.h` and set `WIFI_SSID`, `WIFI_PASS`, `LARAVEL_URL` (use your machine LAN IP, e.g. `http://192.168.1.10:8001`) and `RECOGNITION_TOKEN` to match Laravel `.env`.
- Open `esp32/esp32cam_multipart_example/esp32cam_multipart_example.ino` in Arduino IDE, select the correct board and upload.
- Open serial monitor at `115200` to follow connection and upload logs.

**Environment / Tokens**
- Set `RECOGNITION_TOKEN` in Laravel `.env` and use the same token in `esp32/config.h` and `python-recognition-service` environment (the FastAPI service enforces the shared token for important endpoints).

**Git / Cleanup (ignored files)**
- The repo now ignores common Python artifacts in `/.gitignore` and `python-recognition-service/.gitignore`.
- If Python caches or a virtualenv are already tracked, run one of the commands below from the repo root:

```bash
# Option A — remove tracked python service env/cache files only
git rm -r --cached python-recognition-service/.venv || true
git rm -r --cached python-recognition-service/venv || true
git rm -r --cached python-recognition-service/__pycache__ || true
git rm -r --cached python-recognition-service/.pytest_cache || true
git commit -m "chore: stop tracking python env/cache files"

# Option B — reapply .gitignore globally (safe when many ignored files are tracked)
git rm -r --cached .
git add .
git commit -m "chore: apply .gitignore and stop tracking ignored files"
```

**Troubleshooting**
- If `uvicorn` fails with "Address already in use" on port `8000`, find and stop the occupying process:

```bash
sudo lsof -i :8000
sudo kill <PID>
# or run the service on a different port
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

- If the ESP32 cannot reach the Laravel server, make sure `LARAVEL_URL` is the LAN IP (not `127.0.0.1`) and that the machine firewall allows incoming connections on the chosen port.

**Files to inspect / useful links**
- Laravel attendance entry point: [routes/api.php](routes/api.php)
- Attendance controller: [app/Http/Controllers/Api/AttendanceController.php](app/Http/Controllers/Api/AttendanceController.php)
- Python service README and code: [python-recognition-service/README.md](python-recognition-service/README.md)
- ESP32 sketch: [esp32/esp32cam_multipart_example/esp32cam_multipart_example.ino](esp32/esp32cam_multipart_example/esp32cam_multipart_example.ino)
- Root `.gitignore`: [.gitignore](.gitignore)

**Contributing / Next steps**
- Hardware testing: flash the ESP32 and run end-to-end tests (ESP32 → Laravel → Python). Open serial at `115200`.
- Optionally: add HTTPS, per-device tokens, and production hardening for the Python service.

**License**
This project reuses tooling around Laravel; the repo is MIT licensed unless otherwise noted in individual vendor packages.

**Python Setup & Cleanup**
- **Ignore files:** This repository now ignores common Python artifacts (virtualenvs, caches, compiled files, test/mypy caches) via the root `.gitignore` and the `python-recognition-service/.gitignore`.
- **If Python files are already tracked:** Run one of the following from the repo root to untrack virtualenvs/caches without deleting local files:

```bash
# Option A — untrack common python service env/cache paths
git rm -r --cached python-recognition-service/.venv || true
git rm -r --cached python-recognition-service/venv || true
git rm -r --cached python-recognition-service/__pycache__ || true
git rm -r --cached python-recognition-service/.pytest_cache || true
git commit -m "chore: stop tracking python env/cache files"

# Option B — reapply .gitignore globally (safe and comprehensive)
git rm -r --cached .
git add .
git commit -m "chore: apply .gitignore and stop tracking ignored files"
```

- **Create and use a venv for the recognizer service:**

```bash
cd python-recognition-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# run the service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Notes:**
	- Use the machine LAN IP (example `http://192.168.x.y:8001`) in `esp32/config.h` so ESP32 devices can reach the Laravel server.
	- If you prefer the agent to remove the tracked files for you, I can run the safe `git rm --cached` commands here — tell me to proceed and confirm you want me to create that commit.
