<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('assessment_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Flexibility, Strength, dll
            // Kolom JSON untuk menyimpan array tahapan biomotorik (opsional/bisa kosong)
            $table->json('biomotor_stages')->nullable(); 
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('assessment_categories');
    }
};