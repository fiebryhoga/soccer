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

    public function drawings()
    {
        $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
        $drawing->setName('Logo Klub');
        $drawing->setDescription('Logo');
        
        if ($this->club && $this->club->logo) {
            $logoPath = public_path('storage/' . $this->club->logo);
            if (file_exists($logoPath)) {
                $drawing->setPath($logoPath);
            } else {
                return [];
            }
        } else {
            return [];
        }

        // PERBAIKAN UKURAN LOGO AGAR PAS
        $drawing->setHeight(75); // Kecilkan/paskan tinggi logo (75 pixel biasanya pas untuk 5-6 baris excel)
        
        $drawing->setCoordinates('A1'); // Taruh di sel A1
        $drawing->setOffsetX(10); // Geser 10px dari garis kiri sel A
        $drawing->setOffsetY(10); // Geser 10px dari garis atas sel 1

        return $drawing;
    }
}