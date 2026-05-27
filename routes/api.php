<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FaceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/status', function () {
        return response()->json([
            'ok' => true,
            'service' => 'EagleAssist API',
        ]);
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::post('/faces/enroll', [FaceController::class, 'store']);
    Route::patch('/faces/{face}/deactivate', [FaceController::class, 'deactivate']);
    Route::patch('/faces/{face}/reactivate', [FaceController::class, 'reactivate']);

    Route::post('/attendance/validate', [AttendanceController::class, 'store']);
});