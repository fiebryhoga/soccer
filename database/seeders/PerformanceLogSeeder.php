<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Club;
use App\Models\Player;
use App\Models\PerformanceLog;
use App\Models\PlayerMetric;
use App\Models\Benchmark;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PerformanceLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $club = Club::where('name', 'Persebaya')->first();
        if (!$club) {
            $this->command->error('Klub Persebaya tidak ditemukan! Jalankan ClubAndPlayerSeeder dulu.');
            return;
        }

        // Ambil semua pemain Persebaya
        $players = Player::where('club_id', $club->id)->get();
        if ($players->isEmpty()) {
            $this->command->error('Pemain tidak ditemukan!');
            return;
        }

        // Ambil semua benchmark (Target)
        $benchmarks = Benchmark::all()->keyBy('name');

        // Mulai dari 1 Januari 2026 sampai hari ini 26 April 2026
        $startDate = Carbon::create(2026, 1, 1);
        $endDate = Carbon::create(2026, 4, 26);

        DB::beginTransaction();
        try {
            // Bersihkan data log lama (Opsional, agar tidak duplikat jika dirun ulang)
            // PerformanceLog::truncate(); 
            // PlayerMetric::truncate();

            $currentDate = $startDate->copy();
            
            // Pola Mingguan Periodisasi Taktikal (Microcycle)
            // Senin(0) s.d Minggu(6)
            $weeklyPattern = [
                'Monday'    => ['type' => 'training', 'title' => 'Recovery & Low Intensity', 'tag' => 'MD - 5', 'bm' => 'MD - 5'],
                'Tuesday'   => ['type' => 'training', 'title' => 'Strength / Extensive Tactical', 'tag' => 'MD - 4', 'bm' => 'MD - 4'],
                'Wednesday' => ['type' => 'training', 'title' => 'Endurance / Intensive Tactical', 'tag' => 'MD - 3', 'bm' => 'MD - 3'],
                'Thursday'  => ['type' => 'off',      'title' => 'Day Off / Rest', 'tag' => 'OFF', 'bm' => null],
                'Friday'    => ['type' => 'training', 'title' => 'Speed & Agility', 'tag' => 'MD - 2', 'bm' => 'MD - 2'],
                'Saturday'  => ['type' => 'training', 'title' => 'Activation / Tapering', 'tag' => 'MD - 1', 'bm' => 'MD - 1'],
                'Sunday'    => ['type' => 'match',    'title' => 'Match Day vs Opponent', 'tag' => 'MD', 'bm' => 'MD'],
            ];

            $totalLogs = 0;
            $totalMetrics = 0;

            while ($currentDate->lte($endDate)) {
                $dayName = $currentDate->format('l');
                $pattern = $weeklyPattern[$dayName];

                // Ambil objek Benchmark untuk mendapatkan ID-nya
                $bmData = $pattern['bm'] ? $benchmarks->get($pattern['bm']) : null;

                // 1. Buat Log Sesi Harian
                $log = PerformanceLog::create([
                    'club_id' => $club->id,
                    'date' => $currentDate->format('Y-m-d'),
                    'type' => $pattern['type'],
                    'title' => $pattern['title'],
                    'tag' => $pattern['tag'],
                    // Ganti menjadi benchmark_id dan masukkan ID-nya
                    'benchmark_id' => $bmData ? $bmData->id : null 
                ]);
                $totalLogs++;

                // 2. Jika bukan hari libur, buat metrik untuk setiap pemain
                if ($pattern['type'] !== 'off') {
                    $bmData = $benchmarks->get($pattern['bm']);

                    foreach ($players as $player) {
                        // Variasi Random (Jitter) ± 15% dari target benchmark agar data realistis
                        $variance = rand(85, 115) / 100;
                        
                        // Khusus kiper/pemain cadangan bisa kita buat variansinya lebih kecil,
                        // tapi di sini kita ratakan dulu semua aktif.

                        // Data Dasar (Default ke 0 jika gagal)
                        // Ambil dan decode metrics dari Benchmark
                        $bmMetrics = null;
                        if ($bmData) {
                            $bmMetrics = is_string($bmData->metrics) ? json_decode($bmData->metrics, true) : $bmData->metrics;
                        }

                        // Data Dasar (Default jika tidak ada Benchmark)
                        $bmTotalDist  = $bmMetrics['total_distance'] ?? 7000;
                        $bmDistPerMin = $bmMetrics['dist_per_min'] ?? 90;
                        $bmHir        = $bmMetrics['hir_18_24_kmh'] ?? 400;
                        $bmSprint     = $bmMetrics['sprint_distance'] ?? 90;
                        $bmLoad       = $bmMetrics['player_load'] ?? 600;
                        $bmAccels     = $bmMetrics['accels'] ?? 20;
                        $bmDecels     = $bmMetrics['decels'] ?? 20;
                        $bmHr4Dist    = $bmMetrics['hr_band_4_dist'] ?? 4000;
                        $bmHr5Dist    = $bmMetrics['hr_band_5_dist'] ?? 2000;
                        $targetMaxVel = $bmMetrics['max_velocity'] ?? 28.0;

                        // Kalkulasi Variansi
                        $totalDistance = round($bmTotalDist * $variance);
                        $distPerMin    = round($bmDistPerMin * $variance, 1);
                        $hir           = round($bmHir * $variance);
                        $sprint        = round($bmSprint * $variance);
                        $total18       = $hir + $sprint;

                        $accels     = round($bmAccels * $variance);
                        $decels     = round($bmDecels * $variance);
                        $hr4Dist    = round($bmHr4Dist * $variance);
                        $hr5Dist    = round($bmHr5Dist * $variance);
                        $playerLoad = round($bmLoad * $variance);

                        // Max Velocity
                        $highestMetrics = is_string($player->highest_metrics) ? json_decode($player->highest_metrics, true) : $player->highest_metrics;
                        $highestVel = $highestMetrics['max_velocity'] ?? 32.0;

                        // Variasi speed sedikit
                        $actualMaxVel = round($targetMaxVel * (rand(95, 105) / 100), 2);
                        if ($actualMaxVel > $highestVel) {
                            $actualMaxVel = $highestVel;
                        }
                        
                        // Cegah max velocity melebihi highest
                        if ($actualMaxVel > $highestVel) {
                            $actualMaxVel = $highestVel;
                        }
                        
                        $maxVelPercent = round(($actualMaxVel / $highestVel) * 100, 1);

                        // String Jam (Format HH.MM.SS)
                        // Mengacak durasi HR ± beberapa menit
                        $hr4Mins = rand(20, 60);
                        $hr5Mins = rand(5, 20);
                        $hr4Dur = sprintf("00.%02d.%02d", $hr4Mins, rand(0, 59));
                        $hr5Dur = sprintf("00.%02d.%02d", $hr5Mins, rand(0, 59));
                        $totalDur = sprintf("01.%02d.%02d", rand(0, 30), rand(0, 59));

                        // Persentase terhadap MD (Match Day Benchmark - 100%)
                        $mdBm = $benchmarks->get('MD');
                        $mdMetrics = null;
                        if ($mdBm) {
                            $mdMetrics = is_string($mdBm->metrics) ? json_decode($mdBm->metrics, true) : $mdBm->metrics;
                        }

                        // Ambil nilai MD dari JSON (Gunakan fallback 1 untuk mencegah Division by Zero)
                        $mdTotalDist  = $mdMetrics['total_distance'] ?? 1;
                        $mdDistPerMin = $mdMetrics['dist_per_min'] ?? 1;
                        $mdLoad       = $mdMetrics['player_load'] ?? 1;

                        $pDistMD    = $mdBm ? round(($totalDistance / $mdTotalDist) * 100, 1) : 0;
                        $pDistMinMD = $mdBm ? round(($distPerMin / $mdDistPerMin) * 100, 1) : 0;
                        $pLoadMD    = $mdBm ? round(($playerLoad / $mdLoad) * 100, 1) : 0;

                        // Insert ke PlayerMetric
                        PlayerMetric::create([
                            'performance_log_id' => $log->id,
                            'player_id' => $player->id,
                            'metrics' => [ // <--- UBAH JADI 'metrics'
                                'total_duration' => $totalDur,
                                'total_distance' => $totalDistance,
                                'total_distance_percent' => $pDistMD . '%',
                                'dist_per_min' => $distPerMin,
                                'dist_per_min_percent' => $pDistMinMD . '%',
                                'hir_18_24_kmh' => $hir,
                                'hir_18_24_kmh_percent' => round(($hir / $totalDistance) * 100, 1) . '%',
                                'sprint_distance' => $sprint,
                                'sprint_distance_percent' => round(($sprint / $totalDistance) * 100, 1) . '%',
                                'total_18kmh' => $total18,
                                'total_18kmh_percent' => round(($total18 / $totalDistance) * 100, 1) . '%',
                                'accels' => $accels,
                                'decels' => $decels,
                                'hr_band_4_dist' => $hr4Dist,
                                'hr_band_4_dur' => $hr4Dur,
                                'hr_band_5_dist' => $hr5Dist,
                                'hr_band_5_dur' => $hr5Dur,
                                'max_velocity' => $actualMaxVel,
                                'max_velocity_percent' => $maxVelPercent . '%',
                                'highest_max_velocity' => $highestVel,
                                'player_load' => $playerLoad,
                                'player_load_percent' => $pLoadMD . '%',
                            ]
                        ]);
                        $totalMetrics++;
                    }
                }

                $currentDate->addDay();
            }

            DB::commit();
            $this->command->info("Berhasil men-generate {$totalLogs} Sesi Log dan {$totalMetrics} data Pemain dari 1 Jan - 26 Apr 2026!");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Gagal! Error: " . $e->getMessage());
        }
    }
}