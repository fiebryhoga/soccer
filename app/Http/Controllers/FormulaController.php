<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Player;
use App\Models\PlayerFitnessTest;
use Inertia\Inertia;

class FormulaController extends Controller
{
    public function strength()
    {
        // Kirim data pemain untuk dropdown form simpan
        $players = Player::orderBy('position_number')->get(['id', 'name', 'position_number']);
        return Inertia::render('Formula/StrengthRatio', ['players' => $players]);
    }

    public function endurance()
    {
        // Kirim data pemain untuk dropdown form simpan
        $players = Player::orderBy('position_number')->get(['id', 'name', 'position_number']);
        return Inertia::render('Formula/EnduranceVolume', ['players' => $players]);
    }

    public function saveTest(Request $request)
    {
        $request->validate([
            'player_id' => 'required|exists:players,id',
            'date' => 'required|date',
            'category' => 'required|string',
            'test_name' => 'required|string',
            'results' => 'required|array'
        ]);

        PlayerFitnessTest::create($request->all());

        return back()->with('success', 'Data tes fisik berhasil disimpan ke database!');
    }
}