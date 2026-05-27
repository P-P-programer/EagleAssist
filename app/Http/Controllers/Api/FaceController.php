<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Face;
use Illuminate\Http\Request;

class FaceController extends Controller
{
    public function store(Request $request)
    {
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
    }

    public function deactivate(Face $face)
    {
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
    }

    public function reactivate(Face $face)
    {
        $face->update([
            'is_active' => true,
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'Face reactivated without creating a new record.',
            'face' => [
                'id' => $face->id,
                'name' => $face->name,
                'registeredAt' => optional($face->registered_at)->format('H:i'),
                'isActive' => $face->is_active,
            ],
        ]);
    }
}