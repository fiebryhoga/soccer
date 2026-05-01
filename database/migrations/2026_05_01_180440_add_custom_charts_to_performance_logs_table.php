<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('performance_logs', function (Blueprint $table) {
            // Kita gunakan JSON karena struktur grafik bisa dinamis dan lebih dari satu
            $table->json('custom_charts')->nullable()->after('player_benchmark_id'); 
        });
    }

    public function down(): void
    {
        Schema::table('performance_logs', function (Blueprint $table) {
            $table->dropColumn('custom_charts');
        });
    }
};
