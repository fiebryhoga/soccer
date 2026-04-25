<?php

namespace App\Http\Controllers;

use App\Models\Benchmark;
use App\Models\Club;
use App\Models\Activity;
use Illuminate\Http\Request;

class BenchmarkController extends Controller
{
    public function index() {
        return inertia('Benchmarks/Index', [
            'benchmarks' => Benchmark::latest()->get(),
        ]);
    }

    public function create() {
        return inertia('Benchmarks/Form');
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
            'target_type' => 'team',
            'metrics' => $request->metrics,
        ]);

        // LOG ACTIVITY
        Activity::log('membuat standar benchmark Tim baru', $benchmark->name, 'create');

        return redirect()->route('benchmarks.index')->with('message', 'Benchmark berhasil dibuat.');
    }

    public function show(Benchmark $benchmark) {
        return inertia('Benchmarks/Show', [
            'benchmark' => $benchmark
        ]);
    }

    public function edit(Benchmark $benchmark) {
        return inertia('Benchmarks/Form', [
            'benchmark' => $benchmark
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

        // LOG ACTIVITY
        Activity::log('memperbarui standar benchmark Tim', $benchmark->name, 'update');

        return redirect()->route('benchmarks.index')->with('message', 'Benchmark berhasil diperbarui.');
    }

    public function duplicate(Benchmark $benchmark) {
        // Replicate akan menyalin seluruh field kecuali ID dan Timestamps
        $newBenchmark = $benchmark->replicate();
        
        // Ubah namanya sesuai permintaan
        $newBenchmark->name = 'Salinan ' . $benchmark->name;
        $newBenchmark->save();
    
        // Log Aktivitas
        Activity::log('menduplikasi standar benchmark Tim', $newBenchmark->name, 'create');
    
        return redirect()->back()->with('message', 'Benchmark berhasil diduplikasi.');
    }

    public function destroy(Benchmark $benchmark) {
        $name = $benchmark->name;
        $benchmark->delete();

        // LOG ACTIVITY
        Activity::log('menghapus standar benchmark Tim', $name, 'delete');

        return redirect()->back()->with('message', 'Benchmark berhasil dihapus.');
    }
}