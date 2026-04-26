<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\PerformanceLogExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Constants\MetricsConstant;
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
    /**
     * 1. Menampilkan Kalender 14 Hari
     */
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
        $end = now()->addDays(14); // Window 14 hari ke depan
        
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

    /**
     * 2. Menyimpan Setup Tanggal Mulai Musim
     */
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

    /**
     * 3. Menyimpan Tipe Agenda (Dropdown di Kalender)
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:off,training,match',
            'tag' => 'nullable|string|max:20', // <--- TAMBAH VALIDASI TAG
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
                    // 1. Cari berdasarkan kata "Session %" BUKAN "Training %"
                    $lastTraining = PerformanceLog::where('club_id', $club->id)
                        ->where('type', 'training')
                        ->whereNotNull('title')
                        ->where('title', 'like', 'Session %') // <--- UBAH DI SINI
                        ->orderBy('created_at', 'desc') // Gunakan created_at agar selalu dapat yang terbaru dibuat
                        ->first();

                    $nextSeries = 1;
                    if ($lastTraining) {
                        // 2. Ambil angka setelah kata "Session "
                        preg_match('/Session (\d+)/', $lastTraining->title, $matches); // <--- UBAH DI SINI
                        if (isset($matches[1])) {
                            $nextSeries = intval($matches[1]) + 1;
                        }
                    }
                    
                    // 3. Format jadi 3 digit (001, 002, 003, dst)
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

    /**
     * 4. Menampilkan Halaman Tabel (Tempat Paste Excel)
     */
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
            'benchmarks' => Benchmark::all()
        ]);
    }

    /**
     * 5. Menyimpan Data Metrik GPS (Bisa Insert & Update)
     */
    public function storeMetrics(Request $request, PerformanceLog $log)
    {
        $request->validate([
            'data.title' => 'required|string|max:255',
            'data.benchmark_id' => 'required|exists:benchmarks,id',
            'data.players_data' => 'required|array',
        ]);

        $log->update([
            'title' => $request->data['title'],
            'benchmark_id' => $request->data['benchmark_id'],
        ]);

        $recordBreakers = [];

        foreach ($request->data['players_data'] as $playerData) {
            
            PlayerMetric::updateOrCreate(
                [
                    'performance_log_id' => $log->id,
                    'player_id' => $playerData['player_id']
                ],
                [
                    'metrics' => $playerData['metrics']
                ]
            );

            // Logika Update Rekor
            $player = Player::find($playerData['player_id']);
            if ($player) {
                $highest = $player->highest_metrics ?? [];
                $incomingMetrics = $playerData['metrics'];
                $isRecordBroken = false;

                foreach ($incomingMetrics as $key => $value) {
                    if ($value === '' || $value === null) continue;
                    $numVal = floatval($value);
                    
                    if (!isset($highest[$key]) || $numVal > floatval($highest[$key])) {
                        $highest[$key] = $numVal;
                        $isRecordBroken = true;
                    }
                }

                if ($isRecordBroken) {
                    $player->update(['highest_metrics' => $highest]); 
                    $recordBreakers[] = $player->name; // Simpan nama pemain yang memecahkan rekor
                }
            }
        }

        // --- PENCATATAN AKTIVITAS ---
        $dateFormatted = Carbon::parse($log->date)->translatedFormat('d M Y');
        $activityDetails = "Sesi: {$log->title} ({$dateFormatted})";
        Activity::log('memasukkan data metrik GPS baru', $activityDetails, 'create');

        if (count($recordBreakers) > 0) {
            $names = implode(', ', array_slice($recordBreakers, 0, 3));
            $more = count($recordBreakers) > 3 ? " dan " . (count($recordBreakers) - 3) . " lainnya" : "";
            Activity::log('mencatat pemecahan rekor GPS baru', "Pemain: {$names}{$more} pada sesi {$log->title}", 'update');
        }

        return redirect()->back()->with('message', 'Data GPS berhasil disimpan dan diperbarui!');
    }

    /**
     * Memperbarui Data Metrik GPS (Bulk Update / Sort)
     */
    public function updateMetrics(Request $request, PerformanceLog $log)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'benchmark_id' => 'required|exists:benchmarks,id',
            'players_data' => 'required|array',
        ]);

        $log->update([
            'title' => $request->title,
            'benchmark_id' => $request->benchmark_id,
        ]);

        $recordBreakers = [];

        foreach ($request->players_data as $index => $playerData) {
            
            PlayerMetric::updateOrCreate(
                [
                    'performance_log_id' => $log->id,
                    'player_id' => $playerData['player_id']
                ],
                [
                    'metrics' => $playerData['metrics'],
                    'sort_order' => $index
                ]
            );

            // Update Rekor Tertinggi
            $player = Player::find($playerData['player_id']);
            if ($player) {
                $highest = $player->highest_metrics ?? [];
                $incomingMetrics = $playerData['metrics'];
                $isRecordBroken = false;

                foreach ($incomingMetrics as $key => $value) {
                    if ($value === '' || $value === null) continue;
                    $numVal = floatval($value);
                    
                    if (!isset($highest[$key]) || $numVal > floatval($highest[$key])) {
                        $highest[$key] = $numVal;
                        $isRecordBroken = true;
                    }
                }

                if ($isRecordBroken) {
                    $player->update(['highest_metrics' => $highest]);
                    $recordBreakers[] = $player->name;
                }
            }
        }

        // --- PENCATATAN AKTIVITAS ---
        $dateFormatted = Carbon::parse($log->date)->translatedFormat('d M Y');
        $activityDetails = "Sesi: {$log->title} ({$dateFormatted})";
        Activity::log('memperbarui data metrik GPS', $activityDetails, 'update');

        if (count($recordBreakers) > 0) {
            $names = implode(', ', array_slice($recordBreakers, 0, 3));
            $more = count($recordBreakers) > 3 ? " dan " . (count($recordBreakers) - 3) . " lainnya" : "";
            Activity::log('mencatat pemecahan rekor GPS', "Pemain: {$names}{$more} pada sesi {$log->title}", 'update');
        }

        return redirect()->back()->with('message', 'Data berhasil diperbarui!');
    }

    // ==========================================
    // FUNGSI BANTUAN UNTUK KALKULASI DI BACKEND
    // ==========================================
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
        
        // LANGSUNG COCOKKAN KARENA ID BENCHMARK SUDAH IDENTIK DENGAN ID METRIK
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
        if ($colId === 'hir_19_8_kmh') {
            $hir18 = floatval($metrics['hir_18_kmh'] ?? 0);
            $hsr21 = floatval($metrics['hsr_21_kmh'] ?? 0);
            return number_format($hir18 + $hsr21, 1, '.', '');
        } 
        if ($colId === 'total_18kmh') {
            $sprint = floatval($metrics['sprint_distance'] ?? 0);
            $hir19 = floatval($this->getAutoCalculatedValue($metrics, 'hir_19_8_kmh', $playerHighest));
            return number_format($sprint + $hir19, 1, '.', '');
        }
        if ($colId === 'highest_velocity') {
            $currentMax = floatval($metrics['max_velocity'] ?? 0);
            $historicalMax = floatval($playerHighest['highest_velocity'] ?? $playerHighest['max_velocity'] ?? 0);
            return number_format(max($currentMax, $historicalMax), 2, '.', '');
        }
        return $metrics[$colId] ?? '-';
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
                'total_distance', 'dist_per_min', 'hir_18_kmh', 'hir_19_8_kmh', 
                'hsr_21_kmh', 'sprint_distance', 'total_18kmh', 'max_velocity', 'highest_velocity'
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
            'total_distance', 'dist_per_min', 'hir_18_kmh', 'hir_19_8_kmh', 
            'hsr_21_kmh', 'sprint_distance', 'total_18kmh', 'max_velocity'
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

        // --- PENCATATAN AKTIVITAS EXPORT ---
        Activity::log('mengunduh laporan PDF', $log->title, 'export');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.performance_report', [
            'log' => $log,
            'club' => $club,
            'players' => $reportData,
            'teamAverage' => $teamAverage
        ])->setPaper('a3', 'landscape');

        return $pdf->download("Daily_Training_Report_MD_{$log->date}.pdf");
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
                'total_distance', 'dist_per_min', 'hir_18_kmh', 'hir_19_8_kmh', 
                'hsr_21_kmh', 'sprint_distance', 'total_18kmh', 'max_velocity', 'highest_velocity'
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
            'total_distance', 'dist_per_min', 'hir_18_kmh', 'hir_19_8_kmh', 
            'hsr_21_kmh', 'sprint_distance', 'total_18kmh', 'max_velocity'
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

        // --- PENCATATAN AKTIVITAS EXPORT ---
        Activity::log('mengunduh laporan Excel', $log->title, 'export');

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\PerformanceLogExport($log, $club, $reportData, $teamAverage), 
            "Report_{$log->date}.xlsx"
        );
    }
}