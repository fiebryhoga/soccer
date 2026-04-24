<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Benchmark;
use App\Models\Club;

class BenchmarkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada club terlebih dahulu (jika belum ada, buat dummy)
        $club = Club::firstOrCreate(
            ['id' => 1],
            ['name' => 'Klub Utama', 'logo' => null]
        );

        // Data metrik hasil pemetaan dari Excel yang Anda berikan
        // Urutan: CB, FB, MF, WF, FW
        $metrics = [
            'total_distance' => [
                'CB' => 6000, 'FB' => 6000, 'MF' => 6000, 'WF' => 6000, 'FW' => 6000
            ],
            'distance_per_min' => [
                'CB' => 80, 'FB' => 80, 'MF' => 80, 'WF' => 80, 'FW' => 80
            ],
            'hir_distance' => [
                'CB' => 400, 'FB' => 800, 'MF' => 700, 'WF' => 1000, 'FW' => 900
            ],
            'hsr_distance' => [
                'CB' => 300, 'FB' => 300, 'MF' => 300, 'WF' => 300, 'FW' => 300
            ],
            'sprint_distance' => [
                'CB' => 18, 'FB' => 18, 'MF' => 18, 'WF' => 18, 'FW' => 18
            ],
            'accels' => [
                'CB' => 5, 'FB' => 9, 'MF' => 8, 'WF' => 11, 'FW' => 4
            ],
            'decels' => [
                'CB' => 15, 'FB' => 25, 'MF' => 16, 'WF' => 19, 'FW' => 19
            ],
            'hr_band_4_dist' => [
                'CB' => 5211, 'FB' => 5440, 'MF' => 7241, 'WF' => 4796, 'FW' => 4359
            ],
            'hr_band_5_dist' => [
                'CB' => 5900, 'FB' => 8780, 'MF' => 7076, 'WF' => 7551, 'FW' => 6009
            ],
            'total_18kmh' => [
                'CB' => 318, 'FB' => 318, 'MF' => 318, 'WF' => 318, 'FW' => 318
            ],
            'player_load' => [
                'CB' => 959, 'FB' => 1023, 'MF' => 1075, 'WF' => 1066, 'FW' => 898
            ],
        ];

        // Masukkan data ke Database (Gunakan updateOrCreate agar tidak dobel kalau di-run berkali-kali)
        Benchmark::updateOrCreate(
            [
                'club_id' => $club->id,
                'name' => 'contoh 1', // Nama Benchmark sesuai permintaan
                'target_type' => 'team'
            ],
            [
                'metrics' => $metrics
            ]
        );
    }
}