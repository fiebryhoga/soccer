<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Player;
use App\Models\AssessmentCategory;
use App\Models\PlayerAssessment;
use App\Models\AssessmentTestItem;
use Inertia\Inertia;

class PlayerAssessmentController extends Controller
{
    // Tampilkan Halaman Input
    public function index(Player $player)
    {
        $categories = AssessmentCategory::with('testItems')->get();
        $history = PlayerAssessment::where('player_id', $player->id)->get();

        return Inertia::render('Player/AssessmentInput', [
            'player' => $player,
            'categories' => $categories,
            'history' => $history
        ]);
    }

    // Simpan Hasil Tes (Kalkulasi Persentase Otomatis)
    public function store(Request $request, Player $player)
    {
        $request->validate([
            'results' => 'required|array',
        ]);

        // Ambil semua detail item tes untuk kalkulasi
        $testItems = AssessmentTestItem::whereIn('id', array_keys($request->results))->get()->keyBy('id');

        foreach ($request->results as $itemId => $value) {
            if (is_null($value) || $value === '') continue;

            $item = $testItems->get($itemId);
            if (!$item) continue;

            // --- RUMUS PENGHITUNGAN PERSENTASE ---
            $percentage = 0;
            if ($item->target_benchmark > 0) {
                if ($item->is_lower_better) {
                    // Makin kecil makin bagus (Waktu): (Target / Hasil) * 100
                    $percentage = ($item->target_benchmark / $value) * 100;
                } else {
                    // Makin besar makin bagus (Beban/Rep): (Hasil / Target) * 100
                    $percentage = ($value / $item->target_benchmark) * 100;
                }
            }

            // Simpan ke database
            PlayerAssessment::updateOrCreate(
                [
                    'player_id' => $player->id,
                    'assessment_test_item_id' => $itemId,
                ],
                [
                    'result_value' => $value,
                    'percentage' => round($percentage, 2),
                    'weight_snapshot' => $player->weight,
                    'age_snapshot' => $player->age,
                ]
            );
        }

        return back()->with('message', 'Assessment fisik berhasil disimpan & dihitung!');
    }
}