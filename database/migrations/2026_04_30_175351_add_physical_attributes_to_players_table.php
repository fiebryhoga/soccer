<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('players', function (Blueprint $table) {
            $table->integer('age')->nullable()->after('position_number');
            $table->enum('gender', ['male', 'female'])->default('male')->after('age');
            $table->decimal('height', 5, 2)->nullable()->comment('Satuan cm')->after('gender');
            $table->decimal('weight', 5, 2)->nullable()->comment('Satuan kg')->after('height');
            $table->enum('dominant_limb', ['left', 'right', 'both'])->nullable()->after('weight');
        });
    }

    public function down()
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn(['age', 'gender', 'height', 'weight', 'dominant_limb']);
        });
    }
};