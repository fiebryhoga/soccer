<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('composition_tests', function (Blueprint $table) {
            // Tambahan anatomi spesifik (KG)
            $table->decimal('essential_fat_mass', 5, 2)->nullable()->after('body_fat_percentage');
            $table->decimal('storage_fat_mass', 5, 2)->nullable()->after('essential_fat_mass');
            $table->decimal('other_mass', 5, 2)->nullable()->comment('Organ, cairan ekstra')->after('bone_mass');
        });
    }

    public function down(): void
    {
        Schema::table('composition_tests', function (Blueprint $table) {
            $table->dropColumn(['essential_fat_mass', 'storage_fat_mass', 'other_mass']);
        });
    }
};