<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PerformanceLog;
use App\Models\Benchmark; // <-- TAMBAHKAN IMPORT MODEL BENCHMARK
use Illuminate\Http\Request;
use Carbon\Carbon;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (empty($query)) {
            return response()->json([]);
        }

        // 1. PENCARIAN ADMIN
        $admins = User::where('name', 'like', "%{$query}%")
            ->orWhere('username', 'like', "%{$query}%")
            ->limit(3)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => 'user_' . $user->id, 
                    'title' => $user->name,
                    'subtitle' => '@' . $user->username,
                    'type' => 'Admin',
                    'url' => route('admins.edit', $user->id), 
                    'icon' => 'user',
                    'avatar' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                ];
            });

        // 2. LOGIKA PENCARIAN BULAN PINTAR
        $monthMapping = [
            'januari' => '01', 'january' => '01', 'jan' => '01',
            'februari' => '02', 'february' => '02', 'feb' => '02',
            'maret' => '03', 'march' => '03', 'mar' => '03',
            'april' => '04', 'apr' => '04',
            'mei' => '05', 'may' => '05',
            'juni' => '06', 'june' => '06', 'jun' => '06',
            'juli' => '07', 'july' => '07', 'jul' => '07',
            'agustus' => '08', 'august' => '08', 'aug' => '08',
            'september' => '09', 'sep' => '09',
            'oktober' => '10', 'october' => '10', 'oct' => '10',
            'november' => '11', 'nov' => '11',
            'desember' => '12', 'december' => '12', 'dec' => '12',
        ];
        $searchLower = strtolower($query);
        $monthNum = $monthMapping[$searchLower] ?? null;

        // 3. PENCARIAN PERFORMANCE LOGS (Match & Training Session)
        $logQueryBuilder = PerformanceLog::where('title', 'like', "%{$query}%")
            ->orWhere('tag', 'like', "%{$query}%")
            ->orWhere('type', 'like', "%{$query}%")
            ->orWhere('date', 'like', "%{$query}%");
            
        if ($monthNum) {
            $logQueryBuilder->orWhereMonth('date', $monthNum);
        }

        $logs = $logQueryBuilder->limit(5)
            ->get()
            ->map(function ($log) {
                $formattedDate = Carbon::parse($log->date)->translatedFormat('d M Y');
                return [
                    'id' => 'log_' . $log->id,
                    'title' => $log->title,
                    'subtitle' => $log->tag . ' • ' . $formattedDate,
                    'type' => ucfirst($log->type), 
                    'url' => route('performance-logs.show', $log->id),
                    'icon' => $log->type, 
                    'avatar' => null, 
                ];
            });

        // 4. PENCARIAN BENCHMARK
        $benchmarks = Benchmark::where('name', 'like', "%{$query}%")
            ->limit(3)
            ->get()
            ->map(function ($bm) {
                return [
                    'id' => 'bm_' . $bm->id,
                    'title' => 'Benchmark ' . $bm->name,
                    'subtitle' => 'Standard Metrics Target',
                    'type' => 'Benchmark',
                    // Gunakan route show jika ada, atau index jika tidak ada halaman detail khusus
                    'url' => route('benchmarks.show', $bm->id), 
                    'icon' => 'target',
                    'avatar' => null,
                ];
            });

        // 5. GABUNGKAN HASIL (Logs + Benchmarks + Admins)
        $results = $logs->concat($benchmarks)->concat($admins);

        return response()->json($results);
    }
}