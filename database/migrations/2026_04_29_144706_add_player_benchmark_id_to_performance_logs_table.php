<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('performance_logs', function (Blueprint $table) {
            // Tambahkan kolom untuk menyimpan ID Player Benchmark
            $table->foreignId('player_benchmark_id')->nullable()->after('benchmark_id')->constrained('benchmarks')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('performance_logs', function (Blueprint $table) {
            //
        });
    }
};
