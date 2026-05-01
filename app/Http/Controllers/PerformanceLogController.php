<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\PerformanceLogExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\PerformanceLog;
use App\Models\Benchmark;
use App\Models\Club;
use App\Models\Player;
use App\Models\PlayerMetric;
use App\Models\Activity;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class PerformanceLogController extends Controller
{
    public function index(Request $request)
    {
        $club = Club::first();

        if (!$club || !$club->season_start_date) {
            return inertia('PerformanceLogs/Index', [
                'calendar' => [],
                'season_start_date' => $club->season_start_date ?? null
            ]);
        }

        $start = Carbon::parse($club->season_start_date);
        $end = now()->addDays(14); 
        
        $logs = PerformanceLog::where('club_id', $club->id)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()->keyBy('date');

        $calendar = [];
        $period = CarbonPeriod::create($start, $end);
        $dates = array_reverse(iterator_to_array($period));

        foreach ($dates as $date) {
            $d = $date->toDateString();
            $calendar[] = $logs[$d] ?? [
                'date' => $d, 
                'type' => 'off', 
                'title' => null,
                'id' => null 
            ];
        }

        return inertia('PerformanceLogs/Index', [
            'calendar' => $calendar,
            'season_start_date' => $club->season_start_date,
            'benchmarks' => Benchmark::all()
        ]);
    }

    public function updateStartDate(Request $request)
    {
        $request->validate([
            'season_start_date' => 'required|date'
        ]);

        $club = Club::first();
        $club->update([
            'season_start_date' => $request->season_start_date
        ]);
        
        Activity::log('mengatur tanggal mulai musim', $request->season_start_date, 'update');

        return redirect()->route('performance-logs.index')->with('message', 'Kalender berhasil dibuat!');
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:off,training,match',
            'tag' => 'nullable|string|max:20', 
        ]);

        $club = Club::firstOrFail();
        $dateObj = Carbon::parse($request->date);
        $formattedDate = $dateObj->translatedFormat('d M Y');

        $existingLog = PerformanceLog::where('club_id', $club->id)->where('date', $request->date)->first();
        $title = null;

        if ($request->type !== 'off') {
            if ($existingLog && $existingLog->title) {
                $title = $existingLog->title;
            } else {
                if ($request->type === 'training') {
                    $lastTraining = PerformanceLog::where('club_id', $club->id)
                        ->where('type', 'training')
                        ->whereNotNull('title')
                        ->where('title', 'like', 'Session %') 
                        ->orderBy('created_at', 'desc') 
                        ->first();

                    $nextSeries = 1;
                    if ($lastTraining) {
                        preg_match('/Session (\d+)/', $lastTraining->title, $matches); 
                        if (isset($matches[1])) {
                            $nextSeries = intval($matches[1]) + 1;
                        }
                    }
                    
                    $seriesString = str_pad($nextSeries, 3, '0', STR_PAD_LEFT);
                    $title = "Session {$seriesString}";
                } else if ($request->type === 'match') {
                    $title = "Match VS ...";
                }
            }
        }

        PerformanceLog::updateOrCreate(
            [
                'club_id' => $club->id,
                'date' => $request->date,
            ],
            [
                'type' => $request->type,
                'title' => $title, 
                'tag' => $request->type !== 'off' ? $request->tag : null,
            ]
        );

        $tipe = strtoupper($request->type);
        Activity::log("mengubah status agenda menjadi $tipe", "Sesi $formattedDate", 'update');

        return redirect()->back();
    }

    public function show($id)
    {
        $log = PerformanceLog::with('benchmark')->findOrFail($id);
        $club = Club::first();

        if ($club) {
            $club->logo_url = $club->logo ? asset('storage/' . $club->logo) : null;
        }

        return inertia('PerformanceLogs/Show', [
            'log' => $log,
            'club' => $club, 
            'players' => Player::orderBy('position_number', 'asc')->get(),
            'existing_metrics' => PlayerMetric::where('performance_log_id', $log->id)->get()->keyBy('player_id'),
            'team_benchmarks' => Benchmark::where('target_type', 'team')->get(),
            'player_benchmarks' => Benchmark::where('target_type', 'player')->get()
        ]);
    }

    // =================================================================
    // FUNGSI STORE & UPDATE METRICS YANG SUDAH DIPERBAIKI SINKRONISASINYA
    // =================================================================
    public function storeMetrics(Request $request, PerformanceLog $log)
    {
        $this->processMetrics($request, $log, 'create');
        return redirect()->back()->with('message', 'Data GPS berhasil disimpan dan disinkronkan!');
    }

    public function updateMetrics(Request $request, PerformanceLog $log)
    {
        $this->processMetrics($request, $log, 'update');
        return redirect()->back()->with('message', 'Data berhasil diperbarui dan disinkronkan!');
    }

    /**
     * Helper untuk memproses update/store agar kode tidak berulang (DRY)
     */
    private function processMetrics(Request $request, PerformanceLog $log, $action)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'benchmark_id' => 'required|exists:benchmarks,id',
            'player_benchmark_id' => 'nullable|exists:benchmarks,id',
            'players_data' => 'required|array',
        ]);

        // 1. UPDATE BENCHMARK YANG DIPILIH
        $log->update([
            'title' => $request->title,
            'benchmark_id' => $request->benchmark_id,
            'player_benchmark_id' => $request->player_benchmark_id, // Sekarang pasti tersimpan!
            'custom_charts' => $request->custom_charts,
        ]);

        // 2. SINKRONISASI PEMAIN BENCH VS AKTIF
        $activePlayerIds = collect($request->players_data)->pluck('player_id')->toArray();

        // KUNCI PERBAIKAN: Hapus pemain yang ada di database tapi tidak ada di kiriman (Berarti di-bench)
        PlayerMetric::where('performance_log_id', $log->id)
            ->whereNotIn('player_id', $activePlayerIds)
            ->delete();

        // 3. SIMPAN/UPDATE PEMAIN AKTIF
        foreach ($request->players_data as $index => $playerData) {
            PlayerMetric::updateOrCreate(
                [
                    'performance_log_id' => $log->id,
                    'player_id' => $playerData['player_id']
                ],
                [
                    'metrics' => $playerData['metrics'],
                    'sort_order' => $playerData['sort_order'] ?? $index
                ]
            );
        }

        // 4. REKALKULASI HIGHEST RECORD (Hanya pemain aktif)
        $recordBreakers = $this->recalculateHighestMetrics($activePlayerIds);

        // 5. CATAT AKTIVITAS
        $dateFormatted = Carbon::parse($log->date)->translatedFormat('d M Y');
        $activityDetails = "Sesi: {$log->title} ({$dateFormatted})";
        Activity::log("menyimpan data metrik GPS", $activityDetails, $action);

        if (count($recordBreakers) > 0) {
            $names = implode(', ', array_slice($recordBreakers, 0, 3));
            $more = count($recordBreakers) > 3 ? " dan " . (count($recordBreakers) - 3) . " lainnya" : "";
            Activity::log('mencatat pembaruan rekor GPS', "Pemain: {$names}{$more} pada sesi {$log->title}", 'update');
        }
    }


    // ==========================================
    // FUNGSI REKALKULASI HIGHEST
    // ==========================================
    private function recalculateHighestMetrics(array $playerIds)
    {
        $recordBreakers = [];
        $columnsToCheck = [
            'total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 
            'total_18kmh', 'accels', 'decels', 'hr_band_4_dist', 'hr_band_4_dur', 
            'hr_band_5_dist', 'hr_band_5_dur', 'player_load'
        ];

        foreach (array_unique($playerIds) as $playerId) {
            $player = Player::find($playerId);
            if (!$player) continue;

            $oldHighest = is_array($player->highest_metrics) ? $player->highest_metrics : (json_decode($player->highest_metrics, true) ?? []);
            
            // Ambil semua histori metrik di database
            $allMetrics = PlayerMetric::where('player_id', $playerId)->get();
            
            $newHighest = [];
            foreach ($columnsToCheck as $col) {
                $newHighest[$col] = str_contains($col, '_dur') ? '00.00.00' : 0;
            }
            
            // Pertahankan Max Velocity jika sudah diset manual
            if (isset($oldHighest['max_velocity'])) $newHighest['max_velocity'] = floatval($oldHighest['max_velocity']);
            if (isset($oldHighest['highest_velocity'])) $newHighest['highest_velocity'] = floatval($oldHighest['highest_velocity']);

            foreach ($allMetrics as $record) {
                $sessionData = is_array($record->metrics) ? $record->metrics : (json_decode($record->metrics, true) ?? []);
                
                foreach ($columnsToCheck as $col) {
                    $rawVal = $this->getAutoCalculatedValue($sessionData, $col, $oldHighest);
                    
                    if (str_contains($col, '_dur')) {
                        $secNew = $this->timeToSeconds($rawVal);
                        $secCurrent = $this->timeToSeconds($newHighest[$col]);
                        if ($secNew > $secCurrent) {
                            $newHighest[$col] = $rawVal;
                        }
                    } else {
                        // Memastikan angka yang masuk adalah format numeric
                        $val = ($rawVal !== '-' && is_numeric($rawVal)) ? floatval($rawVal) : 0;
                        if ($val > $newHighest[$col]) {
                            $newHighest[$col] = $val;
                        }
                    }
                }
            }

            // Bersihkan data yang masih 0 agar JSON tidak kotor
            $cleanedHighest = [];
            foreach ($newHighest as $k => $v) {
                if (str_contains($k, '_dur')) {
                    if ($v !== '00.00.00' && $v !== '-' && $v !== null && $v !== '') {
                        $cleanedHighest[$k] = $v;
                    }
                } else {
                    if ($v > 0) {
                        $cleanedHighest[$k] = floatval($v);
                    }
                }
            }

            // Cek jika ada perubahan sebelum update
            $isChanged = false;
            foreach ($columnsToCheck as $col) {
                $oldVal = $oldHighest[$col] ?? (str_contains($col, '_dur') ? '00.00.00' : 0);
                $newVal = $cleanedHighest[$col] ?? (str_contains($col, '_dur') ? '00.00.00' : 0);
                
                if ((string)$newVal !== (string)$oldVal) {
                    $isChanged = true;
                    break;
                }
            }

            if ($isChanged) {
                $player->update(['highest_metrics' => $cleanedHighest]);
                $recordBreakers[] = $player->name;
            }
        }

        return $recordBreakers;
    }


    // ==========================================
    // FUNGSI BANTUAN UNTUK KALKULASI DI BACKEND
    // ==========================================
    private function calculatePercentage($colId, $rawValue, $position, $activeBenchmark, $playerHighest)
    {
        if ($rawValue === null || $rawValue === '-' || $rawValue === '' || !is_numeric($rawValue)) return 0;
        $numValue = floatval($rawValue);

        if ($colId === 'max_velocity' || $colId === 'highest_velocity') {
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

    private function getAutoCalculatedValue($metrics, $colId, $playerHighest)
    {
        if ($colId === 'total_18kmh') {
            $hir = floatval($metrics['hir_18_24_kmh'] ?? $metrics['hir_19_8_kmh'] ?? 0);
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

    private function timeToSeconds($timeStr) {
        if (!$timeStr || !str_contains($timeStr, '.')) return 0;
        $parts = array_map('intval', explode('.', $timeStr));
        if (count($parts) == 3) return $parts[0] * 3600 + $parts[1] * 60 + $parts[2];
        if (count($parts) == 2) return $parts[0] * 60 + $parts[1];
        return 0;
    }

    // ==========================================
    // EXPORT PDF
    // ==========================================
    public function exportPdf(PerformanceLog $log)
    {
        $log->load('benchmark');
        $club = Club::first();
        $benchmark = $log->benchmark ? $log->benchmark->toArray() : null;
        
        $players = Player::all(); 
        $metrics = PlayerMetric::where('performance_log_id', $log->id)->get()->keyBy('player_id');

        $reportData = $players->map(function($player) use ($metrics, $benchmark) {
            $playerMetric = $metrics->get($player->id);
            $rawMetrics = $playerMetric ? $playerMetric->metrics : [];
            $historicalHighest = $player->highest_metrics ?? [];
            
            $player->sort_order = $playerMetric ? $playerMetric->sort_order : null;

            $calculatedData = [];
            $columnsToCalculate = [
                'total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 
                'total_18kmh', 'max_velocity', 'highest_velocity'
            ];

            foreach ($columnsToCalculate as $colId) {
                $val = $this->getAutoCalculatedValue($rawMetrics, $colId, $historicalHighest);
                $calculatedData[$colId] = $val;
                $calculatedData[$colId . '_percent'] = $this->calculatePercentage($colId, $val, $player->position, $benchmark, $historicalHighest);
            }

            $player->session_metrics = array_merge($rawMetrics, $calculatedData);
            return $player;
        });

        $reportData = $reportData->sort(function ($a, $b) {
            if ($a->sort_order !== null && $b->sort_order !== null) {
                return $a->sort_order <=> $b->sort_order;
            }

            $positionOrder = ['CB' => 1, 'FB' => 2, 'MF' => 3, 'WF' => 4, 'FW' => 5];
            $posA = $positionOrder[strtoupper($a->position)] ?? 99;
            $posB = $positionOrder[strtoupper($b->position)] ?? 99;

            if ($posA !== $posB) {
                return $posA <=> $posB;
            }

            return strcmp($a->name, $b->name);
        })->values(); 

        $teamAverage = [];
        $columnsToAverage = [
            'total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 'total_18kmh', 'max_velocity'
        ];
        
        foreach ($columnsToAverage as $col) {
            $sum = 0; $count = 0;
            foreach ($reportData as $p) {
                if (isset($p->session_metrics[$col]) && is_numeric($p->session_metrics[$col])) {
                    $sum += floatval($p->session_metrics[$col]);
                    $count++;
                }
            }
            $avgVal = $count > 0 ? ($sum / $count) : 0;
            $teamAverage[$col] = number_format($avgVal, 1, '.', '');
            $teamAverage[$col . '_percent'] = $this->calculatePercentage($col, $teamAverage[$col], null, $benchmark, []);
        }

        Activity::log('mengunduh laporan PDF', $log->title, 'export');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.performance_report', [
            'log' => $log,
            'club' => $club,
            'players' => $reportData,
            'teamAverage' => $teamAverage
        ])->setPaper('a3', 'landscape');

        return $pdf->download("Daily_Training_Report_{$log->date}.pdf");
    }

    // ==========================================
    // EXPORT EXCEL
    // ==========================================
    public function exportExcel(PerformanceLog $log)
    {
        $log->load('benchmark');
        $club = Club::first();
        $benchmark = $log->benchmark ? $log->benchmark->toArray() : null;
        
        $players = Player::all(); 
        $metrics = PlayerMetric::where('performance_log_id', $log->id)->get()->keyBy('player_id');

        $reportData = $players->map(function($player) use ($metrics, $benchmark) {
            $playerMetric = $metrics->get($player->id);
            $rawMetrics = $playerMetric ? $playerMetric->metrics : [];
            $historicalHighest = $player->highest_metrics ?? [];
            
            $player->sort_order = $playerMetric ? $playerMetric->sort_order : null;

            $calculatedData = [];
            $columnsToCalculate = [
                'total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 
                'total_18kmh', 'max_velocity', 'highest_velocity'
            ];

            foreach ($columnsToCalculate as $colId) {
                $val = $this->getAutoCalculatedValue($rawMetrics, $colId, $historicalHighest);
                $calculatedData[$colId] = $val;
                $calculatedData[$colId . '_percent'] = $this->calculatePercentage($colId, $val, $player->position, $benchmark, $historicalHighest);
            }

            $player->session_metrics = array_merge($rawMetrics, $calculatedData);
            return $player;
        });

        $reportData = $reportData->sort(function ($a, $b) {
            if ($a->sort_order !== null && $b->sort_order !== null) {
                return $a->sort_order <=> $b->sort_order;
            }

            $positionOrder = ['CB' => 1, 'FB' => 2, 'MF' => 3, 'WF' => 4, 'FW' => 5];
            $posA = $positionOrder[strtoupper($a->position)] ?? 99;
            $posB = $positionOrder[strtoupper($b->position)] ?? 99;

            if ($posA !== $posB) {
                return $posA <=> $posB;
            }

            return strcmp($a->name, $b->name);
        })->values(); 

        $teamAverage = [];
        $columnsToAverage = [
            'total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 'total_18kmh', 'max_velocity'
        ];
        
        foreach ($columnsToAverage as $col) {
            $sum = 0; $count = 0;
            foreach ($reportData as $p) {
                if (isset($p->session_metrics[$col]) && is_numeric($p->session_metrics[$col])) {
                    $sum += floatval($p->session_metrics[$col]);
                    $count++;
                }
            }
            $avgVal = $count > 0 ? ($sum / $count) : 0;
            $teamAverage[$col] = number_format($avgVal, 1, '.', '');
            $teamAverage[$col . '_percent'] = $this->calculatePercentage($col, $teamAverage[$col], null, $benchmark, []);
        }

        Activity::log('mengunduh laporan Excel', $log->title, 'export');

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\PerformanceLogExport($log, $club, $reportData, $teamAverage), 
            "Report_{$log->date}.xlsx"
        );
    }
}