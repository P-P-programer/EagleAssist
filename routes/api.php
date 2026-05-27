<?php

use Illuminate\Http\Request;
use App\Models\AttendanceRecord;
use App\Models\Face;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/status', function () {
        return response()->json([
            'ok' => true,
            'service' => 'EagleAssist API',
        ]);
    });

    Route::get('/dashboard', function () {
        $faces = Face::query()
            ->orderByDesc('registered_at')
            ->get(['id', 'name', 'registered_at', 'is_active'])
            ->map(fn (Face $face) => [
                'id' => $face->id,
                'name' => $face->name,
                'registeredAt' => optional($face->registered_at)->format('H:i'),
                'isActive' => $face->is_active,
            ])
            ->values();

        $records = AttendanceRecord::query()
            ->orderByDesc('recorded_at')
            ->get(['id', 'face_id', 'person_name', 'action', 'recorded_at', 'status'])
            ->map(fn (AttendanceRecord $record) => [
                'id' => $record->id,
                'faceId' => $record->face_id,
                'person' => $record->person_name,
                'action' => $record->action,
                'time' => optional($record->recorded_at)->format('H:i'),
                'date' => optional($record->recorded_at)->toDateString(),
                'status' => $record->status,
            ])
            ->values();

        return response()->json([
            'ok' => true,
            'faces' => $faces,
            'attendanceRecords' => $records,
            'summary' => [
                'faces' => $faces->count(),
                'attendanceRecords' => $records->count(),
            ],
        ]);
    });

    Route::post('/faces/enroll', function (Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
        ]);

        $face = Face::query()->updateOrCreate(
            ['name' => $validated['name']],
            ['registered_at' => now(), 'is_active' => true]
        );

        return response()->json([
            'ok' => true,
            'message' => 'Face enrollment saved.',
            'face' => [
                'id' => $face->id,
                'name' => $face->name,
                'registeredAt' => optional($face->registered_at)->format('H:i'),
                'isActive' => $face->is_active,
            ],
        ]);
    });

    Route::post('/attendance/validate', function (Request $request) {
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
    });

    Route::patch('/faces/{face}/deactivate', function (Face $face) {
        $face->update([
            'is_active' => false,
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'Face deactivated without deleting history.',
            'face' => [
                'id' => $face->id,
                'name' => $face->name,
                'registeredAt' => optional($face->registered_at)->format('H:i'),
                'isActive' => $face->is_active,
            ],
        ]);
    });
});