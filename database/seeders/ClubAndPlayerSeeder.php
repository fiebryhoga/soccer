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
        // 1. Buat Klub Persebaya
        // Menggunakan updateOrCreate agar jika dijalankan ulang tidak duplikat
        $club = Club::updateOrCreate(
            ['name' => 'Persebaya'],
            ['name' => 'Persebaya']
        );

        // 2. Daftar Pemain Persebaya
        $players = [
            // Center Back (CB)
            ['position' => 'CB', 'position_number' => 44, 'name' => 'Gustavo Fernandes'],
            ['position' => 'CB', 'position_number' => 24, 'name' => 'Leo Lelis'],
            ['position' => 'CB', 'position_number' => 18, 'name' => 'Rendy May'],
            ['position' => 'CB', 'position_number' => 5, 'name' => 'Risto Mitrevski'],
            ['position' => 'CB', 'position_number' => 66, 'name' => 'Sheva Kardanu'],
            
            // Full Back (FB)
            ['position' => 'FB', 'position_number' => 2, 'name' => 'Catur Pamungkas'],
            ['position' => 'FB', 'position_number' => 78, 'name' => 'Ilham Mujtaba'],
            ['position' => 'FB', 'position_number' => 17, 'name' => 'Jefferson Silva'],
            ['position' => 'FB', 'position_number' => 33, 'name' => 'Koko Ari'],
            ['position' => 'FB', 'position_number' => 15, 'name' => 'Mikael Tata'],
            
            // Midfielder (MF)
            ['position' => 'MF', 'position_number' => 81, 'name' => 'Ichsas Baihaqi'],
            ['position' => 'MF', 'position_number' => 88, 'name' => 'Milos Raickovic'],
            ['position' => 'MF', 'position_number' => 8, 'name' => 'Oktavianus Fernando'],
            ['position' => 'MF', 'position_number' => 16, 'name' => 'Pedro Matos'],
            ['position' => 'MF', 'position_number' => 7, 'name' => 'Rivera Israel'],
            ['position' => 'MF', 'position_number' => 55, 'name' => 'Sadida Nugraha'],
            ['position' => 'MF', 'position_number' => 68, 'name' => 'Toni Firmansyah'],
            
            // Wing Forward (WF)
            ['position' => 'WF', 'position_number' => 10, 'name' => 'Bruno Moreira'],
            ['position' => 'WF', 'position_number' => 26, 'name' => 'Dimas Wicaksono'],
            ['position' => 'WF', 'position_number' => 22, 'name' => 'Gali Freitas'],
            ['position' => 'WF', 'position_number' => 77, 'name' => 'Malik Risaldi'],
            ['position' => 'WF', 'position_number' => 14, 'name' => 'Riyan Ardiyansah'],
            
            // Forward (FW)
            ['position' => 'FW', 'position_number' => 9, 'name' => 'Bruno Paraiba'],
            ['position' => 'FW', 'position_number' => 11, 'name' => 'Mihailo Perovic'],
        ];

        // 3. Masukkan data pemain ke dalam database
        foreach ($players as $p) {
            Player::updateOrCreate(
                [
                    'club_id' => $club->id, 
                    'position_number' => $p['position_number']
                ],
                [
                    'name' => $p['name'],
                    'position' => $p['position']
                ]
            );
        }

        $this->command->info('Berhasil insert klub Persebaya beserta ' . count($players) . ' pemain!');
    }
}