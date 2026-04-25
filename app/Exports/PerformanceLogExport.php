<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithDrawings; // Tambahkan ini
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing; // Tambahkan ini

class PerformanceLogExport implements FromView, ShouldAutoSize, WithDrawings
{
    protected $log;
    protected $club;
    protected $players;
    protected $teamAverage;

    public function __construct($log, $club, $players, $teamAverage)
    {
        $this->log = $log;
        $this->club = $club;
        $this->players = $players;
        $this->teamAverage = $teamAverage;
    }

    public function view(): View
    {
        return view('exports.performance_report_excel', [
            'log' => $this->log,
            'club' => $this->club,
            'players' => $this->players,
            'teamAverage' => $this->teamAverage
        ]);
    }

    // FUNGSI UNTUK MENYISIPKAN LOGO
    public function drawings()
    {
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Club Logo');
        
        // Cek apakah logo ada, jika tidak gunakan logo default atau kosongkan
        if ($this->club && $this->club->logo) {
            $drawing->setPath(public_path('storage/' . $this->club->logo));
        } else {
            // Bisa diarahkan ke logo default jika perlu
            return [];
        }

        $drawing->setHeight(60); // Tinggi gambar dalam pixel
        $drawing->setCoordinates('A1'); // Letakkan di pojok kiri atas (Sel A1)
        $drawing->setOffsetX(5); // Geser sedikit agar tidak mepet garis
        $drawing->setOffsetY(5);

        return $drawing;
    }
}