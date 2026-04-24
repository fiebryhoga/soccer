<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('performance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained()->cascadeOnDelete();
            
            // Tanggal Log
            $table->date('date');
            
            // Tipe Agenda
            $table->enum('type', ['off', 'training', 'match'])->default('off');
            $table->string('title')->nullable(); // Misal: "Latihan Taktikal"
            $table->text('description')->nullable();
            
            // JSON Array berisi ID metrik yang dipilih (misal: ["total_distance", "sprint_distance"])
            $table->json('selected_metrics')->nullable(); 
            
            // Mengambil target dari benchmark mana?
            $table->foreignId('benchmark_id')->nullable()->constrained()->nullOnDelete();
            
            $table->timestamps();

            // Mencegah ada 2 log ganda di tanggal yang sama untuk 1 klub
            $table->unique(['club_id', 'date']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('performance_logs');
    }
};