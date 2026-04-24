<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('player_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->date('date'); // Tanggal latihan / match
            
            // Saat data ini diupload, mereka pakai benchmark/target yang mana?
            $table->foreignId('benchmark_id')->nullable()->constrained()->nullOnDelete();
            
            // Data asli dari Excel masuk ke sini tanpa diubah
            $table->json('metrics'); 
            
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('player_metrics');
    }
};