<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('face_id')->nullable()->constrained('faces')->nullOnDelete();
            $table->string('person_name');
            $table->enum('action', ['Entrada', 'Salida']);
            $table->string('status');
            $table->timestamp('recorded_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};