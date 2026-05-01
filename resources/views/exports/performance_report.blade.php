<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Performance Report - {{ \Carbon\Carbon::parse($log->date)->format('Y-m-d') }}</title>
    <style>
        @page {
            size: A3 landscape;
            margin: 12mm 15mm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8.5px;
            color: #27272a; 
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        
        .doc-header {
            width: 100%;
            margin-bottom: 15px;
            border-bottom: 3px solid #18181b; 
            padding-bottom: 10px;
        }
        .doc-header table { width: 100%; border-collapse: collapse; }
        .doc-header td { border: none; vertical-align: middle; padding: 0; }
        
        .club-logo { height: 50px; object-fit: contain; margin-bottom: 2px; }
        .title {
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 4px 0;
            letter-spacing: 1px;
            color: #09090b;
        }
        .subtitle {
            font-size: 10px;
            margin: 0;
            color: #52525b; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .subtitle b { color: #09090b; }

        .brand-name {
            font-weight: bold;
            margin: 0 0 2px 0;
            font-size: 14px;
            color: #09090b;
            letter-spacing: 1px;
        }
        .brand-tag {
            font-size: 8px;
            color: #71717a; 
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .table-data {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
        }
        
        .table-data th, .table-data td {
            border: 1px solid #d4d4d8; 
            padding: 6px 3px;
        }

        .group-header th {
            background-color: #18181b; 
            color: #ffffff;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border: 1px solid #18181b;
            padding: 8px 4px;
        }
        .group-header th.alt-bg {
            background-color: #3f3f46; 
            border: 1px solid #3f3f46;
        }

        .sub-header th {
            background-color: #f4f4f5; 
            color: #18181b; 
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 2px solid #a1a1aa; 
        }

        .table-data tbody tr:nth-child(even) { background-color: #fafafa; }
        .table-data tbody tr:nth-child(odd) { background-color: #ffffff; }
        
        /* FOOTER TABEL (Team Average) - DESAIN DIPERBAIKI (PREMIUM MONOCHROME) */
        .table-data tfoot tr td {
            background-color: #f4f4f5; 
            color: #09090b; 
            border-top: 2px solid #09090b !important;
            border-bottom: 2px solid #09090b !important;
            font-weight: 900;
            font-size: 8.5px;
            padding: 7px 3px;
        }
        .table-data tfoot .bg-target {
            background-color: #e4e4e7;
        }
        
        .text-left { text-align: left !important; padding-left: 6px !important; }
        .text-right { text-align: right !important; padding-right: 6px !important; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; color: #09090b; }
        
        .bg-target { background-color: #f4f4f5; color: #52525b; font-weight: bold; }
        .table-data tbody tr:nth-child(even) .bg-target { background-color: #e4e4e7; } 
        
        .record-val { font-weight: bold; color: #09090b; font-size: 9px; background-color: #f4f4f5; }
        
        .col-id { width: 2%; }
        .col-pos { width: 3%; }
        .col-np { width: 2.5%; }
        .col-name { width: 12%; }
    </style>
</head>
<body>

    @php
        $isMatch = strtolower($log->type ?? 'training') === 'match';
        $clubName = strtoupper($club->name ?? 'CLUB NAME');
        $reportTitle = $isMatch ? "MATCH PERFORMANCE REPORT $clubName" : "DAILY TRAINING REPORT $clubName";
        $durColspan = $isMatch ? 2 : 1;
        $distColspan = $isMatch ? 12 : 10;
    @endphp

    <div class="doc-header">
        <table>
            <tr>
                <td style="width: 20%;" class="text-left">
                    @if($club && $club->logo)
                        <img src="{{ public_path('storage/' . $club->logo) }}" alt="Logo" class="club-logo">
                    @endif
                </td>
                <td style="width: 60%; text-align: center;">
                    <h1 class="title">{{ $reportTitle }}</h1>
                    <p class="subtitle">
                        SESI: <b>{{ $log->title ?? 'N/A' }}</b> &nbsp;|&nbsp; TANGGAL: <b>{{ \Carbon\Carbon::parse($log->date)->translatedFormat('d F Y') }}</b>
                    </p>
                </td>
                <td style="width: 20%;" class="branding-info">
                    <h2 class="brand-name">SOCCER ANALYSIS</h2>
                    <div class="brand-tag">PERFORMANCE TRACKING SYSTEM</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="table-data">
        <thead>
            <tr class="group-header">
                <th colspan="4">PLAYER IDENTITY</th>
                <th colspan="{{ $durColspan }}" class="alt-bg">DURATION</th>
                <th colspan="{{ $distColspan }}">DISTANCE METRICS</th>
                <th colspan="11" class="alt-bg">INTENSITY & OTHER METRICS</th>
            </tr>
            <tr class="sub-header">
                <th class="col-id">NO</th>
                <th class="col-pos">POS</th>
                <th class="col-np">NP</th>
                <th class="col-name text-left">NAMA PEMAIN</th>
                
                @if($isMatch)
                    <th>1 ST</th>
                    <th>2 ND</th>
                @else
                    <th>Total Dur</th>
                @endif
                
                <th>Total Dist</th>
                <th class="bg-target">% Total Dist</th>
                <th>Dist/min</th>
                <th class="bg-target">% Dist/min</th>
                
                @if($isMatch)
                    <th>Dist 1 ST</th>
                    <th>Dist 2 ND</th>
                @endif

                <th>HIR 18-24.5</th>
                <th class="bg-target">% HIR</th>
                <th>SPRINT >24.5</th>
                <th class="bg-target">% SPRINT</th>
                <th>Total >18kmh</th>
                <th class="bg-target">% Tot >18</th>

                <th>Accels >3</th>
                <th>Decels >3</th>
                <th>HR 4 Dist</th>
                <th>HR 4 Dur</th>
                <th>HR 5 Dist</th>
                <th>HR 5 Dur</th>
                
                <th>Max Vel</th>
                <th class="bg-target">% Max Vel</th>
                <th class="record-val">Highest (Rec)</th>
                
                <th>Plyr Load</th>
                <th class="bg-target">% PL</th>
            </tr>
        </thead>
        <tbody>
            @foreach($players as $index => $player)
                @php $m = $player->session_metrics ?? []; @endphp
                <tr>
                    <td class="font-bold">{{ $index + 1 }}</td>
                    <td class="font-bold">{{ $player->position }}</td>
                    <td style="color: #71717a; font-style: italic;">{{ str_pad($player->position_number, 2, '0', STR_PAD_LEFT) }}</td>
                    <td class="text-left font-bold">{{ $player->name }}</td>
                    
                    @if($isMatch)
                        <td>{{ $m['duration_1st'] ?? '-' }}</td>
                        <td>{{ $m['duration_2nd'] ?? '-' }}</td>
                    @else
                        <td>{{ $m['total_duration'] ?? '-' }}</td>
                    @endif
                    
                    <td class="font-bold">{{ $m['total_distance'] ?? '-' }}</td>
                    <td class="bg-target">{{ isset($m['total_distance_percent']) ? $m['total_distance_percent'] . '%' : '-' }}</td> 
                    
                    <td>{{ $m['dist_per_min'] ?? '-' }}</td>
                    <td class="bg-target">{{ isset($m['dist_per_min_percent']) ? $m['dist_per_min_percent'] . '%' : '-' }}</td>

                    @if($isMatch)
                        <td>{{ $m['distance_1st'] ?? '-' }}</td>
                        <td>{{ $m['distance_2nd'] ?? '-' }}</td>
                    @endif

                    <td>{{ $m['hir_18_24_kmh'] ?? '-' }}</td>
                    <td class="bg-target">{{ isset($m['hir_18_24_kmh_percent']) ? $m['hir_18_24_kmh_percent'] . '%' : '-' }}</td>
                    
                    <td>{{ $m['sprint_distance'] ?? '-' }}</td>
                    <td class="bg-target">{{ isset($m['sprint_distance_percent']) ? $m['sprint_distance_percent'] . '%' : '-' }}</td>
                    
                    <td class="font-bold">{{ $m['total_18kmh'] ?? '-' }}</td>
                    <td class="bg-target">{{ isset($m['total_18kmh_percent']) ? $m['total_18kmh_percent'] . '%' : '-' }}</td>

                    <td>{{ $m['accels'] ?? '-' }}</td>
                    <td>{{ $m['decels'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_4_dist'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_4_dur'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_5_dist'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_5_dur'] ?? '-' }}</td>
                    
                    <td class="font-bold">{{ $m['max_velocity'] ?? '-' }}</td>
                    <td class="bg-target">{{ isset($m['max_velocity_percent']) ? $m['max_velocity_percent'] . '%' : '-' }}</td>
                    <td class="record-val">{{ $m['highest_velocity'] ?? '-' }}</td>
                    
                    <td class="font-bold">{{ $m['player_load'] ?? '-' }}</td>
                    <td class="bg-target">{{ isset($m['player_load_percent']) ? $m['player_load_percent'] . '%' : '-' }}</td>
                </tr>
            @endforeach
        </tbody>
        
        <tfoot>
            <tr>
                <td colspan="3" style="background-color: #ffffff; border: none;"></td>
                <td class="text-right font-black" style="letter-spacing: 1px;">TEAM AVERAGE</td>
                
                @if($isMatch)
                    <td>{{ $teamAverage['duration_1st'] ?? '-' }}</td>
                    <td>{{ $teamAverage['duration_2nd'] ?? '-' }}</td>
                @else
                    <td>{{ $teamAverage['total_duration'] ?? '-' }}</td>
                @endif
                
                <td class="font-black">{{ $teamAverage['total_distance'] ?? '-' }}</td>
                <td class="bg-target">{{ isset($teamAverage['total_distance_percent']) ? $teamAverage['total_distance_percent'] . '%' : '-' }}</td>
                
                <td>{{ $teamAverage['dist_per_min'] ?? '-' }}</td>
                <td class="bg-target">{{ isset($teamAverage['dist_per_min_percent']) ? $teamAverage['dist_per_min_percent'] . '%' : '-' }}</td>
                
                @if($isMatch)
                    <td>{{ $teamAverage['distance_1st'] ?? '-' }}</td>
                    <td>{{ $teamAverage['distance_2nd'] ?? '-' }}</td>
                @endif
                
                <td>{{ $teamAverage['hir_18_24_kmh'] ?? '-' }}</td>
                <td class="bg-target">{{ isset($teamAverage['hir_18_24_kmh_percent']) ? $teamAverage['hir_18_24_kmh_percent'] . '%' : '-' }}</td>
                
                <td>{{ $teamAverage['sprint_distance'] ?? '-' }}</td>
                <td class="bg-target">{{ isset($teamAverage['sprint_distance_percent']) ? $teamAverage['sprint_distance_percent'] . '%' : '-' }}</td>
                
                <td class="font-black">{{ $teamAverage['total_18kmh'] ?? '-' }}</td>
                <td class="bg-target">{{ isset($teamAverage['total_18kmh_percent']) ? $teamAverage['total_18kmh_percent'] . '%' : '-' }}</td>
                
                {{-- PERBAIKAN: METRIK YANG HILANG DIKEMBALIKAN --}}
                <td>{{ $teamAverage['accels'] ?? '-' }}</td>
                <td>{{ $teamAverage['decels'] ?? '-' }}</td>
                <td>{{ $teamAverage['hr_band_4_dist'] ?? '-' }}</td>
                <td>{{ $teamAverage['hr_band_4_dur'] ?? '-' }}</td>
                <td>{{ $teamAverage['hr_band_5_dist'] ?? '-' }}</td>
                <td>{{ $teamAverage['hr_band_5_dur'] ?? '-' }}</td>
                
                <td>{{ $teamAverage['max_velocity'] ?? '-' }}</td>
                <td class="bg-target">{{ isset($teamAverage['max_velocity_percent']) ? $teamAverage['max_velocity_percent'] . '%' : '-' }}</td>
                <td class="record-val" style="background-color: #e4e4e7;"></td> {{-- Tidak ada rata-rata untuk Highest Record --}}
                
                <td>{{ $teamAverage['player_load'] ?? '-' }}</td>
                <td class="bg-target">{{ isset($teamAverage['player_load_percent']) ? $teamAverage['player_load_percent'] . '%' : '-' }}</td>
            </tr>
        </tfoot>
    </table>

</body>
</html>