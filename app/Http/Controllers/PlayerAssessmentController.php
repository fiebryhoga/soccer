<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Player;
use App\Models\AssessmentCategory;
use App\Models\PlayerAssessment;
use Inertia\Inertia;

class PlayerAssessmentController extends Controller
{

    // Menampilkan daftar semua pemain untuk dipilih pelatih
    public function index()
    {
        // Ambil data pemain (disesuaikan dengan field yang ada di tabel Anda)
        $players = Player::orderBy('position_number')->get(['id', 'name', 'position_number']);
        
        return Inertia::render('Player/PhysicalIndex', [
            'players' => $players
        ]);
    }
    
    // Menampilkan Halaman Profil Fisik Pemain
    public function show($playerId)
    {
        $player = Player::findOrFail($playerId);
        
        // Ambil semua kategori tes beserta item metriknya
        $categories = AssessmentCategory::with('metrics')->get();
        
        // Ambil riwayat hasil tes pemain ini
        $assessments = PlayerAssessment::where('player_id', $playerId)->get();

        return Inertia::render('Player/PhysicalProfile', [
            'player' => $player,
            'categories' => $categories,
            'assessments' => $assessments
        ]);
    }

    // Menyimpan dan Menghitung Otomatis Hasil Tes
    public function store(Request $request, $playerId)
    {
        $request->validate([
            'date' => 'required|date',
            'results' => 'required|array', // Berisi array: metric_id => result_value
        ]);

        $date = $request->date;

        foreach ($request->results as $metricId => $resultValue) {
            if (is_null($resultValue)) continue;

            $metric = \App\Models\AssessmentMetric::find($metricId);
            if (!$metric) continue;

            // --- LOGIKA PERHITUNGAN PERSENTASE ---
            $target = $metric->target_value;
            $percentage = 0;

            if ($metric->is_lower_better) {
                // Untuk Sprint/Waktu: (Target / Hasil) * 100
                $percentage = ($target / $resultValue) * 100;
            } else {
                // Untuk Beban/Jarak: (Hasil / Target) * 100
                $percentage = ($resultValue / $target) * 100;
            }

            // Batasi persentase maksimal 100% agar grafik tidak bocor
            if ($percentage > 100) $percentage = 100;

            // Simpan atau Update Data ke Database
            PlayerAssessment::updateOrCreate(
                [
                    'player_id' => $playerId,
                    'metric_id' => $metricId,
                    'date' => $date
                ],
                [
                    'result_value' => $resultValue,
                    'percentage' => round($percentage, 2)
                ]
            );
        }

        return back()->with('success', 'Hasil Physical Assessment berhasil disimpan & dikalkulasi!');
    }
}