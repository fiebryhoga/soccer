<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /**
     * Menampilkan halaman penuh untuk Activity Log (Jejak Aktivitas Sistem).
     */
    public function index(Request $request)
    {
        // Mengambil 50 aktivitas terbaru dari database beserta data user yang melakukannya
        $activities = Activity::with('user')
            ->latest()
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    
                    // KUNCI PENTING: Menyertakan actor_id agar React bisa mengecek 
                    // apakah user yang sedang login adalah orang yang sama yang melakukan aksi ini
                    'actor_id' => $log->user_id,
                    
                    // Nama pengguna, jika user terhapus atau tidak ada, otomatis tertulis 'System'
                    'user_name' => $log->user ? $log->user->name : 'System',
                    
                    // Membuat URL lengkap ke folder storage public agar foto profil bisa muncul
                    'user_avatar' => ($log->user && $log->user->profile_photo) 
                        ? asset('storage/' . $log->user->profile_photo) 
                        : null,
                        
                    'action' => $log->action,
                    'target' => $log->target,
                    'type' => $log->type, // 'system', 'video', 'comment', dll
                    
                    // Format waktu jam (contoh: 10:30 AM)
                    'time' => $log->created_at->format('H:i') . ' WIB',
                    
                    // Format tanggal lengkap beserta tahun, atau tulisan 'Today' jika terjadi hari ini
                    'date' => $log->created_at->isToday() 
                        ? 'Hari ini' 
                        : $log->created_at->locale('id')->translatedFormat('l, d M Y'),
                        
                    // Pastikan dikirim sebagai tipe data Boolean (True/False)
                    'is_read' => (bool) $log->is_read,
                    
                    // Link rute jika notifikasi/aktivitas ini bisa diklik
                    'href' => $log->href,
                ];
            });

        // Merender komponen React di folder resources/js/Pages/Activity/Index.jsx
        // sambil mengirimkan data variabel $activities
        return inertia('Activity/Index', [
            'activities' => $activities
        ]);
    }
}