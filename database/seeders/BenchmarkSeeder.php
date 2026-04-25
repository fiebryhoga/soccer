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
        $club = Club::firstOrCreate(
            ['id' => 1],
            ['name' => 'Klub Utama', 'logo' => null]
        );

        // DATA METRIK (Key sudah disamakan dengan metrics.js)
        $metrics = [
            'total_distance' => [
                'CB' => 6000, 'FB' => 6000, 'MF' => 6000, 'WF' => 6000, 'FW' => 6000
            ],
            'dist_per_min' => [ // Diperbaiki: dari distance_per_min
                'CB' => 80, 'FB' => 80, 'MF' => 80, 'WF' => 80, 'FW' => 80
            ],
            'hir_18_kmh' => [ // Diperbaiki: dari hir_distance
                'CB' => 400, 'FB' => 800, 'MF' => 700, 'WF' => 1000, 'FW' => 900
            ],
            'hsr_21_kmh' => [ // Diperbaiki: dari hsr_distance
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
            
            // Jika ada metrik lain yang butuh target, masukkan di sini dengan Key yang sesuai metrics.js
        ];

        // Hapus Benchmark lama (opsional) agar tidak dobel nama saat testing
        Benchmark::where('name', 'contoh 1')->delete();

        Benchmark::updateOrCreate(
            [
                'club_id' => $club->id,
                'name' => 'contoh 1',
            ],
            [
                'target_type' => 'team',
                'metrics' => $metrics
            ]
        );
    }
}