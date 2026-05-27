<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Face extends Model
{
    /** @use HasFactory<\Database\Factories\FaceFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'registered_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}