<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Club;
use App\Models\Player;

class ClubAndPlayerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat atau perbarui Klub
        $club = Club::updateOrCreate(
            ['name' => 'Persebaya'],
            ['name' => 'Persebaya']
        );

        // 2. Daftar Pemain beserta Metrik Highest Velocity-nya
        $players = [
            // Center Back (CB)
            ['position' => 'CB', 'position_number' => 44, 'name' => 'Gustavo Fernandes', 'highest_velocity' => 32],
            ['position' => 'CB', 'position_number' => 24, 'name' => 'Leo Lelis', 'highest_velocity' => 30],
            ['position' => 'CB', 'position_number' => 18, 'name' => 'Rendy May', 'highest_velocity' => 36],
            ['position' => 'CB', 'position_number' => 5,  'name' => 'Risto Mitrevski', 'highest_velocity' => 32],
            ['position' => 'CB', 'position_number' => 66, 'name' => 'Sheva Kardanu', 'highest_velocity' => 32],
            
            // Full Back (FB)
            ['position' => 'FB', 'position_number' => 2,  'name' => 'Catur Pamungkas', 'highest_velocity' => 35],
            ['position' => 'FB', 'position_number' => 78, 'name' => 'Ilham Mujtaba', 'highest_velocity' => 30],
            ['position' => 'FB', 'position_number' => 17, 'name' => 'Jefferson Silva', 'highest_velocity' => 31],
            ['position' => 'FB', 'position_number' => 33, 'name' => 'Koko Ari', 'highest_velocity' => 36],
            ['position' => 'FB', 'position_number' => 15, 'name' => 'Mikael Tata', 'highest_velocity' => 33],
            
            // Midfielder (MF)
            ['position' => 'MF', 'position_number' => 81, 'name' => 'Ichsas Baihaqi', 'highest_velocity' => 30],
            ['position' => 'MF', 'position_number' => 88, 'name' => 'Milos Raickovic', 'highest_velocity' => 30],
            ['position' => 'MF', 'position_number' => 8,  'name' => 'Oktavianus Fernando', 'highest_velocity' => 31],
            ['position' => 'MF', 'position_number' => 16, 'name' => 'Pedro Matos', 'highest_velocity' => 32],
            ['position' => 'MF', 'position_number' => 7,  'name' => 'Rivera Israel', 'highest_velocity' => 32],
            ['position' => 'MF', 'position_number' => 55, 'name' => 'Sadida Nugraha', 'highest_velocity' => 31],
            ['position' => 'MF', 'position_number' => 68, 'name' => 'Toni Firmansyah', 'highest_velocity' => 35],
            
            // Wing Forward (WF)
            ['position' => 'WF', 'position_number' => 10, 'name' => 'Bruno Moreira', 'highest_velocity' => 34],
            ['position' => 'WF', 'position_number' => 26, 'name' => 'Dimas Wicaksono', 'highest_velocity' => 34],
            ['position' => 'WF', 'position_number' => 22, 'name' => 'Gali Freitas', 'highest_velocity' => 35],
            ['position' => 'WF', 'position_number' => 77, 'name' => 'Malik Risaldi', 'highest_velocity' => 36],
            ['position' => 'WF', 'position_number' => 14, 'name' => 'Riyan Ardiyansah', 'highest_velocity' => 31],
            
            // Forward (FW)
            ['position' => 'FW', 'position_number' => 9,  'name' => 'Bruno Paraiba', 'highest_velocity' => 33],
            ['position' => 'FW', 'position_number' => 11, 'name' => 'Mihailo Perovic', 'highest_velocity' => 33],
        ];

        // 3. Masukkan data pemain ke dalam database
        foreach ($players as $p) {
            Player::updateOrCreate(
                [
                    'club_id' => $club->id, 
                    'position_number' => $p['position_number']
                ],
                [
                    'name' => trim($p['name']),
                    'position' => $p['position'],
                    
                    // HANYA SIMPAN HIGHEST VELOCITY
                    'highest_metrics' => [
                        'highest_velocity' => $p['highest_velocity']
                    ]
                ]
            );
        }

        $this->command->info('Berhasil insert/update klub Persebaya beserta ' . count($players) . ' pemain dengan data metrik terbaru!');
    }
}