<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Face;

class DashboardController extends Controller
{
    public function index()
    {
        $faces = Face::query()
            ->orderByDesc('registered_at')
            ->get(['id', 'name', 'registered_at'])
            ->map(fn (Face $face) => [
                'id' => $face->id,
                'name' => $face->name,
                'registeredAt' => optional($face->registered_at)->format('H:i'),
            ])
            ->values();

        $records = AttendanceRecord::query()
            ->orderByDesc('recorded_at')
            ->get(['id', 'person_name', 'action', 'recorded_at', 'status'])
            ->map(fn (AttendanceRecord $record) => [
                'id' => $record->id,
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
    }
}