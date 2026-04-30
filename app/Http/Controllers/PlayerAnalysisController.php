<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Club;
use App\Models\Player;
use App\Models\PerformanceLog;
use App\Models\PlayerMetric;
use Carbon\Carbon;

class PlayerAnalysisController extends Controller
{
    public function playerStrain(Request $request)
    {
        $club = Club::first();
        
        $startDate = $request->query('start_date', Carbon::parse($club->season_start_date)->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());
        
        $players = Player::orderBy('position_number')->get(['id', 'name', 'position', 'position_number']);
        
        $playerId = $request->query('player_id');
        if (!$playerId && $players->count() > 0) {
            $playerId = $players->first()->id;
        }

        $weeksData = [];
        
        if ($playerId) {
            $logs = PerformanceLog::where('club_id', $club->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date', 'asc')
                ->get();

            $groupedLogs = $logs->groupBy(function($log) {
                return Carbon::parse($log->date)->startOfWeek()->format('Y-m-d');
            });

            $weekCounter = 1;
            foreach ($groupedLogs as $weekStart => $weekLogs) {
                $endOfWeek = Carbon::parse($weekStart)->endOfWeek()->format('Y-m-d');

                $daysData = [];
                foreach ($weekLogs as $log) {
                    // Ambil data MUTLAK spesifik 1 pemain
                    $metric = PlayerMetric::where('performance_log_id', $log->id)
                        ->where('player_id', $playerId)
                        ->first();

                    $metricsArray = [];
                    if ($metric) {
                        $metricsArray = is_array($metric->metrics) ? $metric->metrics : json_decode($metric->metrics, true);
                    }

                    $daysData[] = [
                        'date' => $log->date,
                        'title' => $log->title ?: ucfirst($log->type),
                        'type' => $log->type,
                        // KITA GUNAKAN NAMA 'metrics', BUKAN 'averages'
                        'metrics' => $metricsArray 
                    ];
                }

                $weeksData[] = [
                    'week_label' => "Week " . $weekCounter,
                    'start_date' => $weekStart,
                    'end_date' => $endOfWeek,
                    'days' => $daysData
                ];
                $weekCounter++;
            }
        }

        return inertia('Analysis/PlayerStrainMonotony', [
            'players' => $players,
            'selectedPlayerId' => (int) $playerId,
            'weeksData' => $weeksData,
            'startDate' => $startDate,
            'endDate' => $endDate
        ]);
    }

    public function playerAcwr(Request $request)
    {
        $club = \App\Models\Club::first();
        
        $startDate = $request->query('start_date', \Carbon\Carbon::parse($club->season_start_date)->toDateString());
        $endDate = $request->query('end_date', \Carbon\Carbon::now()->toDateString());
        
        $players = \App\Models\Player::orderBy('position_number')->get(['id', 'name', 'position', 'position_number']);
        
        $playerId = $request->query('player_id');
        if (!$playerId && $players->count() > 0) {
            $playerId = $players->first()->id;
        }

        // KUNCI ACWR: Tarik data dari H-28 sebelum tanggal awal agar kalkulasi "Chronic" hari pertama valid!
        $calcStartDate = \Carbon\Carbon::parse($startDate)->subDays(27)->toDateString();
        
        $dailyLogs = [];
        
        if ($playerId) {
            $logs = \App\Models\PerformanceLog::where('club_id', $club->id)
                ->whereBetween('date', [$calcStartDate, $endDate])
                ->orderBy('date', 'asc')
                ->get();

            // Kita kirim array murni harian (TIDAK ADA GROUPING MINGGUAN)
            foreach ($logs as $log) {
                $metric = \App\Models\PlayerMetric::where('performance_log_id', $log->id)
                    ->where('player_id', $playerId)
                    ->first();

                $dailyLogs[] = [
                    'date' => $log->date,
                    'title' => $log->title ?: ucfirst($log->type),
                    'type' => $log->type,
                    'metrics' => $metric ? (is_array($metric->metrics) ? $metric->metrics : json_decode($metric->metrics, true)) : []
                ];
            }
        }

        return inertia('Analysis/PlayerACWR', [
            'players' => $players,
            'selectedPlayerId' => (int) $playerId,
            'dailyLogs' => $dailyLogs, // Mengirim data harian
            'startDate' => $startDate,
            'endDate' => $endDate
        ]);
    }
}