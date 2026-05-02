<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\CompositionTest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CompositionTestController extends Controller
{
    private $defaultBenchmarks = [
        "bmi" => ["underweight" => 18.5, "normal" => 23.0, "overweight" => 25.0, "obesity1" => 30.0],
        "bodyfat_male" => ["essential" => 5, "athlete" => 13, "fitness" => 17, "acceptable" => 24],
        "bodyfat_female" => ["essential" => 5, "athlete" => 20, "fitness" => 24, "acceptable" => 31],
        "muscle_male_18_40" => ["low" => 33.4, "normal" => 39.4, "high" => 44.1],
        "muscle_male_41_60" => ["low" => 33.2, "normal" => 39.2, "high" => 43.9],
        "muscle_male_61_80" => ["low" => 33.0, "normal" => 38.7, "high" => 43.4],
        "muscle_female_18_40" => ["low" => 24.4, "normal" => 30.2, "high" => 35.2],
        "muscle_female_41_60" => ["low" => 24.2, "normal" => 30.3, "high" => 35.3],
        "muscle_female_61_80" => ["low" => 24.0, "normal" => 29.8, "high" => 34.8],
        "bone_male" => ["lt_60" => 2.5, "60_75" => 2.9, "gt_75" => 3.2],
        "bone_female" => ["lt_45" => 1.8, "45_60" => 2.2, "gt_60" => 2.5],
        "visceral_fat" => ["standard" => 9, "high" => 14],
        "tbw_male" => ["min" => 50, "max" => 65],
        "tbw_female" => ["min" => 45, "max" => 60]
    ];

    public function index(Request $request)
    {
        // OPTIMASI: Tarik semua pemain dalam satu query
        $players = Player::orderBy('position_number', 'asc')->get();
        
        // OPTIMASI: Tarik data relasi sekaligus untuk menghindari masalah N+1 Query
        $playerIds = $players->pluck('id');
        $allTests = CompositionTest::whereIn('player_id', $playerIds)->orderBy('date', 'desc')->get();

        $players->map(function($player) use ($allTests) {
            $playerTests = $allTests->where('player_id', $player->id);
            $player->total_tests = $playerTests->count();
            $player->latest_test = $playerTests->first();
            $player->photo_url = $player->profile_photo ? asset('storage/' . $player->profile_photo) : null;
            return $player;
        });

        $setting = Setting::where('key', 'composition_benchmarks')->first();
        $benchmarks = $setting ? json_decode($setting->value, true) : $this->defaultBenchmarks;

        return Inertia::render('BodyComposition/Index', [
            'players' => $players,
            'benchmarks' => $benchmarks
        ]);
    }

    public function saveBenchmarks(Request $request)
    {
        // AUTHORIZATION: Blokir modifikasi jika bukan admin
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Anda tidak memiliki izin untuk melakukan modifikasi ini.');
        }

        $request->validate(['benchmarks' => 'required|array']);

        Setting::updateOrCreate(
            ['key' => 'composition_benchmarks'],
            ['value' => json_encode($request->benchmarks), 'type' => 'json']
        );

        return redirect()->back()->with('message', 'Standar Benchmark berhasil diperbarui!');
    }

    public function show(Player $player)
    {
        $player->photo_url = $player->profile_photo ? asset('storage/' . $player->profile_photo) : null;
        
        $history = CompositionTest::where('player_id', $player->id)
            ->orderBy('date', 'desc')
            ->get();

        $setting = Setting::where('key', 'composition_benchmarks')->first();
        $benchmarks = $setting ? json_decode($setting->value, true) : $this->defaultBenchmarks;

        return Inertia::render('BodyComposition/Show', [
            'player' => $player,
            'history' => $history,
            'benchmarks' => $benchmarks
        ]);
    }

    public function store(Request $request)
    {
        // AUTHORIZATION: Hanya admin yang diizinkan menginput data tes baru
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Anda tidak memiliki izin untuk menginput data.');
        }

        $validated = $request->validate([
            'player_id'           => 'required|exists:players,id',
            'date'                => 'required|date',
            'age'                 => 'required|integer',
            
            // Metrik Utama
            'weight'              => 'required|numeric',
            'height'              => 'required|numeric',
            'bmi'                 => 'nullable|numeric',
            
            // Metrik Komposisi Standar
            'body_fat_percentage' => 'nullable|numeric',
            'muscle_mass'         => 'nullable|numeric',
            'bone_mass'           => 'nullable|numeric',
            'visceral_fat'        => 'nullable|numeric',
            'bmr'                 => 'nullable|numeric',
            'total_body_water'    => 'nullable|numeric',
            'metabolic_age'       => 'nullable|integer',

            // --- 3 VARIABEL BARU ANATOMI LENGKAP ---
            'essential_fat_mass'  => 'nullable|numeric',
            'storage_fat_mass'    => 'nullable|numeric',
            'other_mass'          => 'nullable|numeric',
        ]);

        CompositionTest::create($validated);

        return redirect()->back()->with('success', 'Rekaman komposisi tubuh berhasil disimpan secara lengkap!');
    }

    /**
     * Mengupdate data komposisi tubuh jika ada fitur Edit.
     */
    public function update(Request $request, $id)
    {
        // AUTHORIZATION: Hanya admin yang diizinkan memodifikasi data tes
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Anda tidak memiliki izin untuk mengedit data.');
        }

        $test = CompositionTest::findOrFail($id);

        $validated = $request->validate([
            'date'                => 'required|date',
            'age'                 => 'required|integer',
            'weight'              => 'required|numeric',
            'height'              => 'required|numeric',
            'bmi'                 => 'nullable|numeric',
            'body_fat_percentage' => 'nullable|numeric',
            'muscle_mass'         => 'nullable|numeric',
            'bone_mass'           => 'nullable|numeric',
            'visceral_fat'        => 'nullable|numeric',
            'bmr'                 => 'nullable|numeric',
            'total_body_water'    => 'nullable|numeric',
            'metabolic_age'       => 'nullable|integer',

            // --- 3 VARIABEL BARU ANATOMI LENGKAP ---
            'essential_fat_mass'  => 'nullable|numeric',
            'storage_fat_mass'    => 'nullable|numeric',
            'other_mass'          => 'nullable|numeric',
        ]);

        $test->update($validated);

        return redirect()->back()->with('success', 'Rekaman komposisi tubuh berhasil diperbarui!');
    }

    /**
     * Menghapus rekaman.
     */
    public function destroy($id)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Anda tidak memiliki izin untuk menghapus data.');
        }

        $test = CompositionTest::findOrFail($id);
        $test->delete();

        return redirect()->back()->with('success', 'Rekaman berhasil dihapus.');
    }
}