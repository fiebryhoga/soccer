<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class PerformanceLogExport implements FromView, ShouldAutoSize
{
    protected $log;
    protected $club;
    protected $players;
    protected $teamAverage; // <--- Tambahkan variabel ini

    public function __construct($log, $club, $players, $teamAverage) // <--- Tambahkan parameter
    {
        $this->log = $log;
        $this->club = $club;
        $this->players = $players;
        $this->teamAverage = $teamAverage; // <--- Set parameter
    }

    public function view(): View
    {
        return view('exports.performance_report_excel', [
            'log' => $this->log,
            'club' => $this->club,
            'players' => $this->players,
            'teamAverage' => $this->teamAverage // <--- Kirim ke Blade
        ]);
    }
}