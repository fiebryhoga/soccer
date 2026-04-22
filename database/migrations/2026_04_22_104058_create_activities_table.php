<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            // Siapa yang melakukan (Cascade: jika user dihapus, lognya juga terhapus/opsional)
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); 
            $table->string('action'); // Contoh: "created a new admin"
            $table->string('target'); // Contoh: "Coach Shin"
            $table->string('type')->default('system'); // system, video, comment
            $table->boolean('is_read')->default(false);
            $table->string('href')->nullable(); // Link ke detail
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};