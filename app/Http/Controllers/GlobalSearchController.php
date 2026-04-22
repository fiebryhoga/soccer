<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (empty($query)) {
            return response()->json([]);
        }

        $admins = User::where('name', 'like', "%{$query}%")
            ->orWhere('username', 'like', "%{$query}%")
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'title' => $user->name,
                    'subtitle' => '@' . $user->username,
                    'type' => 'Admin',
                    'url' => route('admins.edit', $user->id), 
                    'icon' => 'user',
                    // TAMBAHKAN INI: Kirim URL foto profil jika ada
                    'avatar' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                ];
            });

        return response()->json($admins);
    }
}