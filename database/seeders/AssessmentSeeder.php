<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\AssessmentCategory;

class AssessmentSeeder extends Seeder
{
    public function run()
    {
        // 1. BERSIHKAN DATA LAMA AGAR TIDAK DUPLIKAT SAAT DI-SEED ULANG
        Schema::disableForeignKeyConstraints();
        DB::table('assessment_metrics')->truncate();
        DB::table('assessment_categories')->truncate();
        Schema::enableForeignKeyConstraints();

        // 2. KATEGORI 1: FLEXIBILITY
        $flexibility = AssessmentCategory::create([
            'name' => 'Flexibility', 'body_part' => 'legs',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Maintenance & Dynamic Mobility'],
                ['min' => 80, 'max' => 89, 'label' => 'Specific Flexibility Development'],
                ['min' => 61, 'max' => 79, 'label' => 'General Flexibility'],
                ['min' => 0, 'max' => 60, 'label' => 'Mobility & Correction'],
            ]
        ]);
        $flexibility->metrics()->createMany([
            ['name' => 'Sit & Reach', 'unit' => 'cm', 'target_value' => 24.00, 'is_lower_better' => false],
            ['name' => 'B-Scratch (L)', 'unit' => 'cm', 'target_value' => 5.00, 'is_lower_better' => false],
            ['name' => 'B-Scratch (R)', 'unit' => 'cm', 'target_value' => 5.00, 'is_lower_better' => false],
            ['name' => 'KTW (L)', 'unit' => 'cm', 'target_value' => 12.00, 'is_lower_better' => false],
            ['name' => 'KTW (R)', 'unit' => 'cm', 'target_value' => 12.00, 'is_lower_better' => false],
        ]);

