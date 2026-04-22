<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Activity; // Tambahkan ini!
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class AdminController extends Controller
{
    /**
     * Menampilkan daftar admin/coach.
     */
    public function index()
    {
        // Ambil semua user, urutkan dari yang terbaru
        $admins = User::latest()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                // Ubah path storage menjadi URL lengkap agar bisa dibaca oleh tag <img> di React
                'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'created_at' => $user->created_at,
            ];
        });

        return inertia('Admins/Index', [
            'admins' => $admins
        ]);
    }

    /**
     * Menampilkan form tambah admin.
     */
    public function create()
    {
        return inertia('Admins/Form');
    }

    /**
     * Menyimpan admin baru ke database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'password' => ['required', 'string', Password::defaults()],
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'], // Maksimal 2MB
        ]);

        $photoPath = null;
        if ($request->hasFile('profile_photo')) {
            // Simpan gambar ke folder 'profiles' di dalam disk 'public'
            $photoPath = $request->file('profile_photo')->store('profiles', 'public');
        }

        // PERBAIKAN: Masukkan hasil create ke dalam variabel $admin
        $admin = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'profile_photo' => $photoPath,
        ]);

        Activity::log('menambahkan akun admin baru untuk', $admin->name, 'system', route('admins.index'));
        
        return redirect()->route('admins.index')->with('message', 'Admin created successfully.');
    }

    /**
     * Menampilkan form edit admin.
     */
    public function edit(User $admin)
    {
        return inertia('Admins/Form', [
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'username' => $admin->username,
                'profile_photo' => $admin->profile_photo ? asset('storage/' . $admin->profile_photo) : null,
            ]
        ]);
    }

    /**
     * Mengupdate data admin.
     */
    public function update(Request $request, User $admin)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username,' . $admin->id],
            'password' => ['nullable', 'string', Password::defaults()],
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $data = [
            'name' => $request->name,
            'username' => $request->username,
        ];

        // Jika password diisi, update passwordnya
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Jika ada file foto baru yang diupload
        if ($request->hasFile('profile_photo')) {
            // Hapus foto lama jika ada
            if ($admin->profile_photo) {
                Storage::disk('public')->delete($admin->profile_photo);
            }
            // Simpan foto baru
            $data['profile_photo'] = $request->file('profile_photo')->store('profiles', 'public');
        }

        $admin->update($data);
        
        Activity::log('memperbarui profil dan kredensial milik', $admin->name, 'system', route('admins.index'));

        return redirect()->route('admins.index')->with('message', 'Admin updated successfully.');
    }

    /**
     * Menghapus admin.
     */
    public function destroy(User $admin)
    {
        // Mencegah admin menghapus dirinya sendiri (Keamanan ganda selain di UI)
        if (auth()->id() === $admin->id) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        // Hapus foto dari storage jika ada
        if ($admin->profile_photo) {
            Storage::disk('public')->delete($admin->profile_photo);
        }

        // PERBAIKAN: Simpan namanya ke variabel $adminName SEBELUM datanya dihapus dari database
        $adminName = $admin->name;
        
        $admin->delete();

        Activity::log('menghapus akun admin atas nama', $adminName, 'system', route('admins.index'));
        
        return redirect()->route('admins.index')->with('message', 'Admin deleted successfully.');
    }
}