<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
        Schema::table('clubs', function (Blueprint $table) {
            $table->date('season_start_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('clubs', function (Blueprint $table) {
            // PERBAIKAN DI SINI: Hapus kolom saat di-rollback
            $table->dropColumn('season_start_date'); 
        });
    }
};