<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Face;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AttendanceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'face_id' => ['required', 'integer', 'exists:faces,id'],
            'action' => ['required', 'in:Entrada,Salida'],
        ]);

        $face = Face::query()->find($validated['face_id']);

        if (! $face) {
            return response()->json([
                'ok' => false,
                'message' => 'Face must be enrolled before recording attendance.',
            ], 422);
        }

        if (! $face->is_active) {
            return response()->json([
                'ok' => false,
                'message' => 'Face is inactive. Reactivate it before recording attendance.',
            ], 422);
        }

        $record = AttendanceRecord::create([
            'face_id' => $face->id,
            'person_name' => $face->name,
            'action' => $validated['action'],
            'status' => $validated['action'],
            'recorded_at' => now(),
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'Attendance record saved.',
            'record' => [
                'id' => $record->id,
                'faceId' => $record->face_id,
                'person' => $record->person_name,
                'action' => $record->action,
                'time' => optional($record->recorded_at)->format('H:i'),
                'date' => optional($record->recorded_at)->toDateString(),
                'status' => $record->status,
            ],
        ]);
    }

    public function recognizeAndRecord(Request $request)
    {
        $validated = $request->validate([
            'action' => ['required', 'in:Entrada,Salida'],
            'device_id' => ['nullable', 'string'],
            'captured_at' => ['nullable', 'date'],
        ]);

        // multipart/form-data is the primary path for ESP32-CAM.
        // JSON base64 remains available for manual testing and fallback clients.
        $imageBase64 = null;
        if ($request->hasFile('image')) {
            $request->validate([
                'image' => ['file', 'image', 'max:5120'],
            ]);

            $file = $request->file('image');
            $imageBase64 = base64_encode(file_get_contents($file->getRealPath()));
        } else {
            $request->validate([
                'image_base64' => ['required', 'string'],
            ]);

            $imageBase64 = $validated['image_base64'];
        }

        if (empty($imageBase64)) {
            return response()->json([
                'ok' => false,
                'message' => 'No image provided. Send multipart `image` or `image_base64`.',
            ], 422);
        }

        $payload = [
            'image_base64' => $imageBase64,
            'device_id' => $validated['device_id'] ?? 'unknown-device',
            'captured_at' => $validated['captured_at'] ?? now()->toIso8601String(),
        ];

        $recognizerUrl = rtrim(config('services.recognition.url', 'http://127.0.0.1:8000'), '/') . '/recognize';

        try {
            $token = config('services.recognition.token');
            $client = Http::timeout(8);
            if (! empty($token)) {
                $client = $client->withToken($token);
            }
            $resp = $client->post($recognizerUrl, $payload);
        } catch (\Exception $e) {
            return response()->json([
                'ok' => false,
                'message' => 'Recognition service unreachable: ' . $e->getMessage(),
            ], 502);
        }

        if ($resp->failed()) {
            return response()->json([
                'ok' => false,
                'message' => 'Recognition service error.',
                'details' => $resp->body(),
            ], 502);
        }

        $data = $resp->json();

        // Default: unmatched
        if (empty($data) || ! array_key_exists('match', $data) || $data['match'] === false) {
            $record = AttendanceRecord::create([
                'face_id' => null,
                'person_name' => $data['name'] ?? 'Unknown',
                'action' => $validated['action'],
                'status' => 'unmatched',
                'recorded_at' => now(),
            ]);

            return response()->json([
                'ok' => true,
                'match' => false,
                'message' => 'No matching face found by recognition service.',
                'record' => [
                    'id' => $record->id,
                    'faceId' => $record->face_id,
                    'person' => $record->person_name,
                    'action' => $record->action,
                    'time' => optional($record->recorded_at)->format('H:i'),
                    'date' => optional($record->recorded_at)->toDateString(),
                    'status' => $record->status,
                ],
            ]);
        }

        // Match found
        $name = $data['name'] ?? null;

        if (empty($name)) {
            return response()->json([
                'ok' => false,
                'message' => 'Recognition service returned a match but no name.',
            ], 502);
        }

        // find or create a Face by name so we can reference face_id in attendance
        $face = Face::firstOrCreate(
            ['name' => $name],
            ['registered_at' => now(), 'is_active' => true]
        );

        if (! $face->is_active) {
            return response()->json([
                'ok' => false,
                'message' => 'Matched face is inactive. Reactivate before recording attendance.',
            ], 422);
        }

        $record = AttendanceRecord::create([
            'face_id' => $face->id,
            'person_name' => $face->name,
            'action' => $validated['action'],
            'status' => $validated['action'],
            'recorded_at' => now(),
        ]);

        return response()->json([
            'ok' => true,
            'match' => true,
            'confidence' => $data['confidence'] ?? null,
            'face' => [
                'id' => $face->id,
                'name' => $face->name,
            ],
            'record' => [
                'id' => $record->id,
                'faceId' => $record->face_id,
                'person' => $record->person_name,
                'action' => $record->action,
                'time' => optional($record->recorded_at)->format('H:i'),
                'date' => optional($record->recorded_at)->toDateString(),
                'status' => $record->status,
            ],
        ]);
    }
}