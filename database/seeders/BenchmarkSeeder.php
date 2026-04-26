<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Benchmark;
use App\Models\Club;

class BenchmarkSeeder extends Seeder
{
    public function run(): void
    {
        $club = Club::where('name', 'Persebaya')->first();
        if (!$club) {
            $this->command->error('Klub tidak ditemukan!');
            return;
        }

        $benchmarks = [
            [
                'name' => 'MD',
                'metrics' => [
                    'total_distance' => 10500,
                    'dist_per_min' => 115,
                    'hir_18_24_kmh' => 850,
                    'sprint_distance' => 250,
                    'total_18kmh' => 1100,
                    'accels' => 40,
                    'decels' => 40,
                    'hr_band_4_dist' => 8000,
                    'hr_band_4_dur' => '01.15.00',
                    'hr_band_5_dist' => 6000,
                    'hr_band_5_dur' => '00.50.00',
                    'player_load' => 1000,
                    'max_velocity' => 32.5,
                ]
            ],
            [
                'name' => 'MD - 1',
                'metrics' => [
                    'total_distance' => 7000,
                    'dist_per_min' => 90,
                    'hir_18_24_kmh' => 400,
                    'sprint_distance' => 90,
                    'total_18kmh' => 490,
                    'accels' => 7,
                    'decels' => 19,
                    'hr_band_4_dist' => 5409,
                    'hr_band_4_dur' => '00.53.00',
                    'hr_band_5_dist' => 7063,
                    'hr_band_5_dur' => '01.10.00',
                    'player_load' => 650,
                    'max_velocity' => 28.5,
                ]
            ],
            [
                'name' => 'MD - 2',
                'metrics' => [
                    'total_distance' => 5500,
                    'dist_per_min' => 105,
                    'hir_18_24_kmh' => 500,
                    'sprint_distance' => 150,
                    'total_18kmh' => 650,
                    'accels' => 25,
                    'decels' => 25,
                    'hr_band_4_dist' => 3000,
                    'hr_band_4_dur' => '00.30.00',
                    'hr_band_5_dist' => 2000,
                    'hr_band_5_dur' => '00.20.00',
                    'player_load' => 500,
                    'max_velocity' => 31.0,
                ]
            ],
            [
                'name' => 'MD - 3',
                'metrics' => [
                    'total_distance' => 8500,
                    'dist_per_min' => 110,
                    'hir_18_24_kmh' => 700,
                    'sprint_distance' => 180,
                    'total_18kmh' => 880,
                    'accels' => 35,
                    'decels' => 35,
                    'hr_band_4_dist' => 6000,
                    'hr_band_4_dur' => '00.55.00',
                    'hr_band_5_dist' => 4500,
                    'hr_band_5_dur' => '00.40.00',
                    'player_load' => 800,
                    'max_velocity' => 30.0,
                ]
            ],
            [
                'name' => 'MD - 4',
                'metrics' => [
                    'total_distance' => 9500,
                    'dist_per_min' => 95,
                    'hir_18_24_kmh' => 600,
                    'sprint_distance' => 120,
                    'total_18kmh' => 720,
                    'accels' => 20,
                    'decels' => 20,
                    'hr_band_4_dist' => 7000,
                    'hr_band_4_dur' => '01.05.00',
                    'hr_band_5_dist' => 3500,
                    'hr_band_5_dur' => '00.30.00',
                    'player_load' => 850,
                    'max_velocity' => 28.0,
                ]
            ],
            [
                'name' => 'MD - 5',
                'metrics' => [
                    'total_distance' => 4500,
                    'dist_per_min' => 80,
                    'hir_18_24_kmh' => 200,
                    'sprint_distance' => 40,
                    'total_18kmh' => 240,
                    'accels' => 10,
                    'decels' => 10,
                    'hr_band_4_dist' => 2500,
                    'hr_band_4_dur' => '00.25.00',
                    'hr_band_5_dist' => 1000,
                    'hr_band_5_dur' => '00.10.00',
                    'player_load' => 400,
                    'max_velocity' => 25.0,
                ]
            ],
        ];

        foreach ($benchmarks as $b) {
            Benchmark::updateOrCreate(
                [
                    'name' => $b['name'],
                    'club_id' => $club->id
                ], 
                [
                    'metrics' => $b['metrics'] // Laravel otomatis menangani array ke JSON jika ada $casts, atau simpan sebagai string JSON.
                ]
            );
        }

        $this->command->info('Berhasil mengonfigurasi 6 Benchmark (MD hingga MD - 5) format JSON!');
    }
}