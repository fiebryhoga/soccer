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
        Schema::table('assessment_categories', function (Blueprint $table) {
            // Kolom JSON ini akan menyimpan array rentang min, max, dan label periodisasinya
            $table->json('periodization_rules')->nullable()->after('body_part');
        });
    }

    public function down()
    {
        Schema::table('assessment_categories', function (Blueprint $table) {
            $table->dropColumn('periodization_rules');
        });
    }
};
