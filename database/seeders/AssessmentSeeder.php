<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AssessmentCategory;

class AssessmentSeeder extends Seeder
{
    public function run()
    {
        // 1. FLEXIBILITY
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
            ['name' => 'Sit and Reach', 'unit' => 'cm', 'target_value' => 24.00, 'is_lower_better' => false],
        ]);

        // 2. SAQ
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
        ]);

        // 3. POWER
        $power = AssessmentCategory::create([
            'name' => 'Power', 'body_part' => 'legs', // Bisa disesuaikan
            'periodization_rules' => [
                ['min' => 90, 'max' => 100, 'label' => 'Explosive Power (Specific Transfer)'],
                ['min' => 80, 'max' => 89, 'label' => 'Maximum Power Development'],
                ['min' => 61, 'max' => 79, 'label' => 'Basic Strength-Power'],
                ['min' => 0, 'max' => 60, 'label' => 'Foundational Strength'],
            ]
        ]);
        $power->metrics()->createMany([
            ['name' => 'Standing BJ', 'unit' => 'cm', 'target_value' => 272.00, 'is_lower_better' => false],
            ['name' => 'Vertical Jump', 'unit' => 'cm', 'target_value' => 40.00, 'is_lower_better' => false],
        ]);

        // 4. MAX STRENGTH
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
            ['name' => 'Bench Press', 'unit' => 'kg', 'target_value' => 100.00, 'is_lower_better' => false],
            ['name' => 'Half Squat', 'unit' => 'kg', 'target_value' => 100.00, 'is_lower_better' => false],
        ]);

        // 5. STRENGTH ENDURANCE
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
            ['name' => '1 Min Pull Up', 'unit' => 'reps', 'target_value' => 15.00, 'is_lower_better' => false],
        ]);

        // 6. POWER ENDURANCE
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
            ['name' => '1 Min Hurdle Jump', 'unit' => 'reps', 'target_value' => 40.00, 'is_lower_better' => false],
        ]);

        // 7. SAQ END
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
            ['name' => '300 m Sprint', 'unit' => 'sec', 'target_value' => 43.00, 'is_lower_better' => true],
        ]);

        // 8. RAST
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
            ['name' => 'Fatigue Index', 'unit' => 'watt/sec', 'target_value' => 5.00, 'is_lower_better' => true],
        ]);

        // 9. ENDURANCE
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
            ['name' => 'Cooper Test', 'unit' => 'm', 'target_value' => 3800.00, 'is_lower_better' => false],
            ['name' => 'Beep Test (Level)', 'unit' => 'lvl', 'target_value' => 12.00, 'is_lower_better' => false],
        ]);
    }
}