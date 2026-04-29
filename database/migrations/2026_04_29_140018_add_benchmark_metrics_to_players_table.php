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
        Schema::table('players', function (Blueprint $table) {
            $table->json('benchmark_metrics')->nullable()->after('highest_metrics');
        });
    }

    public function down()
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn('benchmark_metrics');
        });
    }
};
