<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\Player;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ClubController extends Controller
{
    public function index()
    {
        // Urutkan berdasarkan position_number
        $club = Club::with(['players' => function($q) {
            $q->orderBy('position_number', 'asc'); 
        }])->first();

        if ($club) {
            $club->logo_url = $club->logo ? asset('storage/' . $club->logo) : null;
            $club->players->transform(function ($player) {
                $player->photo_url = $player->profile_photo ? asset('storage/' . $player->profile_photo) : null;
                return $player;
            });
        }

        return inertia('Club/Index', [
            'club' => $club
        ]);
    }

    /**
     * Menyimpan Klub Baru (Hanya bisa dilakukan jika belum ada klub)
     */
    public function store(Request $request)
    {
        if (Club::count() > 0) {
            return redirect()->back()->with('error', 'Klub sudah dikonfigurasi.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $logoPath = $request->hasFile('logo') ? $request->file('logo')->store('clubs', 'public') : null;

        $club = Club::create([
            'name' => $request->name,
            'logo' => $logoPath,
        ]);

        Activity::log('membuat profil klub baru', $club->name, 'create');

        return redirect()->back()->with('message', 'Klub berhasil dibuat.');
    }

    /**
     * Memperbarui Klub
     */
    public function update(Request $request, Club $club)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $club->name = $request->name;

        if ($request->hasFile('logo')) {
            if ($club->logo) Storage::disk('public')->delete($club->logo);
            $club->logo = $request->file('logo')->store('clubs', 'public');
        }

        $club->save();

        Activity::log('memperbarui profil klub', $club->name, 'update');

        return redirect()->back()->with('message', 'Klub berhasil diperbarui.');
    }

    // ==========================================
    // LOGIKA PEMAIN
    // ==========================================

    public function storePlayer(Request $request)
    {
        $club = Club::firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'position_number' => [
                'required', 'integer', 'min:1', 'max:99',
                Rule::unique('players')->where('club_id', $club->id)
            ],
            'position' => 'required|in:CB,FB,MF,WF,FW',
            'highest_velocity' => 'nullable|numeric|min:0',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            
            // <-- BARU: Validasi atribut fisik
            'age' => 'nullable|integer|min:5|max:100',
            'gender' => 'nullable|in:male,female',
            'height' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dominant_limb' => 'nullable|in:left,right,both',
        ]);

        $photoPath = $request->hasFile('profile_photo') ? $request->file('profile_photo')->store('players', 'public') : null;

        $highestMetrics = [];
        if ($request->filled('highest_velocity')) {
            $highestMetrics['highest_velocity'] = $request->highest_velocity;
        }

        $player = $club->players()->create([
            'name' => $request->name,
            'position_number' => $request->position_number,
            'position' => $request->position,
            'profile_photo' => $photoPath,
            'highest_metrics' => empty($highestMetrics) ? null : $highestMetrics,
            
            // <-- BARU: Simpan atribut fisik
            'age' => $request->age,
            'gender' => $request->gender ?? 'male', // Default laki-laki
            'height' => $request->height,
            'weight' => $request->weight,
            'dominant_limb' => $request->dominant_limb,
        ]);

        Activity::log('menambahkan pemain baru', $player->name . ' (#' . $player->position_number . ')', 'create');

        return redirect()->back()->with('message', 'Pemain berhasil ditambahkan.');
    }

    public function storeBulkPlayer(Request $request)
    {
        $club = Club::firstOrFail();

        $request->validate([
            'players' => 'required|array|min:1',
            'players.*.name' => 'required|string|max:255',
            'players.*.position_number' => [
                'required', 'integer', 'min:1', 'max:99', 'distinct',
                Rule::unique('players', 'position_number')->where('club_id', $club->id) 
            ],
            'players.*.position' => 'required|in:CB,FB,MF,WF,FW',
            'players.*.highest_velocity' => 'nullable|numeric|min:0',
            
            // <-- BARU: Validasi Bulk untuk atribut fisik
            'players.*.age' => 'nullable|integer',
            'players.*.gender' => 'nullable|in:male,female',
            'players.*.height' => 'nullable|numeric',
            'players.*.weight' => 'nullable|numeric',
            'players.*.dominant_limb' => 'nullable|in:left,right,both',
        ], [
            'players.*.position_number.unique' => 'Salah satu nomor posisi yang Anda paste sudah digunakan oleh pemain di database.',
            'players.*.position_number.distinct' => 'Ada nomor posisi yang kembar/duplikat di dalam data yang Anda paste.',
            'players.*.position.in' => 'Posisi harus salah satu dari: CB, FB, MF, WF, FW.'
        ]);

        $count = 0;
        foreach ($request->players as $playerData) {
            
            $highestMetrics = [];
            if (isset($playerData['highest_velocity']) && $playerData['highest_velocity'] !== '') {
                $highestMetrics['highest_velocity'] = (float) str_replace(',', '.', $playerData['highest_velocity']);
            }

            // <-- BARU: Bersihkan data desimal tinggi & berat dari format Excel
            $height = isset($playerData['height']) && $playerData['height'] !== '' ? (float) str_replace(',', '.', $playerData['height']) : null;
            $weight = isset($playerData['weight']) && $playerData['weight'] !== '' ? (float) str_replace(',', '.', $playerData['weight']) : null;
            $dominant_limb = isset($playerData['dominant_limb']) && $playerData['dominant_limb'] !== '' ? strtolower($playerData['dominant_limb']) : null;

            $club->players()->create([
                'name' => $playerData['name'],
                'position_number' => $playerData['position_number'],
                'position' => strtoupper($playerData['position']),
                'highest_metrics' => empty($highestMetrics) ? null : $highestMetrics,
                'profile_photo' => null, 
                
                // <-- BARU: Simpan atribut fisik bulk
                'age' => $playerData['age'] ?? null,
                'gender' => strtolower($playerData['gender'] ?? 'male'), // Default laki-laki
                'height' => $height,
                'weight' => $weight,
                'dominant_limb' => in_array($dominant_limb, ['left', 'right', 'both']) ? $dominant_limb : null,
            ]);
            $count++;
        }

        Activity::log('menambahkan ' . $count . ' pemain sekaligus', 'dari file Spreadsheet', 'create');

        return redirect()->back()->with('message', $count . ' pemain berhasil ditambahkan secara massal.');
    }

    public function updatePlayer(Request $request, Player $player)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'position_number' => [
                'required', 'integer', 'min:1', 'max:99',
                Rule::unique('players')->where('club_id', $player->club_id)->ignore($player->id)
            ],
            'position' => 'required|in:CB,FB,MF,WF,FW',
            'highest_velocity' => 'nullable|numeric|min:0',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            
            // <-- BARU: Validasi update atribut fisik
            'age' => 'nullable|integer|min:5|max:100',
            'gender' => 'nullable|in:male,female',
            'height' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dominant_limb' => 'nullable|in:left,right,both',
        ]);

        $player->name = $request->name;
        $player->position_number = $request->position_number;
        $player->position = $request->position;

        $highestMetrics = $player->highest_metrics ?? [];
        if ($request->filled('highest_velocity')) {
            $highestMetrics['highest_velocity'] = $request->highest_velocity;
        } else {
            unset($highestMetrics['highest_velocity']);
        }
        $player->highest_metrics = empty($highestMetrics) ? null : $highestMetrics;

        // <-- BARU: Update atribut fisik
        $player->age = $request->age;
        $player->gender = $request->gender ?? 'male';
        $player->height = $request->height;
        $player->weight = $request->weight;
        $player->dominant_limb = $request->dominant_limb;

        if ($request->hasFile('profile_photo')) {
            if ($player->profile_photo) Storage::disk('public')->delete($player->profile_photo);
            $player->profile_photo = $request->file('profile_photo')->store('players', 'public');
        }

        $player->save();

        Activity::log('memperbarui data pemain', $player->name, 'update');

        return redirect()->back()->with('message', 'Data pemain berhasil diperbarui.');
    }

    public function destroyPlayer(Player $player)
    {
        if ($player->profile_photo) Storage::disk('public')->delete($player->profile_photo);
        
        $playerName = $player->name;
        $player->delete();

        Activity::log('menghapus pemain', $playerName, 'delete');

        return redirect()->back()->with('message', 'Pemain berhasil dihapus.');
    }
}