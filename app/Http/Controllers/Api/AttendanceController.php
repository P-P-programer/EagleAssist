<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Face;
use Illuminate\Http\Request;

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
}