<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Performance Report</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }
        
        /* HEADER STYLES */
        .header {
            width: 100%;
            border-bottom: 3px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 15px;
        }
        .header table {
            width: 100%;
            border: none;
        }
        .header td {
            border: none;
            vertical-align: middle;
            padding: 0;
        }
        
        /* CLUB INFO */
        .club-info {
            text-align: left;
        }
        .club-logo {
            height: 55px;
            margin-bottom: 4px;
        }
        .club-name {
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
            color: #111827;
            letter-spacing: 0.5px;
        }

        /* TITLE INFO */
        .title-container {
            text-align: center;
        }
        .title {
            font-size: 22px;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
            color: #000;
        }
        .subtitle {
            font-size: 12px;
            margin: 0;
            color: #4b5563;
        }
        .subtitle b {
            color: #111827;
        }

        /* BRANDING INFO */
        .branding-info {
            text-align: right;
            vertical-align: top;
        }
        .brand-name {
            font-weight: 900;
            margin: 0;
            font-size: 18px;
            color: #111827;
            letter-spacing: 1px;
        }
        .brand-tag {
            font-size: 9px;
            color: #6b7280;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        /* TABLE STYLES */
        table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 5px 4px;
        }
        
        /* Header Grouping (Baris 1) */
        thead tr:first-child th {
            background-color: #d1d5db;
            color: #111827;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #9ca3af;
            border-top: 2px solid #9ca3af;
            border-right: 2px solid #9ca3af;
            border-left: 2px solid #9ca3af;
        }
        
        /* Header Kolom (Baris 2) */
        thead tr:last-child th {
            background-color: #f3f4f6;
            color: #374151;
            font-size: 9px;
            font-weight: bold;
        }

        /* Tbody Styling */
        tbody tr:nth-child(even) {
            background-color: #f9fafb; /* Zebra striping */
        }
        tbody td {
            color: #1f2937;
        }
        
        /* Utility Classes */
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .highlight { color: #2563eb; font-weight: bold; } /* Opsional untuk highlight persentase */
        
        /* Column Widths */
        .col-id { width: 2%; }
        .col-pos { width: 3%; }
        .col-np { width: 3%; }
        .col-name { width: 12%; text-align: left;}
    </style>
</head>
<body>

    @php
        // Menentukan judul laporan berdasarkan tipe sesi
        $reportType = strtoupper($log->type ?? 'TRAINING');
        $reportTitle = $reportType === 'MATCH' ? 'MATCH PERFORMANCE REPORT' : 'DAILY TRAINING REPORT';
    @endphp

    <div class="header">
        <table>
            <tr>
                <td style="width: 25%;" class="club-info">
                    @if($club && $club->logo)
                        <img src="{{ public_path('storage/' . $club->logo) }}" alt="Logo" class="club-logo"><br>
                    @endif
                    <div class="club-name">{{ $club->name ?? 'CLUB LOGO' }}</div>
                </td>
                <td style="width: 50%;" class="title-container">
                    <h1 class="title">{{ $reportTitle }}</h1>
                    <p class="subtitle">
                        Session: <b>{{ $log->title ?? 'N/A' }}</b> | {{ \Carbon\Carbon::parse($log->date)->translatedFormat('l, d M Y') }}
                    </p>
                </td>
                <td style="width: 25%;" class="branding-info">
                    <h2 class="brand-name">SOCCER ANALYSIS</h2>
                    <div class="brand-tag">PERFORMANCE TRACKING SYSTEM</div>
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th colspan="4">PLAYER IDENTITY</th>
                <th>DUR</th>
                <th colspan="2">TOTAL DIST</th>
                <th colspan="2">DIST/MIN</th>
                <th colspan="10">DISTANCE (m)</th>
                <th colspan="10">OTHER METRICS</th>
            </tr>
            <tr>
                <th class="col-id">NO</th>
                <th class="col-pos">POS</th>
                <th class="col-np">NP</th>
                <th class="col-name">NAME</th>
                
                <th>Total Dur</th>
                <th>Tot Dist (m)</th>
                <th>% Tot Dist</th>
                <th>Dist /min</th>
                <th>% Dist/min</th>
                
                <th>HIR 18</th>
                <th>% HIR 18</th>
                <th>HIR >19.8</th>
                <th>% HIR >19.8</th>
                <th>HSR 21</th>
                <th>% HSR 21</th>
                <th>SPRINT</th>
                <th>% SPRINT</th>
                <th>Tot 18kmh+</th>
                <th>% Tot 18kmh+</th>

                <th>Accels >3</th>
                <th>Decels >3</th>
                <th>HR Band 4 Dist</th>
                <th>HR Band 4 Dur</th>
                <th>HR Band 5 Dist</th>
                <th>HR Band 5 Dur</th>
                <th>Max Vel (km/h)</th>
                <th>% Max Vel</th>
                <th>Highest Session</th>
                <th>Player Load</th>
            </tr>
        </thead>
        <tbody>
            @foreach($players as $index => $player)
                @php
                    $m = $player->session_metrics ?? [];
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td class="font-bold">{{ $player->position }}</td>
                    <td>{{ str_pad($player->position_number, 2, '0', STR_PAD_LEFT) }}</td>
                    <td class="text-left font-bold">{{ $player->name }}</td>
                    
                    <td>{{ $m['total_duration'] ?? '-' }}</td>
                    
                    <td>{{ $m['total_distance'] ?? '-' }}</td>
                    <td>{{ isset($m['total_distance_percent']) ? $m['total_distance_percent'] . '%' : '-' }}</td> 
                    
                    <td>{{ $m['dist_per_min'] ?? '-' }}</td>
                    <td>{{ isset($m['dist_per_min_percent']) ? $m['dist_per_min_percent'] . '%' : '-' }}</td>

                    <td>{{ $m['hir_18_kmh'] ?? '-' }}</td>
                    <td>{{ isset($m['hir_18_kmh_percent']) ? $m['hir_18_kmh_percent'] . '%' : '-' }}</td>
                    
                    <td>{{ $m['hir_19_8_kmh'] ?? '-' }}</td>
                    <td>{{ isset($m['hir_19_8_kmh_percent']) ? $m['hir_19_8_kmh_percent'] . '%' : '-' }}</td>
                    
                    <td>{{ $m['hsr_21_kmh'] ?? '-' }}</td>
                    <td>{{ isset($m['hsr_21_kmh_percent']) ? $m['hsr_21_kmh_percent'] . '%' : '-' }}</td>
                    
                    <td>{{ $m['sprint_distance'] ?? '-' }}</td>
                    <td>{{ isset($m['sprint_distance_percent']) ? $m['sprint_distance_percent'] . '%' : '-' }}</td>
                    
                    <td>{{ $m['total_18kmh'] ?? '-' }}</td>
                    <td>{{ isset($m['total_18kmh_percent']) ? $m['total_18kmh_percent'] . '%' : '-' }}</td>

                    <td>{{ $m['accels'] ?? '-' }}</td>
                    <td>{{ $m['decels'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_4_dist'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_4_dur'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_5_dist'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_5_dur'] ?? '-' }}</td>
                    
                    <td class="font-bold">{{ $m['max_velocity'] ?? '-' }}</td>
                    <td>{{ isset($m['max_velocity_percent']) ? $m['max_velocity_percent'] . '%' : '-' }}</td>
                    <td class="font-bold text-emerald-600">{{ $m['highest_velocity'] ?? '-' }}</td>
                    
                    <td>{{ $m['player_load'] ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="border:none;"></td>
                <td style="font-weight: bold; background-color: #f3f4f6; text-align:right;">TEAM AVERAGE</td>
                <td style="background-color: #f3f4f6;"></td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['total_distance'] ?? '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ isset($teamAverage['total_distance_percent']) ? $teamAverage['total_distance_percent'] . '%' : '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['dist_per_min'] ?? '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ isset($teamAverage['dist_per_min_percent']) ? $teamAverage['dist_per_min_percent'] . '%' : '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['hir_18_kmh'] ?? '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ isset($teamAverage['hir_18_kmh_percent']) ? $teamAverage['hir_18_kmh_percent'] . '%' : '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['hir_19_8_kmh'] ?? '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ isset($teamAverage['hir_19_8_kmh_percent']) ? $teamAverage['hir_19_8_kmh_percent'] . '%' : '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['hsr_21_kmh'] ?? '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ isset($teamAverage['hsr_21_kmh_percent']) ? $teamAverage['hsr_21_kmh_percent'] . '%' : '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['sprint_distance'] ?? '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ isset($teamAverage['sprint_distance_percent']) ? $teamAverage['sprint_distance_percent'] . '%' : '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['total_18kmh'] ?? '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ isset($teamAverage['total_18kmh_percent']) ? $teamAverage['total_18kmh_percent'] . '%' : '-' }}</td>
                <td colspan="6" style="background-color: #f3f4f6;"></td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['max_velocity'] ?? '-' }}</td>
                <td style="font-weight: bold; background-color: #f3f4f6;">{{ isset($teamAverage['max_velocity_percent']) ? $teamAverage['max_velocity_percent'] . '%' : '-' }}</td>
                <td colspan="2" style="background-color: #f3f4f6;"></td>
            </tr>
        </tfoot>
    </table>

</body>
</html>