<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('profile_photo')->nullable();
            
            // UBAH DI SINI
            $table->integer('position_number'); 
            
            $table->enum('position', ['CB', 'FB', 'MF', 'WF', 'FW']);
            $table->timestamps();
            
            // UBAH DI SINI: Memastikan nomor posisi unik di dalam 1 klub
            $table->unique(['club_id', 'position_number']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('players');
    }
};