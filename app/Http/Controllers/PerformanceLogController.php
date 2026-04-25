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
        // Buat period dari start ke end
        $period = CarbonPeriod::create($start, $end);
        
        // Ubah period ke array lalu balik urutannya (Terbaru ke Terlama)
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
        ]);

        $club = Club::firstOrFail();
        $dateObj = Carbon::parse($request->date);
        $formattedDate = $dateObj->translatedFormat('d M Y');

        // Cari apakah log untuk tanggal ini sudah ada
        $existingLog = PerformanceLog::where('club_id', $club->id)->where('date', $request->date)->first();
        $title = null;

        if ($request->type !== 'off') {
            // Jika log sudah ada dan punya judul, pertahankan judul lamanya
            if ($existingLog && $existingLog->title) {
                $title = $existingLog->title;
            } else {
                // AUTO GENERATE TITLE
                if ($request->type === 'training') {
                    // 1. Cari nomor seri latihan terakhir di database klub ini
                    $lastTraining = PerformanceLog::where('club_id', $club->id)
                        ->where('type', 'training')
                        ->whereNotNull('title')
                        ->where('title', 'like', 'Training %') // Pastikan judulnya memang hasil auto-generate/berawalan Training
                        ->orderBy('date', 'desc')
                        ->first();

                    $nextSeries = 1;

                    if ($lastTraining) {
                        // Ekstrak angka "001" dari "Training 001 - 26 Mei 2026"
                        preg_match('/Training (\d+) -/', $lastTraining->title, $matches);
                        if (isset($matches[1])) {
                            $nextSeries = intval($matches[1]) + 1;
                        }
                    }

                    // Format jadi 3 digit (001, 002, 010, dst)
                    $seriesString = str_pad($nextSeries, 3, '0', STR_PAD_LEFT);
                    $title = "Training {$seriesString} - {$formattedDate}";

                } else if ($request->type === 'match') {
                    $title = "Match VS ... - {$formattedDate}";
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
                'title' => $title, // Simpan judul (atau null jika off)
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
        $club = Club::first(); // AMBIL DATA KLUB DI SINI

        // Pastikan url logo bisa dibaca
        if ($club) {
            $club->logo_url = $club->logo ? asset('storage/' . $club->logo) : null;
        }

        return inertia('PerformanceLogs/Show', [
            'log' => $log,
            'club' => $club, // LEMPAR KE REACT DI SINI
            'players' => Player::orderBy('position_number', 'asc')->get(),
            'existing_metrics' => PlayerMetric::where('performance_log_id', $log->id)->get()->keyBy('player_id'),
            'benchmarks' => Benchmark::all()
        ]);
    }

    /**
     * 5. Menyimpan Data Metrik GPS dari Hasil Paste Excel
     */
    /**
     * Menyimpan Data Metrik GPS (Bisa Insert & Update)
     */
    public function storeMetrics(Request $request, PerformanceLog $log)
    {
        // 1. Validasi request
        $request->validate([
            'data.title' => 'required|string|max:255',
            'data.benchmark_id' => 'required|exists:benchmarks,id',
            'data.players_data' => 'required|array',
        ]);

        // 2. Update metadata log
        $log->update([
            'title' => $request->data['title'],
            'benchmark_id' => $request->data['benchmark_id'],
        ]);

        foreach ($request->data['players_data'] as $playerData) {
            
            // 3. GUNAKAN updateOrCreate AGAR BISA EDIT DATA!
            // Jika data belum ada = Insert. Jika sudah ada = Update metriknya.
            PlayerMetric::updateOrCreate(
                [
                    'performance_log_id' => $log->id,
                    'player_id' => $playerData['player_id']
                ],
                [
                    'metrics' => $playerData['metrics']
                ]
            );

            // 4. Logika Update Rekor (Highest Metrics)
            // Selalu dicek setiap kali simpan/edit
            $player = Player::find($playerData['player_id']);
            if ($player) {
                $highest = $player->highest_metrics ?? [];
                $incomingMetrics = $playerData['metrics'];
                $isRecordBroken = false;

                foreach ($incomingMetrics as $key => $value) {
                    if ($value === '' || $value === null) continue;
                    $numVal = floatval($value);
                    
                    // Pastikan key yang disimpan sesuai, dan bandingkan dengan teliti
                    if (!isset($highest[$key]) || $numVal > floatval($highest[$key])) {
                        $highest[$key] = $numVal;
                        $isRecordBroken = true;
                    }
                }

                if ($isRecordBroken) {
                    // Menggunakan update agar perubahan JSON tersimpan
                    $player->update(['highest_metrics' => $highest]); 
                }
            }
        }

        return redirect()->back()->with('message', 'Data GPS berhasil disimpan dan diperbarui!');
    }

    public function updateMetrics(Request $request, PerformanceLog $log)
    {
        // Validasi data
        $request->validate([
            'title' => 'required|string|max:255',
            'benchmark_id' => 'required|exists:benchmarks,id',
            'players_data' => 'required|array',
        ]);

        // 1. Update metadata log
        $log->update([
            'title' => $request->title,
            'benchmark_id' => $request->benchmark_id,
        ]);

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

            // 3. Update Rekor Tertinggi (Highest) di Tabel Player
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
                }
            }
        }

        return redirect()->back()->with('message', 'Data berhasil diperbarui!');
    }

    // ==========================================
    // FUNGSI BANTUAN UNTUK KALKULASI DI BACKEND
    // ==========================================
    private function calculatePercentage($colId, $rawValue, $position, $activeBenchmark, $playerHighest)
    {
        if ($rawValue === null || $rawValue === '' || !is_numeric($rawValue)) return 0;
        $numValue = floatval($rawValue);

        // KHUSUS MAX VELOCITY
        if ($colId === 'max_velocity') {
            $targetHighest = floatval($playerHighest['highest_velocity'] ?? $playerHighest['max_velocity'] ?? 0);
            
            if ($targetHighest == 0) {
                 if ($position && isset($activeBenchmark['metrics'][$colId][$position])) {
                     $targetHighest = $activeBenchmark['metrics'][$colId][$position];
                 } elseif (isset($activeBenchmark['metrics'][$colId])) {
                     if (is_numeric($activeBenchmark['metrics'][$colId])) {
                         $targetHighest = $activeBenchmark['metrics'][$colId];
                     } else {
                         $vals = array_values($activeBenchmark['metrics'][$colId]);
                         $targetHighest = count($vals) > 0 ? array_sum($vals) / count($vals) : 100;
                     }
                 } else { 
                     $targetHighest = 100; 
                 }
            }
            return number_format(($numValue / max($targetHighest, 0.01)) * 100, 1, '.', '');
        }
        
        // METRIK LAINNYA
        $targetValue = 100;
        if (isset($activeBenchmark['metrics'][$colId])) {
             if ($position && isset($activeBenchmark['metrics'][$colId][$position])) {
                 $targetValue = $activeBenchmark['metrics'][$colId][$position]; 
             } elseif (is_numeric($activeBenchmark['metrics'][$colId])) {
                 $targetValue = $activeBenchmark['metrics'][$colId]; 
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
    // ==========================================
    // EXPORT PDF
    // ==========================================
    public function exportPdf(PerformanceLog $log)
    {
        $log->load('benchmark');
        $club = Club::first();
        $benchmark = $log->benchmark ? $log->benchmark->toArray() : null;
        
        $players = Player::all(); // Ambil semua pemain tanpa diurutkan dulu
        $metrics = PlayerMetric::where('performance_log_id', $log->id)->get()->keyBy('player_id');

        $reportData = $players->map(function($player) use ($metrics, $benchmark) {
            $playerMetric = $metrics->get($player->id);
            $rawMetrics = $playerMetric ? $playerMetric->metrics : [];
            $historicalHighest = $player->highest_metrics ?? [];
            
            // Simpan sort_order untuk dipakai saat sorting koleksi
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

        // SORTING DATA BERDASARKAN ATURAN YANG SAMA DENGAN FRONTEND
        $reportData = $reportData->sort(function ($a, $b) {
            // 1. Jika keduanya punya sort_order, urutkan berdasarkan sort_order (drag-and-drop)
            if ($a->sort_order !== null && $b->sort_order !== null) {
                return $a->sort_order <=> $b->sort_order;
            }

            // 2. Default urutan posisi (CB -> FB -> MF -> WF -> FW)
            $positionOrder = ['CB' => 1, 'FB' => 2, 'MF' => 3, 'WF' => 4, 'FW' => 5];
            $posA = $positionOrder[strtoupper($a->position)] ?? 99;
            $posB = $positionOrder[strtoupper($b->position)] ?? 99;

            if ($posA !== $posB) {
                return $posA <=> $posB;
            }

            // 3. Jika posisi sama, urutkan berdasarkan nama (abjad)
            return strcmp($a->name, $b->name);
        })->values(); // Reset ulang key array setelah sorting

        // Hitung Rata-Rata Tim
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
        
        $players = Player::all(); // Ambil semua pemain tanpa diurutkan dulu
        $metrics = PlayerMetric::where('performance_log_id', $log->id)->get()->keyBy('player_id');

        $reportData = $players->map(function($player) use ($metrics, $benchmark) {
            $playerMetric = $metrics->get($player->id);
            $rawMetrics = $playerMetric ? $playerMetric->metrics : [];
            $historicalHighest = $player->highest_metrics ?? [];
            
            // Simpan sort_order
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

        // SORTING DATA BERDASARKAN ATURAN YANG SAMA DENGAN FRONTEND
        $reportData = $reportData->sort(function ($a, $b) {
            // 1. Jika keduanya punya sort_order
            if ($a->sort_order !== null && $b->sort_order !== null) {
                return $a->sort_order <=> $b->sort_order;
            }

            // 2. Default urutan posisi
            $positionOrder = ['CB' => 1, 'FB' => 2, 'MF' => 3, 'WF' => 4, 'FW' => 5];
            $posA = $positionOrder[strtoupper($a->position)] ?? 99;
            $posB = $positionOrder[strtoupper($b->position)] ?? 99;

            if ($posA !== $posB) {
                return $posA <=> $posB;
            }

            // 3. Jika posisi sama, urut berdasarkan abjad
            return strcmp($a->name, $b->name);
        })->values(); // Reset ulang key array setelah sorting

        // Hitung Rata-Rata Tim
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

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\PerformanceLogExport($log, $club, $reportData, $teamAverage), 
            "Report_{$log->date}.xlsx"
        );
    }
}