<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\Face;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $faces = collect([
            ['name' => 'Test User', 'registered_at' => now()->setTime(8, 0)],
            ['name' => 'Maria Lopez', 'registered_at' => now()->setTime(8, 15)],
            ['name' => 'Carlos Perez', 'registered_at' => now()->setTime(8, 32)],
        ])->map(fn (array $face) => Face::create($face));

        AttendanceRecord::create([
            'face_id' => $faces[0]->id,
            'person_name' => 'Test User',
            'action' => 'Entrada',
            'status' => 'Entrada',
            'recorded_at' => now()->setTime(8, 5),
        ]);

        AttendanceRecord::create([
            'face_id' => $faces[0]->id,
            'person_name' => 'Test User',
            'action' => 'Salida',
            'status' => 'Salida',
            'recorded_at' => now()->setTime(12, 2),
        ]);

        AttendanceRecord::create([
            'face_id' => $faces[1]->id,
            'person_name' => 'Maria Lopez',
            'action' => 'Entrada',
            'status' => 'Entrada',
            'recorded_at' => now()->setTime(8, 11),
        ]);
    }
}
