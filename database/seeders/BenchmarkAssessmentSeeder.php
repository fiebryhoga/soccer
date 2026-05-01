<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\AssessmentCategory;

class BenchmarkAssessmentSeeder extends Seeder
{
    public function run()
    {
        // 1. Bersihkan tabel agar tidak ada data ganda saat di-seed ulang
        Schema::disableForeignKeyConstraints();
        DB::table('assessment_test_items')->truncate();
        DB::table('assessment_categories')->truncate();
        Schema::enableForeignKeyConstraints();

        // 2. Data Kategori, Biomotorik, dan Item Tes
        $categoriesData = [
            [
                'name' => 'Flexibility',
                'biomotor_stages' => null,
                'items' => [
                    ['name' => 'Sit & Reach', 'parameter_type' => 'cm', 'target_benchmark' => 24.00, 'is_lower_better' => false],
                    ['name' => 'B-Scratch (L)', 'parameter_type' => 'cm', 'target_benchmark' => 5.00, 'is_lower_better' => false],
                    ['name' => 'B-Scratch (R)', 'parameter_type' => 'cm', 'target_benchmark' => 5.00, 'is_lower_better' => false],
                    ['name' => 'Knee to Wall (L)', 'parameter_type' => 'cm', 'target_benchmark' => 12.00, 'is_lower_better' => false],
                    ['name' => 'Knee to Wall (R)', 'parameter_type' => 'cm', 'target_benchmark' => 12.00, 'is_lower_better' => false],
                ]
            ],
            [
                'name' => 'Strength',
                'biomotor_stages' => [
                    ['min' => 0, 'max' => 60, 'label' => 'Adaptasi Anatomi'],
                    ['min' => 61, 'max' => 79, 'label' => 'Hypertrophy'],
                    ['min' => 80, 'max' => 89, 'label' => 'Max Strength'],
                    ['min' => 90, 'max' => 100, 'label' => 'Power Base'],
                ],
                'items' => [
                    ['name' => 'Half Squat (1RM)', 'parameter_type' => 'kg', 'target_benchmark' => 120.00, 'is_lower_better' => false],
                    ['name' => 'Bench Press (1RM)', 'parameter_type' => 'kg', 'target_benchmark' => 80.00, 'is_lower_better' => false],
                    ['name' => 'Deadlift (1RM)', 'parameter_type' => 'kg', 'target_benchmark' => 130.00, 'is_lower_better' => false],
                    ['name' => 'Pull Up Max', 'parameter_type' => 'reps', 'target_benchmark' => 15.00, 'is_lower_better' => false],
                ]
            ],
            [
                'name' => 'Speed',
                'biomotor_stages' => [
                    ['min' => 0, 'max' => 60, 'label' => 'Speed Development'],
                    ['min' => 61, 'max' => 79, 'label' => 'Anaerobic Speed'],
                    ['min' => 80, 'max' => 89, 'label' => 'Anaerobic Endurance'],
                    ['min' => 90, 'max' => 100, 'label' => 'Specific Speed'],
                ],
                'items' => [
                    ['name' => '10 m Sprint', 'parameter_type' => 's', 'target_benchmark' => 1.70, 'is_lower_better' => true],
                    ['name' => '20 m Sprint', 'parameter_type' => 's', 'target_benchmark' => 3.10, 'is_lower_better' => true],
                    ['name' => '30 m Sprint', 'parameter_type' => 's', 'target_benchmark' => 4.30, 'is_lower_better' => true],
                    ['name' => '300 m Sprint', 'parameter_type' => 's', 'target_benchmark' => 43.00, 'is_lower_better' => true],
                ]
            ],
            [
                'name' => 'Endurance',
                'biomotor_stages' => [
                    ['min' => 0, 'max' => 60, 'label' => 'Aerobic Development'],
                    ['min' => 61, 'max' => 85, 'label' => 'Aerobic Endurance'],
                    ['min' => 86, 'max' => 100, 'label' => 'Specific Endurance'],
                ],
                'items' => [
                    ['name' => 'BEEP Test (VO2Max)', 'parameter_type' => 'vo2max', 'target_benchmark' => 55.00, 'is_lower_better' => false],
                    ['name' => 'BEEP Test (Level)', 'parameter_type' => 'points', 'target_benchmark' => 13.00, 'is_lower_better' => false],
                    ['name' => 'Cooper Test (12 Min)', 'parameter_type' => 'm', 'target_benchmark' => 3200.00, 'is_lower_better' => false],
                    ['name' => 'Balke Test (15 Min)', 'parameter_type' => 'm', 'target_benchmark' => 3500.00, 'is_lower_better' => false],
                ]
            ],
            [
                'name' => 'Strength Endurance',
                'biomotor_stages' => [
                    ['min' => 0, 'max' => 60, 'label' => 'Core Stability'],
                    ['min' => 61, 'max' => 85, 'label' => 'Muscular Endurance'],
                    ['min' => 86, 'max' => 100, 'label' => 'Specific Strength End'],
                ],
                'items' => [
                    ['name' => '2 Min Sit Up', 'parameter_type' => 'reps', 'target_benchmark' => 60.00, 'is_lower_better' => false],
                    ['name' => '1 Min Half Squat', 'parameter_type' => 'reps', 'target_benchmark' => 45.00, 'is_lower_better' => false],
                    ['name' => '1 Min Push Up', 'parameter_type' => 'reps', 'target_benchmark' => 50.00, 'is_lower_better' => false],
                    ['name' => 'Plank Test', 'parameter_type' => 's', 'target_benchmark' => 180.00, 'is_lower_better' => false], // Pengecualian: detik tapi makin lama makin bagus
                ]
            ],
            [
                'name' => 'Agility',
                'biomotor_stages' => [
                    ['min' => 0, 'max' => 60, 'label' => 'Change of Direction Base'],
                    ['min' => 61, 'max' => 85, 'label' => 'Reactive Agility'],
                    ['min' => 86, 'max' => 100, 'label' => 'Specific Agility'],
                ],
                'items' => [
                    ['name' => 'Illinois Agility', 'parameter_type' => 's', 'target_benchmark' => 15.00, 'is_lower_better' => true],
                    ['name' => 'Arrowhead Agility (L)', 'parameter_type' => 's', 'target_benchmark' => 8.00, 'is_lower_better' => true],
                    ['name' => 'Arrowhead Agility (R)', 'parameter_type' => 's', 'target_benchmark' => 8.00, 'is_lower_better' => true],
                    ['name' => '5-10-5 Shuttle', 'parameter_type' => 's', 'target_benchmark' => 4.50, 'is_lower_better' => true],
                ]
            ],
            [
                'name' => 'Power',
                'biomotor_stages' => [
                    ['min' => 0, 'max' => 60, 'label' => 'Basic Strength-Power'],
                    ['min' => 61, 'max' => 85, 'label' => 'Maximum Power'],
                    ['min' => 86, 'max' => 100, 'label' => 'Explosive Power (Specific)'],
                ],
                'items' => [
                    ['name' => 'Vertical Jump (CMJ)', 'parameter_type' => 'cm', 'target_benchmark' => 60.00, 'is_lower_better' => false],
                    ['name' => 'Broad Jump', 'parameter_type' => 'cm', 'target_benchmark' => 250.00, 'is_lower_better' => false],
                    ['name' => 'Medicine Ball Throw', 'parameter_type' => 'm', 'target_benchmark' => 8.00, 'is_lower_better' => false],
                    ['name' => 'Triple Hop (L)', 'parameter_type' => 'cm', 'target_benchmark' => 650.00, 'is_lower_better' => false],
                    ['name' => 'Triple Hop (R)', 'parameter_type' => 'cm', 'target_benchmark' => 650.00, 'is_lower_better' => false],
                ]
            ]
        ];

        // 3. Eksekusi Insert ke Database
        foreach ($categoriesData as $catData) {
            $category = AssessmentCategory::create([
                'name' => $catData['name'],
                'biomotor_stages' => $catData['biomotor_stages'],
            ]);

            foreach ($catData['items'] as $itemData) {
                $category->testItems()->create($itemData);
            }
        }
    }
}