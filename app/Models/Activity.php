<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'action', 'target', 'type', 'is_read', 'href'])]
class Activity extends Model
{
    /**
     * Relasi ke User yang melakukan aksi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Fungsi Helper untuk mencatat log dengan 1 baris kode.
     */
    public static function log(string $action, string $target, string $type = 'system', string $href = '#')
    {
        self::create([
            'user_id' => auth()->id(), // Ambil ID user yang sedang login
            'action'  => $action,
            'target'  => $target,
            'type'    => $type,
            'href'    => $href,
        ]);
    }
}