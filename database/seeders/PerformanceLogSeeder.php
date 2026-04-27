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
    public function run(): void
    {
        $club = Club::where('name', 'Persebaya')->first();
        if (!$club) {
            $this->command->error('Klub Persebaya tidak ditemukan!');
            return;
        }

        $players = Player::where('club_id', $club->id)->get();
        if ($players->isEmpty()) {
            $this->command->error('Pemain tidak ditemukan!');
            return;
        }

        $benchmarks = Benchmark::all()->keyBy('name');

        $startDate = Carbon::create(2026, 1, 1);
        $endDate = Carbon::create(2026, 4, 26);

        // --- 1. INISIALISASI PENAMAAN OTOMATIS ---
        $trainingCounter = 1;
        $matchIndex = 0;
        $opponents = [
            'Persib Bandung', 'Persija Jakarta', 'Bali United', 'Arema FC', 
            'PSM Makassar', 'Borneo FC', 'Madura United', 'Persis Solo', 
            'Dewa United', 'PSIS Semarang', 'Barito Putera', 'Persita Tangerang'
        ];

        DB::beginTransaction();
        try {
            $currentDate = $startDate->copy();
            
            // Pola Mingguan Periodisasi
            $weeklyPattern = [
                'Monday'    => ['type' => 'training', 'tag' => 'MD - 5', 'bm' => 'MD - 5'],
                'Tuesday'   => ['type' => 'training', 'tag' => 'MD - 4', 'bm' => 'MD - 4'],
                'Wednesday' => ['type' => 'training', 'tag' => 'MD - 3', 'bm' => 'MD - 3'],
                'Thursday'  => ['type' => 'off',      'tag' => 'OFF',    'bm' => null],
                'Friday'    => ['type' => 'training', 'tag' => 'MD - 2', 'bm' => 'MD - 2'],
                'Saturday'  => ['type' => 'training', 'tag' => 'MD - 1', 'bm' => 'MD - 1'],
                'Sunday'    => ['type' => 'match',    'tag' => 'MD',     'bm' => 'MD'],
            ];

            $totalLogs = 0;
            $totalMetrics = 0;

            // Dasar metrik untuk kalkulasi % Match Day
            $mdBm = $benchmarks->get('MD');
            $mdMetrics = null;
            if ($mdBm) {
                $mdMetrics = is_string($mdBm->metrics) ? json_decode($mdBm->metrics, true) : $mdBm->metrics;
            }
            $mdTotalDist  = $mdMetrics['total_distance'] ?? 10500;
            $mdDistPerMin = $mdMetrics['dist_per_min'] ?? 115;
            $mdLoad       = $mdMetrics['player_load'] ?? 1000;

            while ($currentDate->lte($endDate)) {
                $dayName = $currentDate->format('l');
                $pattern = $weeklyPattern[$dayName];
                
                // --- 2. LOGIKA PENENTUAN JUDUL (TITLE) ---
                $title = '';
                if ($pattern['type'] === 'training') {
                    $title = 'Session ' . str_pad($trainingCounter++, 3, '0', STR_PAD_LEFT);
                } elseif ($pattern['type'] === 'match') {
                    $opponent = $opponents[$matchIndex % count($opponents)];
                    $title = 'Match vs ' . $opponent . ' BRI Liga 1';
                    $matchIndex++;
                } else {
                    $title = 'Day Off / Rest';
                }

                $bmData = $pattern['bm'] ? $benchmarks->get($pattern['bm']) : null;

                $log = PerformanceLog::create([
                    'club_id' => $club->id,
                    'date' => $currentDate->format('Y-m-d'),
                    'type' => $pattern['type'],
                    'title' => $title,
                    'tag' => $pattern['tag'],
                    'benchmark_id' => $bmData ? $bmData->id : null 
                ]);
                $totalLogs++;

                if ($pattern['type'] !== 'off') {
                    $sessionMins = match($pattern['tag']) {
                        'MD' => rand(95, 100),
                        'MD - 1', 'MD - 5' => rand(55, 65),
                        default => rand(75, 90),
                    };
                    $totalDur = ($sessionMins >= 60) 
                        ? sprintf("01.%02d.%02d", $sessionMins % 60, rand(0, 59)) 
                        : sprintf("00.%02d.%02d", $sessionMins, rand(0, 59));

                    $baseScale = match($pattern['tag']) {
                        'MD' => rand(95, 105) / 100,
                        'MD - 1' => rand(58, 75) / 100,
                        'MD - 2' => rand(75, 90) / 100,
                        'MD - 3' => rand(85, 100) / 100,
                        'MD - 4' => rand(80, 95) / 100,
                        'MD - 5' => rand(50, 65) / 100,
                        default => 0.8,
                    };

                    $intensityScale = in_array($pattern['tag'], ['MD - 1', 'MD - 5']) ? (rand(10, 30) / 100) : 1.0;

                    $bmMetricsDaily = null;
                    if ($bmData) {
                        $bmMetricsDaily = is_string($bmData->metrics) ? json_decode($bmData->metrics, true) : $bmData->metrics;
                    }
                    
                    $targetTotalDist = $bmMetricsDaily['total_distance'] ?? $mdTotalDist;
                    $targetDistPerMin= $bmMetricsDaily['dist_per_min'] ?? $mdDistPerMin;
                    $targetAccels    = $bmMetricsDaily['accels'] ?? 30;
                    $targetDecels    = $bmMetricsDaily['decels'] ?? 30;
                    $targetLoad      = $bmMetricsDaily['player_load'] ?? 700;

                    foreach ($players as $player) {
                        $playerVariance = $baseScale * (rand(90, 110) / 100);

                        // Basic Metrics
                        $totalDistance = round($targetTotalDist * $playerVariance);
                        $distPerMin    = round($targetDistPerMin * $playerVariance);
                        $accels        = round($targetAccels * $playerVariance * $intensityScale);
                        $decels        = round($targetDecels * $playerVariance * $intensityScale);
                        $playerLoad    = round($targetLoad * $playerVariance);

                        // Ambil highest_velocity dari model Player
                        $highestMetrics = is_string($player->highest_metrics) ? json_decode($player->highest_metrics, true) : $player->highest_metrics;
                        $highestVel = $highestMetrics['highest_velocity'] ?? $highestMetrics['max_velocity'] ?? 32;
                        $actualMaxVel = round(($highestVel * 0.85) * (rand(90, 105) / 100));
                        if ($actualMaxVel > $highestVel) $actualMaxVel = $highestVel;

                        // Advanced/GPS Metrics (Disesuaikan dengan scale latihan)
                        $hir = round(rand(50, 200) * $playerVariance * $intensityScale);
                        $sprintDist = round(rand(5, 30) * $playerVariance * $intensityScale);
                        
                        $hr4Dist = round(rand(500, 2500) * $playerVariance);
                        $hr4DurMins = round($hr4Dist / 100); // Estimasi durasi kasar
                        $hr4DurStr = sprintf("00.%02d.%02d", min($hr4DurMins, 59), rand(0, 59));

                        $hr5Dist = round(rand(100, 1500) * $playerVariance * $intensityScale);
                        $hr5DurMins = round($hr5Dist / 100);
                        $hr5DurStr = sprintf("00.%02d.%02d", min($hr5DurMins, 59), rand(0, 59));

                        PlayerMetric::create([
                            'performance_log_id' => $log->id,
                            'player_id' => $player->id,
                            'metrics' => [
                                // Di-cast ke string secara eksplisit agar format JSON persis seperti contoh
                                'total_duration'   => $totalDur,
                                'total_distance'   => (string) $totalDistance,
                                'dist_per_min'     => (string) $distPerMin,
                                'hir_18_24_kmh'    => (string) $hir,
                                'sprint_distance'  => (string) $sprintDist,
                                'total_18kmh'      => null,
                                'accels'           => (string) $accels,
                                'decels'           => (string) $decels,
                                'hr_band_4_dist'   => (string) $hr4Dist,
                                'hr_band_4_dur'    => $hr4DurStr,
                                'hr_band_5_dist'   => (string) $hr5Dist,
                                'hr_band_5_dur'    => $hr5DurStr,
                                'max_velocity'     => (string) $actualMaxVel,
                                'highest_velocity' => null,
                                'player_load'      => (string) $playerLoad,
                                
                                // Booleans
                                'selected'         => true,
                                'selected_hr4'     => true,
                                'selected_hr5'     => true,
                                'selected_pl'      => true,
                            ]
                        ]);
                        $totalMetrics++;
                    }
                }
                $currentDate->addDay();
            }

            DB::commit();
            $this->command->info("Berhasil! Menghasilkan {$totalLogs} log dengan format metrik persis seperti JSON yang diminta.");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Gagal! Error: " . $e->getMessage());
        }
    }
}