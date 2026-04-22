<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $recentActivities = [];
        if ($request->user()) {
            $recentActivities = \App\Models\Activity::with('user')
                ->latest()
                ->limit(10)
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
                        'date' => $log->created_at->isToday() 
                            ? 'Hari ini' 
                            : $log->created_at->locale('id')->translatedFormat('l, d M Y'),
                        'is_read' => (bool) $log->is_read,
                        'href' => $log->href,
                    ];
                });
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'recentActivities' => $recentActivities,
        ];
    }
}
