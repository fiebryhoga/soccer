<?php

namespace App\Http\Controllers;

use App\Models\Benchmark;
use App\Models\Player;
use App\Models\Club;
use App\Models\Activity;
use Illuminate\Http\Request;

class BenchmarkController extends Controller
{
    /**
     * Menampilkan halaman daftar Benchmark (Target)
     */
    public function index()
    {
        // Ambil semua benchmark beserta data pemain (jika itu benchmark individu)
        $benchmarks = Benchmark::with('player')->latest()->get();
        
        // Ambil data pemain untuk pilihan dropdown jika klien ingin membuat target individu
        $players = Player::orderBy('position_number', 'asc')->get();

        return inertia('Benchmarks/Index', [
            'benchmarks' => $benchmarks,
            'players' => $players,
        ]);
    }

    /**
     * Menyimpan Benchmark Baru ke Database
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'target_type' => 'required|in:team,player', // Pilihan: Untuk Tim atau Individu
            'player_id' => 'required_if:target_type,player|nullable|exists:players,id',
            'metrics' => 'required|array', // JSON metrics (Total Distance, SPRINT, dll) dari Frontend
        ]);

        $club = Club::firstOrFail(); // Ambil data klub saat ini

        $benchmark = Benchmark::create([
            'club_id' => $club->id,
            'name' => $request->name,
            'target_type' => $request->target_type,
            'player_id' => $request->target_type === 'player' ? $request->player_id : null,
            'metrics' => $request->metrics, // Laravel otomatis mengubah Array ke JSON
        ]);

        // Simpan Jejak Aktivitas
        $targetInfo = $request->target_type === 'team' ? 'Tim' : 'Individu';
        Activity::log('membuat standar benchmark ' . $targetInfo . ' baru', $benchmark->name, 'create');

        return redirect()->back()->with('message', 'Benchmark berhasil disimpan.');
    }

    /**
     * Memperbarui Benchmark (Jika pelatih ingin merevisi angka target)
     */
    public function update(Request $request, Benchmark $benchmark)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'metrics' => 'required|array',
        ]);

        $benchmark->update([
            'name' => $request->name,
            'metrics' => $request->metrics,
        ]);

        Activity::log('merevisi angka target pada benchmark', $benchmark->name, 'update');

        return redirect()->back()->with('message', 'Benchmark berhasil diperbarui.');
    }

    /**
     * Menghapus Benchmark
     */
    public function destroy(Benchmark $benchmark)
    {
        $benchmarkName = $benchmark->name;
        $benchmark->delete();

        Activity::log('menghapus benchmark', $benchmarkName, 'delete');

        return redirect()->back()->with('message', 'Benchmark berhasil dihapus.');
    }
}