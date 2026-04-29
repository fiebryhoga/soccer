<?php

namespace App\Http\Controllers;

use App\Models\Benchmark;
use App\Models\Club;
use App\Models\Player;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayerBenchmarkController extends Controller
{
    public function index() {
        return Inertia::render('Benchmarks/Player/Index', [
            // Ambil benchmark yang target_type-nya 'player'
            'benchmarks' => Benchmark::where('target_type', 'player')->latest()->get(),
        ]);
    }

    public function create() {
        return Inertia::render('Benchmarks/Player/Form', [
            'players' => Player::orderBy('position')->get()
        ]);
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'metrics' => 'required|array',
        ]);

        $club = Club::firstOrFail();
        $benchmark = Benchmark::create([
            'club_id' => $club->id,
            'name' => $request->name,
            'target_type' => 'player', // KUNCI: Disimpan sebagai target pemain
            'metrics' => $request->metrics, // JSON ini akan berisi ID Pemain sebagai Key
        ]);

        Activity::log('membuat benchmark Pemain baru', $benchmark->name, 'create');
        return redirect()->route('players.benchmarks.index')->with('message', 'Benchmark Pemain berhasil dibuat.');
    }

    public function edit(Benchmark $benchmark) {
        return Inertia::render('Benchmarks/Player/Form', [
            'benchmark' => $benchmark,
            'players' => Player::orderBy('position')->get()
        ]);
    }

    public function update(Request $request, Benchmark $benchmark) {
        $request->validate([
            'name' => 'required|string|max:255',
            'metrics' => 'required|array',
        ]);

        $benchmark->update([
            'name' => $request->name,
            'metrics' => $request->metrics,
        ]);

        Activity::log('memperbarui benchmark Pemain', $benchmark->name, 'update');
        return redirect()->route('players.benchmarks.index')->with('message', 'Benchmark Pemain berhasil diperbarui.');
    }

    public function duplicate(Benchmark $benchmark) {
        $newBenchmark = $benchmark->replicate();
        $newBenchmark->name = 'Salinan ' . $benchmark->name;
        $newBenchmark->save();
        
        Activity::log('menduplikasi benchmark Pemain', $newBenchmark->name, 'create');
        return redirect()->back()->with('message', 'Benchmark Pemain berhasil diduplikasi.');
    }

    public function destroy(Benchmark $benchmark) {
        $name = $benchmark->name;
        $benchmark->delete();
        Activity::log('menghapus benchmark Pemain', $name, 'delete');
        return redirect()->back()->with('message', 'Benchmark Pemain berhasil dihapus.');
    }
}