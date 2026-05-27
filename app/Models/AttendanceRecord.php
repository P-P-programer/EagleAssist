<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceRecordFactory> */
    use HasFactory;

    protected $fillable = [
        'face_id',
        'person_name',
        'action',
        'recorded_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
        ];
    }

    public function face()
    {
        return $this->belongsTo(Face::class);
    }
}