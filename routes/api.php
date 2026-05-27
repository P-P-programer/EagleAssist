<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/status', function () {
        return response()->json([
            'ok' => true,
            'service' => 'EagleAssist API',
        ]);
    });

    Route::post('/faces/enroll', function () {
        return response()->json([
            'ok' => true,
            'message' => 'Face enrollment endpoint ready.',
        ]);
    });

    Route::post('/attendance/validate', function () {
        return response()->json([
            'ok' => true,
            'message' => 'Attendance validation endpoint ready.',
        ]);
    });
});