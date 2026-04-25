<?php

namespace App\Http\Controllers;

use App\Models\PerformanceLog;
use App\Models\Player;
use App\Models\PlayerMetric;
use Illuminate\Http\Request;

class PerformanceAnalysisController extends Controller
{
    public function index()
    {
        // 1. Ambil 5 Sesi Latihan/Match Terakhir yang ada datanya
        $recentLogs = PerformanceLog::where('type', '!=', 'off')
            ->whereHas('playerMetrics') // Pastikan sesi ini sudah diisi data
            ->orderBy('date', 'desc')
            ->take(5)
            ->get()
            ->reverse()
            ->values();

        if ($recentLogs->count() < 2) {
            return back()->with('error', 'Minimal harus ada 2 sesi yang sudah diisi data GPS untuk melihat analisis komparasi.');
        }

        // 2. Siapkan Data untuk Grafik Garis (Tren Tim)
        $trendData = [];
        foreach ($recentLogs as $log) {
            $metrics = PlayerMetric::where('performance_log_id', $log->id)->get();
            $avgDistance = $metrics->avg(fn($m) => (float)($m->metrics['total_distance'] ?? 0));
            $avgPlayerLoad = $metrics->avg(fn($m) => (float)($m->metrics['player_load'] ?? 0));
            $avgSprint = $metrics->avg(fn($m) => (float)($m->metrics['sprint_distance'] ?? 0));

            $trendData[] = [
                'name' => \Carbon\Carbon::parse($log->date)->format('d M'),
                'title' => $log->title,
                'Total Distance' => round($avgDistance, 1),
                'Player Load' => round($avgPlayerLoad, 1),
                'Sprint Distance' => round($avgSprint, 1),
            ];
        }

        // 3. Analisis Komparasi: Sesi Terakhir vs Sesi Sebelumnya
        $latestLog = $recentLogs->last();
        $previousLog = $recentLogs[$recentLogs->count() - 2];

        $latestMetrics = PlayerMetric::where('performance_log_id', $latestLog->id)->with('player')->get()->keyBy('player_id');
        $previousMetrics = PlayerMetric::where('performance_log_id', $previousLog->id)->get()->keyBy('player_id');

        $insights = [
            'declining' => [], // Menurun drastis (Resiko Cedera/Lelah)
            'improving' => [], // Meningkat tajam (On Fire)
            'suggestions' => [] // Saran AI/Sistem
        ];

        $teamDistDiff = 0;

        foreach ($latestMetrics as $playerId => $latest) {
            if (!$previousMetrics->has($playerId)) continue;
            
            $prev = $previousMetrics[$playerId];
            $playerName = $latest->player->name ?? 'Unknown';

            // Ambil metrik kunci
            $currLoad = (float)($latest->metrics['player_load'] ?? 0);
            $prevLoad = (float)($prev->metrics['player_load'] ?? 0);
            
            $currDist = (float)($latest->metrics['total_distance'] ?? 0);
            $prevDist = (float)($prev->metrics['total_distance'] ?? 0);

            $teamDistDiff += ($currDist - $prevDist);

            // Hitung Persentase Perubahan
            $loadDiffPercent = $prevLoad > 0 ? (($currLoad - $prevLoad) / $prevLoad) * 100 : 0;
            $distDiffPercent = $prevDist > 0 ? (($currDist - $prevDist) / $prevDist) * 100 : 0;

            // LOGIKA DETEKSI PENURUNAN (WASPADA)
            if ($loadDiffPercent < -15 && $distDiffPercent < -10) {
                $insights['declining'][] = [
                    'name' => $playerName,
                    'note' => "Total Distance turun " . abs(round($distDiffPercent)) . "%. Potensi kelelahan atau *underperforming*.",
                    'severity' => 'high'
                ];
                $insights['suggestions'][] = "Pertimbangkan recovery pasif (pijat/ice bath) untuk {$playerName} karena drop fisik yang signifikan.";
            }

            // LOGIKA DETEKSI PENINGKATAN (ON FIRE)
            if ($loadDiffPercent > 10 && $distDiffPercent > 10) {
                $insights['improving'][] = [
                    'name' => $playerName,
                    'note' => "Total Distance naik " . round($distDiffPercent) . "%. Kebugaran sedang puncak.",
                    'severity' => 'good'
                ];
            }
        }

        // Saran Tingkat Tim
        $avgTeamDiff = count($latestMetrics) > 0 ? ($teamDistDiff / count($latestMetrics)) : 0;
        if ($avgTeamDiff < -300) {
            array_unshift($insights['suggestions'], "RATA-RATA TIM: Terjadi penurunan mobilitas tim secara umum. Jika besok adalah Match Day (MD-1), ini adalah hal bagus (Tapering). Namun jika ini fase build-up, evaluasi intensitas sesi latihan.");
        } elseif ($avgTeamDiff > 500) {
            array_unshift($insights['suggestions'], "RATA-RATA TIM: Intensitas latihan sangat tinggi hari ini dibanding sebelumnya. Pastikan asupan karbohidrat dan hidrasi tim maksimal malam ini.");
        }

        return inertia('PerformanceLogs/Analysis', [
            'trendData' => $trendData,
            'insights' => $insights,
            'latestLog' => $latestLog,
            'previousLog' => $previousLog
        ]);
    }
}