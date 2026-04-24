<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_metrics', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke Buku Log Sesi hari itu
            $table->foreignId('performance_log_id')->constrained()->cascadeOnDelete();
            
            // Relasi ke Pemain
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            
            // JSON Array: Tempat metrik hasil paste Excel disimpan
            $table->json('metrics'); 
            
            $table->timestamps();

            // Mencegah 1 pemain direkam 2 kali di sesi latihan yang persis sama
            $table->unique(['performance_log_id', 'player_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_metrics');
    }
};