<?php

namespace App\Http\Controllers;

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

        // Jika klub benar-benar belum ada di DB, buatkan satu dummy
        if (!$club) {
            $club = Club::create(['name' => 'Klub Saya']);
        }

        // Jika tanggal mulai belum diset, lempar ke halaman setup
        if (!$club->season_start_date) {
            return inertia('PerformanceLogs/Index', [
                'calendar' => [],
                'season_start_date' => null
            ]);
        }

        $start = Carbon::parse($club->season_start_date);
        $end = now()->addDays(14); // 14 Hari ke depan
        
        $logs = PerformanceLog::where('club_id', $club->id)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()->keyBy('date');

        $calendar = [];
        foreach (CarbonPeriod::create($start, $end) as $date) {
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

        PerformanceLog::updateOrCreate(
            [
                'club_id' => $club->id,
                'date' => $request->date,
            ],
            [
                'type' => $request->type,
                'title' => $request->type === 'off' ? null : PerformanceLog::where('club_id', $club->id)->where('date', $request->date)->value('title'),
            ]
        );

        $formattedDate = Carbon::parse($request->date)->translatedFormat('d M Y');
        $tipe = strtoupper($request->type);
        Activity::log("mengubah status agenda menjadi $tipe", "Sesi $formattedDate", 'update');

        return redirect()->back();
    }

    /**
     * 4. Menampilkan Halaman Tabel (Tempat Paste Excel)
     */
    public function show($id)
    {
        // Cari data log berdasarkan ID, ambil sekalian data benchmarknya (jika ada)
        $log = PerformanceLog::with('benchmark')->findOrFail($id);

        return inertia('PerformanceLogs/Show', [
            'log' => $log,
            'players' => Player::orderBy('position_number', 'asc')->get(),
            'existing_metrics' => PlayerMetric::where('performance_log_id', $log->id)->get()->keyBy('player_id'),
            'benchmarks' => Benchmark::all()
        ]);
    }

    /**
     * 5. Menyimpan Data Metrik GPS dari Hasil Paste Excel
     */
    public function storeMetrics(Request $request, $id)
    {
        $log = PerformanceLog::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'benchmark_id' => 'nullable|exists:benchmarks,id',
            'players_data' => 'nullable|array'
        ]);

        // Update Judul Sesi & Benchmark yang digunakan
        $log->update([
            'title' => $request->title,
            'benchmark_id' => $request->benchmark_id
        ]);

        // Simpan setiap baris data pemain dari Excel ke tabel player_metrics
        if ($request->has('players_data') && is_array($request->players_data)) {
            foreach ($request->players_data as $data) {
                PlayerMetric::updateOrCreate(
                    [
                        'performance_log_id' => $log->id, 
                        'player_id' => $data['player_id']
                    ],
                    [
                        'metrics' => $data['metrics']
                    ]
                );
            }
        }

        $formattedDate = Carbon::parse($log->date)->translatedFormat('d M Y');
        Activity::log('mengisi data metrik GPS', $request->title . " ($formattedDate)", 'update');

        return redirect()->route('performance-logs.index')->with('message', 'Data Sesi & GPS berhasil disimpan!');
    }
}