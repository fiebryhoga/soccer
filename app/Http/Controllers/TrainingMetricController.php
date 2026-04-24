<?php

namespace App\Http\Controllers;

use App\Models\PlayerMetric;
use App\Models\Benchmark;
use App\Models\Player;
use App\Models\Activity;
use Illuminate\Http\Request;

class TrainingMetricController extends Controller
{
    /**
     * Menampilkan Halaman Laporan GPS (Tempat tabel persentase muncul)
     */
    public function index(Request $request)
    {
        // Jika tidak ada tanggal yang difilter, tampilkan data hari ini
        $date = $request->input('date', now()->toDateString());

        // Ambil data metrik mentah yang diupload pada tanggal tersebut,
        // sekalian "bawa" data pemain dan benchmark-nya agar React bisa menghitung persentasenya
        $metrics = PlayerMetric::with(['player', 'benchmark'])
            ->whereDate('date', $date)
            ->get();

        // Ambil list Benchmark & Pemain untuk opsi di form upload
        $benchmarks = Benchmark::all();
        $players = Player::orderBy('position_number', 'asc')->get();

        return inertia('TrainingMetrics/Index', [
            'date' => $date,
            'metrics' => $metrics,
            'benchmarks' => $benchmarks,
            'players' => $players,
        ]);
    }

    /**
     * Menyimpan hasil Paste / Upload Massal dari Excel
     */
    public function storeBulk(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'benchmark_id' => 'nullable|exists:benchmarks,id', // Opsi: Latihan ini pakai standar target yang mana?
            'players_data' => 'required|array|min:1',
            'players_data.*.player_id' => 'required|exists:players,id',
            'players_data.*.metrics' => 'required|array', // JSON Data (Jarak, Sprint, dll)
        ]);

        $count = 0;

        foreach ($request->players_data as $data) {
            // Gunakan updateOrCreate! 
            // Kenapa? Jika pelatih salah upload dan melakukan paste ulang di tanggal yang sama,
            // datanya akan di-update (tertimpa), BUKAN menjadi ganda/double. Sangat aman.
            PlayerMetric::updateOrCreate(
                [
                    'player_id' => $data['player_id'],
                    'date' => $request->date,
                ],
                [
                    'benchmark_id' => $request->benchmark_id,
                    'metrics' => $data['metrics'], // Laravel mengubah Array menjadi JSON
                ]
            );
            $count++;
        }

        // Catat Aktivitas Sistem
        $formattedDate = \Carbon\Carbon::parse($request->date)->translatedFormat('d F Y');
        Activity::log('mengunggah data performa fisik untuk ' . $count . ' pemain', 'Sesi ' . $formattedDate, 'create');

        return redirect()->back()->with('message', "Data performa $count pemain berhasil disimpan.");
    }

    /**
     * Menghapus seluruh data latihan pada satu hari (Reset Hari)
     */
    public function destroyByDate(Request $request)
    {
        $request->validate(['date' => 'required|date']);
        
        PlayerMetric::whereDate('date', $request->date)->delete();

        $formattedDate = \Carbon\Carbon::parse($request->date)->translatedFormat('d F Y');
        Activity::log('mereset/menghapus seluruh data sesi latihan', 'Sesi ' . $formattedDate, 'delete');

        return redirect()->back()->with('message', 'Semua data pada tanggal tersebut telah dihapus.');
    }
}