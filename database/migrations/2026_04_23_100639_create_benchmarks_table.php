<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('benchmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained()->cascadeOnDelete();
            
            $table->string('name'); // Contoh: "Match Day (MD)", "MD-1", "Recovery"
            
            // Apakah ini target untuk seluruh tim, atau khusus 1 pemain?
            $table->enum('target_type', ['team', 'player'])->default('team');
            $table->foreignId('player_id')->nullable()->constrained()->cascadeOnDelete();
            
            // KUNCI UTAMA: Semua angka target metrik (Distance, Sprint, dll) masuk ke sini
            $table->json('metrics'); 
            
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('benchmarks');
    }
};