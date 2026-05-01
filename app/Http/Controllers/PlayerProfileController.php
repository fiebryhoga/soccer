<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Club;
use Inertia\Inertia;

class PlayerProfileController extends Controller
{
    // Halaman Utama Profiling (Menampilkan daftar pemain untuk dipilih)
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

    public function show(Player $player)
    {
        $categories = \App\Models\AssessmentCategory::with('testItems')->get();
        $assessments = \App\Models\PlayerAssessment::where('player_id', $player->id)->get();

        return Inertia::render('Profiling/Show', [
            'player' => $player,
            'categories' => $categories,
            'assessments' => $assessments
        ]);
    }

    // Nanti kita buat fungsi show() di sini untuk halaman detail/dashboard pemain
}