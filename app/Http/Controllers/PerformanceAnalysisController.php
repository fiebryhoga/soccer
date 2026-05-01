<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PerformanceLog;
use App\Models\Club;
use App\Models\Player;
use App\Models\PlayerMetric;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class PerformanceAnalysisController extends Controller
{
    
    public function strainMonotony(Request $request)
    {
        $club = Club::first();
        if (!$club) return redirect()->back()->with('error', 'Klub belum diatur.');

        // Default: 5 Minggu terakhir (Minggu ini mundur 4 minggu)
        $endDateParam = $request->input('end_date', now()->toDateString());
        $startDateParam = $request->input('start_date', Carbon::parse($endDateParam)->subWeeks(4)->startOfWeek(Carbon::MONDAY)->toDateString());

        $endOfWeek = Carbon::parse($endDateParam)->endOfWeek(Carbon::SUNDAY);
        $startOfWeek = Carbon::parse($startDateParam)->startOfWeek(Carbon::MONDAY);

        $logs = PerformanceLog::with('benchmark')
            ->where('club_id', $club->id)
            ->whereBetween('date', [$startOfWeek->toDateString(), $endOfWeek->toDateString()])
            ->get()->keyBy('date');

        $players = Player::all();

        $columnsToAverage = [
            'total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 
            'total_18kmh', 'accels', 'decels', 'hr_band_4_dist', 'hr_band_4_dur', // <-- Tambahkan
            'hr_band_5_dist', 'hr_band_5_dur', // <-- Tambahkan
            'max_velocity', 'player_load'
        ];

        $weeksData = [];
        $currentStart = $startOfWeek->copy();
        $weekNumber = 1;

        // Looping pemotongan per Minggu
        while ($currentStart->lte($endOfWeek)) {
            $currentEnd = $currentStart->copy()->endOfWeek(Carbon::SUNDAY);
            $period = CarbonPeriod::create($currentStart, $currentEnd);
            
            $daysData = [];
            foreach ($period as $dateObj) {
                $dateStr = $dateObj->toDateString();
                $log = $logs->get($dateStr);
                
                if (!$log || $log->type === 'off') {
                    $daysData[] = [
                        'date' => $dateStr,
                        'day_name' => $dateObj->translatedFormat('l'),
                        'title' => 'off',
                        'type' => 'off',
                        'averages' => []
                    ];
                    continue;
                }

                $benchmark = $log->benchmark ? $log->benchmark->toArray() : null;
                $metrics = PlayerMetric::where('performance_log_id', $log->id)->get();
                $teamAverage = $this->calculateTeamAverageForSession($players, $metrics, $benchmark, $columnsToAverage);

                $daysData[] = [
                    'date' => $dateStr,
                    'day_name' => $dateObj->translatedFormat('l'),
                    'title' => $log->title ?: strtoupper($log->type),
                    'type' => $log->type,
                    'averages' => $teamAverage
                ];
            }

            $weeksData[] = [
                'week_label' => "W" . $weekNumber . " (" . $currentStart->translatedFormat('d M') . " - " . $currentEnd->translatedFormat('d M') . ")",
                'start_date' => $currentStart->toDateString(),
                'end_date' => $currentEnd->toDateString(),
                'days' => $daysData
            ];

            $currentStart->addWeek();
            $weekNumber++;
        }

        return inertia('TeamAnalysis/StrainMonotony', [
            'weeksData' => $weeksData,
            'startDate' => $startOfWeek->toDateString(),
            'endDate' => $endOfWeek->toDateString(),
        ]);
    }

    public function acwr(Request $request)
    {
        $club = Club::first();
        if (!$club) return redirect()->back()->with('error', 'Klub belum diatur.');

        // Filter tampilan rentang grafik
        $endDateParam = $request->input('end_date', now()->toDateString());
        $startDateParam = $request->input('start_date', Carbon::parse($endDateParam)->subDays(14)->toDateString());

        // LOGIKA BARU YANG SUDAH DIPERBAIKI: 
        // Cari tanggal PALING AWAL, TAPI abaikan yang statusnya 'off'
        $firstLog = PerformanceLog::where('club_id', $club->id)
            ->where('type', '!=', 'off') // <-- INI KUNCI PERBAIKANNYA
            ->orderBy('date', 'asc')
            ->first();
        
        $fetchStart = $firstLog ? Carbon::parse($firstLog->date) : Carbon::parse($startDateParam);
        
        // Jaga-jaga jika filter end_date lebih lampau dari first log
        if ($fetchStart->gt(Carbon::parse($endDateParam))) {
            $fetchStart = Carbon::parse($startDateParam);
        }
        $fetchEnd = Carbon::parse($endDateParam);

        $logs = PerformanceLog::with('benchmark')
            ->where('club_id', $club->id)
            ->whereBetween('date', [$fetchStart->toDateString(), $fetchEnd->toDateString()])
            ->get()->keyBy('date');

        $players = Player::all();
        $period = CarbonPeriod::create($fetchStart, $fetchEnd);

        $columnsToAverage = [
            'total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 
            'total_18kmh', 'accels', 'decels', 'hr_band_4_dist', 'hr_band_5_dist',
            'max_velocity', 'highest_velocity', 'player_load'
        ];

        $dailyData = [];

        foreach ($period as $dateObj) {
            $dateStr = $dateObj->toDateString();
            $log = $logs->get($dateStr);
            
            if (!$log || $log->type === 'off') {
                $dailyData[] = [
                    'date' => $dateStr,
                    'day_name' => $dateObj->translatedFormat('l, d M'),
                    'title' => 'off',
                    'type' => 'off',
                    'averages' => []
                ];
                continue;
            }

            $benchmark = $log->benchmark ? $log->benchmark->toArray() : null;
            $metrics = PlayerMetric::where('performance_log_id', $log->id)->get();
            $teamAverage = $this->calculateTeamAverageForSession($players, $metrics, $benchmark, $columnsToAverage);

            $dailyData[] = [
                'date' => $dateStr,
                'day_name' => $dateObj->translatedFormat('l, d M'),
                'title' => $log->title ?: strtoupper($log->type),
                'type' => $log->type,
                'averages' => $teamAverage
            ];
        }

        return inertia('TeamAnalysis/ACWR', [
            'historicalData' => $dailyData,
            'startDate' => $startDateParam,
            'endDate' => $endDateParam,
        ]);
    }

    public function comparison(Request $request)
    {
        $club = Club::first();
        if (!$club) return redirect()->back()->with('error', 'Klub belum diatur.');

        $sessionIds = $request->input('session_ids', []); 
        $tags = $request->input('tags', []); 

        $query = PerformanceLog::with('benchmark')->where('club_id', $club->id)->where('type', '!=', 'off');

        if (!empty($sessionIds)) {
            $query->whereIn('id', $sessionIds);
        } elseif (!empty($tags)) {
            $query->whereIn('tag', $tags);
        } else {
            $query->orderBy('date', 'desc')->limit(3);
        }

        $logs = $query->orderBy('date', 'asc')->get();
        $players = Player::all();

        $allSessions = PerformanceLog::where('club_id', $club->id)->where('type', '!=', 'off')->orderBy('date', 'desc')->get(['id', 'title', 'date', 'tag']);
        $availableTags = PerformanceLog::whereNotNull('tag')->distinct()->pluck('tag');

        // LOGIKA BARU: Cek jumlah sesi yang ditemukan
        if ($logs->count() === 1) {
            // ---------------------------------------------------------
            // SINGLE SESSION MODE (Analysis)
            // ---------------------------------------------------------
            $singleLog = $logs->first();
            $metrics = PlayerMetric::where('performance_log_id', $singleLog->id)->get();
            
            $playerMetricsData = [];
            foreach ($players as $player) {
                $playerMetric = $metrics->where('player_id', $player->id)->first();
                if ($playerMetric) {
                     $rawMetrics = is_array($playerMetric->metrics) ? $playerMetric->metrics : json_decode($playerMetric->metrics, true);
                     $playerMetricsData[] = [
                         'player' => [
                             'id' => $player->id,
                             'name' => $player->name,
                             'position' => $player->position,
                             'position_number' => $player->position_number,
                         ],
                         'metrics' => $rawMetrics
                     ];
                }
            }

            $teamAverage = $this->calculateTeamAverageForSession($players, $metrics, $singleLog->benchmark, [
                 'total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 
                 'total_18kmh', 'accels', 'decels', 'hr_band_4_dist', 'hr_band_4_dur', 
                 'hr_band_5_dist', 'hr_band_5_dur', 'max_velocity', 'player_load'
            ]);

            // KEMBALI KE FILE COMPARISON.JSX
            return inertia('TeamAnalysis/Comparison', [ 
                'isSingleSession' => true,
                'sessionData' => [
                    'id' => $singleLog->id,
                    'title' => $singleLog->title ?: strtoupper($singleLog->type),
                    'date' => $singleLog->date,
                    'tag' => $singleLog->tag,
                    'teamAverages' => $teamAverage,
                    'playerMetrics' => $playerMetricsData
                ],
                'allSessions' => $allSessions,
                'availableTags' => $availableTags,
                'filters' => $request->only(['session_ids', 'tags'])
            ]);

        } else {
            // ---------------------------------------------------------
            // MULTI-SESSION MODE (Comparison)
            // ---------------------------------------------------------
            $comparisonData = $logs->map(function($log) use ($players) {
                $metrics = PlayerMetric::where('performance_log_id', $log->id)->get();
                
                return [
                    'id' => $log->id,
                    'title' => $log->title ?: strtoupper($log->type),
                    'date' => $log->date,
                    'tag' => $log->tag,
                    'averages' => $this->calculateTeamAverageForSession($players, $metrics, $log->benchmark, [
                        'total_distance', 
                        'dist_per_min', 
                        'hir_18_24_kmh', 
                        'sprint_distance', 
                        'total_18kmh', 
                        'accels', 
                        'decels', 
                        'hr_band_4_dist', 
                        'hr_band_4_dur',
                        'hr_band_5_dist', 
                        'hr_band_5_dur',
                        'max_velocity', 
                        'player_load'
                    ])
                ];
            });

            // KEMBALI KE FILE COMPARISON.JSX JUGA
            return inertia('TeamAnalysis/Comparison', [
                'isSingleSession' => false,
                'comparisonData' => $comparisonData,
                'allSessions' => $allSessions,
                'availableTags' => $availableTags,
                'filters' => $request->only(['session_ids', 'tags'])
            ]);
        }
    }

    private function calculateTeamAverageForSession($players, $metrics, $benchmark, $columnsToAverage)
{
    $teamAverage = [];
    $metricsByPlayer = $metrics->keyBy('player_id');

    foreach ($columnsToAverage as $col) {
        $sumVal = 0; $countVal = 0;
        $sumSec = 0; $countSec = 0; // Untuk hitung waktu
        $sumPct = 0; $countPct = 0;

        $isDuration = str_contains($col, '_dur');

        foreach ($players as $player) {
            $playerMetric = $metricsByPlayer->get($player->id);
            if (!$playerMetric) continue;

            $rawMetrics = is_array($playerMetric->metrics) ? $playerMetric->metrics : json_decode($playerMetric->metrics, true);
            
            // Logika filter centang (tetap sama)
            $isValid = $this->checkSelectionStatus($col, $rawMetrics);

            if ($isValid) {
                $val = $rawMetrics[$col] ?? null;

                if ($isDuration) {
                    $seconds = $this->timeToSeconds($val);
                    if ($seconds !== null) {
                        $sumSec += $seconds;
                        $countSec++;
                    }
                } else {
                    $historicalHighest = is_array($player->highest_metrics) ? $player->highest_metrics : json_decode($player->highest_metrics, true) ?? [];
                    $calculatedVal = $this->getAutoCalculatedValue($rawMetrics, $col, $historicalHighest);
                    
                    if ($calculatedVal !== '' && $calculatedVal !== '-' && is_numeric($calculatedVal)) {
                        $sumVal += floatval($calculatedVal);
                        $countVal++;

                        $pct = $this->calculatePercentage($col, $calculatedVal, $player->position, $benchmark, $historicalHighest);
                        if (is_numeric($pct)) {
                            $sumPct += floatval($pct);
                            $countPct++;
                        }
                    }
                }
            }
        }

        // Simpan hasil rata-rata
        if ($isDuration) {
            $teamAverage[$col] = $countSec > 0 ? $this->secondsToTime($sumSec / $countSec) : '00.00.00';
        } else {
            $avgVal = $countVal > 0 ? ($sumVal / $countVal) : 0;
            $teamAverage[$col] = floor($avgVal) == $avgVal ? (string)$avgVal : number_format($avgVal, 1, '.', '');
            
            $avgPct = $countPct > 0 ? ($sumPct / $countPct) : 0;
            $teamAverage[$col . '_percent'] = number_format($avgPct, 1, '.', '');
        }
    }

    return $teamAverage;
}

    // Helper untuk cek centang agar kode lebih bersih
    private function checkSelectionStatus($col, $rawMetrics) {
        $distanceGroup = ['total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 'total_18kmh'];
        if (in_array($col, $distanceGroup)) return $rawMetrics['selected'] ?? true;
        if (str_contains($col, 'hr_band_4')) return $rawMetrics['selected_hr4'] ?? true;
        if (str_contains($col, 'hr_band_5')) return $rawMetrics['selected_hr5'] ?? true;
        if ($col === 'player_load') return $rawMetrics['selected_pl'] ?? true;
        return true; // Default untuk Accel/Decel/Vel
    }

    private function getAutoCalculatedValue($metrics, $colId, $playerHighest)
    {
        if ($colId === 'total_18kmh') {
            $hir = floatval($metrics['hir_18_24_kmh'] ?? 0);
            $sprint = floatval($metrics['sprint_distance'] ?? 0);
            $total = $hir + $sprint;
            if ($total == 0) return '-';
            return floor($total) == $total ? (string)$total : number_format($total, 1, '.', '');
        }
        if ($colId === 'highest_velocity') {
            $currentMax = floatval($metrics['max_velocity'] ?? 0);
            $historicalMax = floatval($playerHighest['highest_velocity'] ?? $playerHighest['max_velocity'] ?? 0);
            $max = max($currentMax, $historicalMax);
            return $max > 0 ? number_format($max, 2, '.', '') : '-';
        }
        return $metrics[$colId] ?? '-';
    }

    private function calculatePercentage($colId, $rawValue, $position, $activeBenchmark, $playerHighest)
    {
        if ($rawValue === null || $rawValue === '-' || $rawValue === '' || !is_numeric($rawValue)) return 0;
        $numValue = floatval($rawValue);

        if ($colId === 'max_velocity') {
            $targetHighest = floatval($playerHighest['highest_velocity'] ?? $playerHighest['max_velocity'] ?? 0);
            if ($targetHighest == 0) $targetHighest = 100; 
            return number_format(($numValue / max($targetHighest, 0.01)) * 100, 1, '.', '');
        }
        
        $targetValue = 100;
        
        if (isset($activeBenchmark['metrics'][$colId])) {
             if ($position && isset($activeBenchmark['metrics'][$colId][$position])) {
                 $targetValue = floatval($activeBenchmark['metrics'][$colId][$position]); 
             } elseif (is_numeric($activeBenchmark['metrics'][$colId])) {
                 $targetValue = floatval($activeBenchmark['metrics'][$colId]); 
             } elseif (!$position) {
                 $vals = array_values($activeBenchmark['metrics'][$colId]);
                 $targetValue = count($vals) > 0 ? array_sum($vals) / count($vals) : 100;
             }
        }
        
        return number_format(($numValue / max($targetValue, 0.01)) * 100, 1, '.', '');
    }

    private function timeToSeconds($timeStr) {
        if (!$timeStr || !str_contains($timeStr, '.')) return null;
        $parts = array_map('intval', explode('.', $timeStr));
        if (count($parts) == 3) return $parts[0] * 3600 + $parts[1] * 60 + $parts[2];
        if (count($parts) == 2) return $parts[0] * 60 + $parts[1];
        return null;
    }
    
    private function secondsToTime($seconds) {
        if ($seconds === null || $seconds <= 0) return '00.00.00';
        $h = floor($seconds / 3600);
        $m = floor(($seconds % 3600) / 60);
        $s = round($seconds % 60);
        return sprintf("%02d.%02d.%02d", $h, $m, $s);
    }
}