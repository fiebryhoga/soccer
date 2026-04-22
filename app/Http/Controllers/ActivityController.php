<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        // Membangun query dengan filter
        $query = Activity::with('user')->latest();

        // Logika Tab (All vs System)
        if ($request->tab === 'system') {
            $query->where('type', 'system');
        }

        // Logika Filter Tanggal
        if ($request->date) {
            $query->whereDate('created_at', $request->date);
        }

        $activities = $query->limit(100)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'actor_id' => $log->user_id,
                    'user_name' => $log->user ? $log->user->name : 'System',
                    'user_avatar' => ($log->user && $log->user->profile_photo) 
                        ? asset('storage/' . $log->user->profile_photo) 
                        : null,
                    'action' => $log->action,
                    'target' => $log->target,
                    'type' => $log->type,
                    'time' => $log->created_at->format('H:i') . ' WIB',
                    'date' => $log->created_at->locale('id')->translatedFormat('d M Y'), // Format tanggal rapi
                    'full_date' => $log->created_at->format('Y-m-d H:i:s'),
                    'is_read' => (bool) $log->is_read,
                    'href' => $log->href,
                    'ip_address' => $log->ip_address ?? 'Unknown IP',
                    'user_agent' => $log->user_agent ?? 'Unknown Device',
                ];
            });

        return inertia('Activity/Index', [
            'activities' => $activities,
            'filters' => $request->only(['tab', 'date']) // Kirim filter saat ini ke React
        ]);
    }

    /**
     * Fitur Download Log ke CSV
     */
    public function export(Request $request)
    {
        $query = Activity::with('user')->latest();

        if ($request->tab === 'system') {
            $query->where('type', 'system');
        }
        if ($request->date) {
            $query->whereDate('created_at', $request->date);
        }

        $activities = $query->get();

        // Load view khusus PDF dan passing datanya
        $pdf = Pdf::loadView('pdf.activity-log', [
            'activities' => $activities,
            'filters' => $request->only(['tab', 'date']),
            'export_date' => now()->translatedFormat('l, d F Y H:i WIB')
        ]);

        // Atur ukuran kertas ke A4 Landscape agar tabelnya muat
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('activity_logs_' . date('Ymd_His') . '.pdf');
    }
}