        // 3. KATEGORI 2: SAQ
        $saq = AssessmentCategory::create([
            'name' => 'SAQ', 'body_part' => 'legs',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Speed Endurance & Agility'],
                ['min' => 80, 'max' => 89, 'label' => 'Specific Speed & Reaction'],
                ['min' => 61, 'max' => 79, 'label' => 'Basic Speed & Coordination'],
                ['min' => 0, 'max' => 60, 'label' => 'Aerobic & Anaerobic Base'],
            ]
        ]);
        $saq->metrics()->createMany([
            ['name' => '20 m Sprint', 'unit' => 'sec', 'target_value' => 3.20, 'is_lower_better' => true],
            ['name' => '4m x 5', 'unit' => 'sec', 'target_value' => 5.30, 'is_lower_better' => true],
            ['name' => 'Arrow head R', 'unit' => 'sec', 'target_value' => 8.00, 'is_lower_better' => true],
            ['name' => 'Arrow head L', 'unit' => 'sec', 'target_value' => 8.00, 'is_lower_better' => true],
            ['name' => 'Hand Reac', 'unit' => 'sec', 'target_value' => 0.25, 'is_lower_better' => true],
            ['name' => 'Foot Reac', 'unit' => 'sec', 'target_value' => 0.35, 'is_lower_better' => true],
        ]);

        // 4. KATEGORI 3: POWER
        $power = AssessmentCategory::create([
            'name' => 'Power', 'body_part' => 'legs',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Explosive Power (Specific Transfer)'],
                ['min' => 80, 'max' => 89, 'label' => 'Maximum Power Development'],
                ['min' => 61, 'max' => 79, 'label' => 'Basic Strength-Power'],
                ['min' => 0, 'max' => 60, 'label' => 'Foundational Strength'],
            ]
        ]);
        $power->metrics()->createMany([
            ['name' => 'VJ/CMJ', 'unit' => 'cm', 'target_value' => 50.00, 'is_lower_better' => false],
            ['name' => 'SB Jump', 'unit' => 'cm', 'target_value' => 250.00, 'is_lower_better' => false],
            ['name' => '3 HOP R', 'unit' => 'cm', 'target_value' => 600.00, 'is_lower_better' => false],
            ['name' => '3 HOP L', 'unit' => 'cm', 'target_value' => 600.00, 'is_lower_better' => false],
            ['name' => 'MB Throw', 'unit' => 'm', 'target_value' => 8.00, 'is_lower_better' => false],
        ]);

        // 5. KATEGORI 4: MAX STRENGTH
        $maxStrength = AssessmentCategory::create([
            'name' => 'Max Strength', 'body_part' => 'arms',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Conversion to Power'],
                ['min' => 80, 'max' => 89, 'label' => 'Max Strength'],
                ['min' => 61, 'max' => 79, 'label' => 'Hypertrophy'],
                ['min' => 0, 'max' => 60, 'label' => 'Adaptasi Anatomi'],
            ]
        ]);
        $maxStrength->metrics()->createMany([
            ['name' => 'Half Squat', 'unit' => 'kg', 'target_value' => 120.00, 'is_lower_better' => false],
            ['name' => 'Bench Press', 'unit' => 'kg', 'target_value' => 80.00, 'is_lower_better' => false],
            ['name' => 'Deadlift', 'unit' => 'kg', 'target_value' => 130.00, 'is_lower_better' => false],
            ['name' => 'Bench Pull', 'unit' => 'kg', 'target_value' => 70.00, 'is_lower_better' => false],
            ['name' => 'Pull Up Max', 'unit' => 'reps', 'target_value' => 15.00, 'is_lower_better' => false],
        ]);

        // 6. KATEGORI 5: STRENGTH ENDURANCE
        $strengthEndurance = AssessmentCategory::create([
            'name' => 'Strength Endurance', 'body_part' => 'core',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Specific Strength Endurance'],
                ['min' => 80, 'max' => 89, 'label' => 'Intensive Strength Endurance'],
                ['min' => 61, 'max' => 79, 'label' => 'Extensive Strength Endurance'],
                ['min' => 0, 'max' => 60, 'label' => 'Core & Basic Muscular Endurance'],
            ]
        ]);
        $strengthEndurance->metrics()->createMany([
            ['name' => '2 Min Sit Up', 'unit' => 'reps', 'target_value' => 60.00, 'is_lower_better' => false],
            ['name' => '1 Min Half Squat', 'unit' => 'reps', 'target_value' => 45.00, 'is_lower_better' => false],
            ['name' => 'Plank Test', 'unit' => 'sec', 'target_value' => 180.00, 'is_lower_better' => false],
            ['name' => '1 Min Pull Up', 'unit' => 'reps', 'target_value' => 20.00, 'is_lower_better' => false],
        ]);

        // 7. KATEGORI 6: POWER END
        $powerEnd = AssessmentCategory::create([
            'name' => 'Power End', 'body_part' => 'legs',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Specific Power Endurance (Match Intensity)'],
                ['min' => 80, 'max' => 89, 'label' => 'Lactic Power Endurance'],
                ['min' => 61, 'max' => 79, 'label' => 'Alactic Power Endurance'],
                ['min' => 0, 'max' => 60, 'label' => 'General Strength Endurance'],
            ]
        ]);
        $powerEnd->metrics()->createMany([
            ['name' => '1 Min Hurdle Jump', 'unit' => 'reps', 'target_value' => 50.00, 'is_lower_better' => false],
            ['name' => '30 det MB Throw', 'unit' => 'reps', 'target_value' => 25.00, 'is_lower_better' => false],
            ['name' => '1 Min Lunges', 'unit' => 'reps', 'target_value' => 40.00, 'is_lower_better' => false],
        ]);

        // 8. KATEGORI 7: SAQ END
        $saqEnd = AssessmentCategory::create([
            'name' => 'SAQ End', 'body_part' => 'legs',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Repeated Sprint Ability (RSA) Specific'],
                ['min' => 80, 'max' => 89, 'label' => 'Agility & Quickness Endurance'],
                ['min' => 61, 'max' => 79, 'label' => 'Basic Speed Endurance'],
                ['min' => 0, 'max' => 60, 'label' => 'General Anaerobic Capacity'],
            ]
        ]);
        $saqEnd->metrics()->createMany([
            ['name' => '300 m Sprint', 'unit' => 'sec', 'target_value' => 43.00, 'is_lower_better' => true], // Lari makin cepat = bagus
            ['name' => '10 X 10 m', 'unit' => 'sec', 'target_value' => 25.00, 'is_lower_better' => true],
        ]);

        // 9. KATEGORI 8: RAST
        $rast = AssessmentCategory::create([
            'name' => 'RAST', 'body_part' => 'heart',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Peak Anaerobic Lactic Maintenance'],
                ['min' => 80, 'max' => 89, 'label' => 'Anaerobic Lactic Capacity Development'],
                ['min' => 61, 'max' => 79, 'label' => 'Anaerobic Alactic Power'],
                ['min' => 0, 'max' => 60, 'label' => 'Aerobic Base & Speed Reserve'],
            ]
        ]);
        $rast->metrics()->createMany([
            ['name' => 'Avg Anaerob Power', 'unit' => 'watt', 'target_value' => 600.00, 'is_lower_better' => false], // Power = makin besar makin bagus
            ['name' => 'Fatique Index', 'unit' => 'watt/sec', 'target_value' => 5.00, 'is_lower_better' => true], // Kelelahan = makin kecil makin bagus
        ]);

        // 10. KATEGORI 9: ENDURANCE
        $endurance = AssessmentCategory::create([
            'name' => 'Endurance', 'body_part' => 'heart',
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Specific Endurance (Anaerobic Threshold)'],
                ['min' => 80, 'max' => 89, 'label' => 'Mix Aerobic & Specific'],
                ['min' => 61, 'max' => 79, 'label' => 'Extensive Aerobic Base'],
                ['min' => 0, 'max' => 60, 'label' => 'General Aerobic Endurance'],
            ]
        ]);
        $endurance->metrics()->createMany([
            ['name' => 'BEEP Test', 'unit' => 'lvl', 'target_value' => 13.00, 'is_lower_better' => false],
            ['name' => 'BALKE Test', 'unit' => 'm', 'target_value' => 2800.00, 'is_lower_better' => false],
            ['name' => 'COOPER Test', 'unit' => 'm', 'target_value' => 3200.00, 'is_lower_better' => false],
            ['name' => 'LYON Test', 'unit' => 'lvl', 'target_value' => 15.00, 'is_lower_better' => false],
            ['name' => 'MADER Test', 'unit' => 'lvl', 'target_value' => 15.00, 'is_lower_better' => false],
            ['name' => 'PB 100 M FREE', 'unit' => 'sec', 'target_value' => 13.00, 'is_lower_better' => true], // Lari renang/bebas sprint = makin kecil makin bagus
        ]);
    }
}