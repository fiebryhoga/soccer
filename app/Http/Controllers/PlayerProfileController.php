<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Club;
use Inertia\Inertia;

class PlayerProfileController extends Controller
{
    // Halaman Utama Profiling
    public function index()
    {
        $club = Club::first();
        $players = Player::orderBy('position_number', 'asc')->get();

        if ($players) {
            $players->transform(function ($player) {
                $player->photo_url = $player->profile_photo ? asset('storage/' . $player->profile_photo) : null;
                return $player;
            });
        }

        return Inertia::render('Profiling/Index', [
            'club' => $club,
            'players' => $players
        ]);
    }

    // Halaman Dashboard Spesifik Pemain
    public function show(Player $player)
    {
        // Pastikan foto URL ter-generate
        $player->photo_url = $player->profile_photo ? asset('storage/' . $player->profile_photo) : null;

        // Decode JSON highest_metrics dengan aman
        $highestMetrics = is_string($player->highest_metrics) ? json_decode($player->highest_metrics, true) : $player->highest_metrics;
        $player->highest_metrics_data = $highestMetrics ?? [];

        // Data Asesmen Fisik (Tetap dikirim untuk dipakai nanti)
        $categories = \App\Models\AssessmentCategory::with('testItems')->get();
        $assessments = \App\Models\PlayerAssessment::where('player_id', $player->id)->get();

        return Inertia::render('Profiling/Show', [
            'player' => $player,
            'categories' => $categories,
            'assessments' => $assessments
        ]);
    }
}