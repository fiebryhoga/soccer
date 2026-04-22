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
        // UBAH: Urutkan berdasarkan position_number
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
    // LOGIKA PEMAIN (Disatukan di Controller ini agar rapi)
    // ==========================================

    public function storePlayer(Request $request)
    {
        $club = Club::firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            // UBAH: Validasi position_number
            'position_number' => [
                'required', 'integer', 'min:1', 'max:99',
                Rule::unique('players')->where('club_id', $club->id)
            ],
            'position' => 'required|in:CB,FB,MF,WF,FW',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $photoPath = $request->hasFile('profile_photo') ? $request->file('profile_photo')->store('players', 'public') : null;

        $player = $club->players()->create([
            'name' => $request->name,
            'position_number' => $request->position_number, // UBAH INI
            'position' => $request->position,
            'profile_photo' => $photoPath,
        ]);

        Activity::log('menambahkan pemain baru', $player->name . ' (#' . $player->position_number . ')', 'create');

        return redirect()->back()->with('message', 'Pemain berhasil ditambahkan.');
    }

    public function storeBulkPlayer(Request $request)
    {
        $club = Club::firstOrFail();

        // Validasi array 'players'
        $request->validate([
            'players' => 'required|array|min:1',
            'players.*.name' => 'required|string|max:255',
            'players.*.position_number' => [
                'required', 
                'integer', 
                'min:1', 
                'max:99',
                'distinct', // Memastikan tidak ada nomor yang kembar di dalam file excel yang di-copy
                // Memastikan tidak ada nomor yang sama di dalam database klub
                Rule::unique('players', 'position_number')->where('club_id', $club->id) 
            ],
            'players.*.position' => 'required|in:CB,FB,MF,WF,FW',
        ], [
            // Pesan error kustom agar lebih mudah dimengerti saat bulk insert gagal
            'players.*.position_number.unique' => 'Salah satu nomor posisi yang Anda paste sudah digunakan oleh pemain di database.',
            'players.*.position_number.distinct' => 'Ada nomor posisi yang kembar/duplikat di dalam data yang Anda paste.',
            'players.*.position.in' => 'Posisi harus salah satu dari: CB, FB, MF, WF, FW.'
        ]);

        $count = 0;
        foreach ($request->players as $playerData) {
            $club->players()->create([
                'name' => $playerData['name'],
                'position_number' => $playerData['position_number'],
                // Memastikan input posisi selalu kapital agar aman masuk database
                'position' => strtoupper($playerData['position']),
                'profile_photo' => null, // Untuk massal, foto di-set null. Bisa diedit satuan nanti.
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
            // UBAH: Validasi position_number
            'position_number' => [
                'required', 'integer', 'min:1', 'max:99',
                Rule::unique('players')->where('club_id', $player->club_id)->ignore($player->id)
            ],
            'position' => 'required|in:CB,FB,MF,WF,FW',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $player->name = $request->name;
        $player->position_number = $request->position_number; // UBAH INI
        $player->position = $request->position;

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