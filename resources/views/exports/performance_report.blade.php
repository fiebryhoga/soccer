<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Performance Report - {{ \Carbon\Carbon::parse($log->date)->format('Y-m-d') }}</title>
    <style>
        /* PENGATURAN KERTAS */
        @page {
            size: A3 landscape;
            margin: 12mm 15mm;
        }

        /* TYPOGRAPHY & BASE */
        body {
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8.5px; /* Disesuaikan agar muat elegan di A3 */
            color: #27272a; /* zinc-800 */
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            -webkit-font-smoothing: antialiased;
        }
        
        /* HEADER DOKUMEN */
        .doc-header {
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 2px solid #09090b; /* zinc-950 */
            padding-bottom: 12px;
        }
        .doc-header table {
            width: 100%;
            border: none;
        }
        .doc-header td {
            border: none;
            vertical-align: bottom;
            padding: 0;
        }
        
        .club-logo { height: 45px; object-fit: contain; margin-bottom: 4px; }
        .club-name {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            color: #09090b;
            letter-spacing: 1px;
        }

        .title-container { text-align: center; }
        .title {
            font-size: 22px;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0 0 6px 0;
            letter-spacing: 1.5px;
            color: #09090b;
        }
        .subtitle {
            font-size: 10px;
            margin: 0;
            color: #71717a; /* zinc-500 */
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .subtitle b { color: #09090b; font-weight: 800; }

        .branding-info { text-align: right; }
        .brand-name {
            font-weight: 900;
            margin: 0 0 3px 0;
            font-size: 14px;
            color: #09090b;
            letter-spacing: 1px;
        }
        .brand-tag {
            font-size: 8px;
            color: #a1a1aa; /* zinc-400 */
            font-weight: bold;
            letter-spacing: 1px;
        }

        /* TABEL UTAMA */
        .table-data {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
        }
        
        /* BORDER DASAR */
        .table-data th, .table-data td {
            border: 1px solid #e4e4e7; /* zinc-200 */
            padding: 5px 3px;
        }
        
        /* GROUPING BORDER (Garis pemisah tebal antar kategori) */
        .border-left-thick { border-left: 2px solid #d4d4d8 !important; }
        .border-right-thick { border-right: 2px solid #d4d4d8 !important; }

        /* HEADER TABEL */
        .table-data thead tr:first-child th {
            background-color: #09090b; /* Hitam pekat shadcn */
            color: #ffffff;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border: 1px solid #09090b;
            padding: 8px 4px;
        }
        
        .table-data thead tr:last-child th {
            background-color: #f4f4f5; /* zinc-100 */
            color: #3f3f46; /* zinc-700 */
            font-size: 7.5px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #a1a1aa; /* zinc-400 */
            border-top: 1px solid #e4e4e7;
        }

        /* BODY TABEL */
        .table-data tbody tr:nth-child(even) { background-color: #fafafa; /* zinc-50 */ }
        .table-data tbody tr:nth-child(odd) { background-color: #ffffff; }
        
        /* FOOTER TABEL (Rata-rata) */
        .table-data tfoot tr td {
            background-color: #f4f4f5; /* zinc-100 */
            border-top: 2px solid #09090b !important;
            border-bottom: 2px solid #09090b !important;
            font-weight: 900;
            color: #09090b;
            font-size: 8.5px;
            padding: 7px 3px;
        }
        
        /* UTILITIES */
        .text-left { text-align: left !important; padding-left: 6px !important; }
        .text-right { text-align: right !important; padding-right: 6px !important; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; color: #09090b; }
        
        /* KOLOM MUTED (Kolom yang dikalkulasi otomatis) */
        .bg-muted { background-color: #f4f4f5; color: #52525b; }
        .table-data tbody tr:nth-child(even) .bg-muted { background-color: #e4e4e7; } /* zinc-200 untuk zebra muted */
        
        .record-val { font-weight: 900; color: #09090b; font-size: 9px; }
        
        /* UKURAN KOLOM KHUSUS */
        .col-id { width: 2%; }
        .col-pos { width: 3%; }
        .col-np { width: 2.5%; }
        .col-name { width: 11%; }
    </style>
</head>
<body>

    @php
        $reportType = strtoupper($log->type ?? 'TRAINING');
        $reportTitle = $reportType === 'MATCH' ? 'MATCH PERFORMANCE REPORT' : 'DAILY TRAINING REPORT';
    @endphp

    <div class="doc-header">
        <table>
            <tr>
                <td style="width: 25%;" class="club-info">
                    @if($club && $club->logo)
                        <img src="{{ public_path('storage/' . $club->logo) }}" alt="Logo" class="club-logo"><br>
                    @endif
                    <div class="club-name">{{ $club->name ?? 'CLUB IDENTITY' }}</div>
                </td>
                <td style="width: 50%;" class="title-container">
                    <h1 class="title">{{ $reportTitle }}</h1>
                    <p class="subtitle">
                        SESI: <b>{{ $log->title ?? 'UNTITLED SESSION' }}</b> &nbsp;|&nbsp; TANGGAL: <b>{{ \Carbon\Carbon::parse($log->date)->translatedFormat('d M Y') }}</b>
                    </p>
                </td>
                <td style="width: 25%;" class="branding-info">
                    <h2 class="brand-name">PERFORMANCE LOG</h2>
                    <div class="brand-tag">GENERATED BY SYSTEM</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="table-data">
        <thead>
            <tr>
                <th colspan="4">PLAYER IDENTITY</th>
                <th class="border-left-thick">DUR</th>
                <th colspan="2" class="border-left-thick">TOTAL DIST</th>
                <th colspan="2" class="border-left-thick">DIST / MIN</th>
                <th colspan="10" class="border-left-thick">DISTANCE ZONES (m)</th>
                <th colspan="10" class="border-left-thick">OTHER METRICS</th>
            </tr>
            <tr>
                <th class="col-id">NO</th>
                <th class="col-pos">POS</th>
                <th class="col-np">NP</th>
                <th class="col-name text-left">NAMA PEMAIN</th>
                
                <th class="border-left-thick">Dur (Mnt)</th>
                
                <th class="border-left-thick">Dist (m)</th>
                <th>% MD</th>
                
                <th class="border-left-thick">Dist/Min</th>
                <th>% MD</th>
                
                <th class="border-left-thick">HIR 18</th>
                <th>% MD</th>
                <th class="bg-muted">HIR >19.8</th>
                <th class="bg-muted">% MD</th>
                <th>HSR 21</th>
                <th>% MD</th>
                <th>SPRINT</th>
                <th>% MD</th>
                <th class="bg-muted">Tot 18kmh+</th>
                <th class="bg-muted">% MD</th>

                <th class="border-left-thick">Accels >3</th>
                <th>Decels >3</th>
                <th>HR 4 Dist</th>
                <th>HR 4 Dur</th>
                <th>HR 5 Dist</th>
                <th>HR 5 Dur</th>
                
                <th>Max Vel</th>
                <th>% MD</th>
                <th class="bg-muted border-right-thick">Highest (Rec)</th>
                
                <th>Plyr Load</th>
            </tr>
        </thead>
        <tbody>
            @foreach($players as $index => $player)
                @php
                    $m = $player->session_metrics ?? [];
                @endphp
                <tr>
                    <td class="font-bold">{{ $index + 1 }}</td>
                    <td class="font-black">{{ $player->position }}</td>
                    <td style="color: #71717a;">{{ str_pad($player->position_number, 2, '0', STR_PAD_LEFT) }}</td>
                    <td class="text-left font-black">{{ $player->name }}</td>
                    
                    <td class="border-left-thick font-bold">{{ $m['total_duration'] ?? '-' }}</td>
                    
                    <td class="border-left-thick font-black">{{ $m['total_distance'] ?? '-' }}</td>
                    <td>{{ isset($m['total_distance_percent']) ? $m['total_distance_percent'] . '%' : '-' }}</td> 
                    
                    <td class="border-left-thick font-black">{{ $m['dist_per_min'] ?? '-' }}</td>
                    <td>{{ isset($m['dist_per_min_percent']) ? $m['dist_per_min_percent'] . '%' : '-' }}</td>

                    <td class="border-left-thick">{{ $m['hir_18_kmh'] ?? '-' }}</td>
                    <td>{{ isset($m['hir_18_kmh_percent']) ? $m['hir_18_kmh_percent'] . '%' : '-' }}</td>
                    
                    <td class="bg-muted font-bold">{{ $m['hir_19_8_kmh'] ?? '-' }}</td>
                    <td class="bg-muted">{{ isset($m['hir_19_8_kmh_percent']) ? $m['hir_19_8_kmh_percent'] . '%' : '-' }}</td>
                    
                    <td>{{ $m['hsr_21_kmh'] ?? '-' }}</td>
                    <td>{{ isset($m['hsr_21_kmh_percent']) ? $m['hsr_21_kmh_percent'] . '%' : '-' }}</td>
                    
                    <td>{{ $m['sprint_distance'] ?? '-' }}</td>
                    <td>{{ isset($m['sprint_distance_percent']) ? $m['sprint_distance_percent'] . '%' : '-' }}</td>
                    
                    <td class="bg-muted font-bold">{{ $m['total_18kmh'] ?? '-' }}</td>
                    <td class="bg-muted">{{ isset($m['total_18kmh_percent']) ? $m['total_18kmh_percent'] . '%' : '-' }}</td>

                    <td class="border-left-thick">{{ $m['accels'] ?? '-' }}</td>
                    <td>{{ $m['decels'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_4_dist'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_4_dur'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_5_dist'] ?? '-' }}</td>
                    <td>{{ $m['hr_band_5_dur'] ?? '-' }}</td>
                    
                    <td class="font-bold">{{ $m['max_velocity'] ?? '-' }}</td>
                    <td>{{ isset($m['max_velocity_percent']) ? $m['max_velocity_percent'] . '%' : '-' }}</td>
                    <td class="bg-muted border-right-thick record-val">{{ $m['highest_velocity'] ?? '-' }}</td>
                    
                    <td class="font-bold">{{ $m['player_load'] ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="border:none; background-color: #ffffff;"></td>
                <td class="text-right font-black" style="letter-spacing: 1px;">TEAM AVERAGE</td>
                
                <td class="border-left-thick"></td>
                
                <td class="border-left-thick">{{ $teamAverage['total_distance'] ?? '-' }}</td>
                <td>{{ isset($teamAverage['total_distance_percent']) ? $teamAverage['total_distance_percent'] . '%' : '-' }}</td>
                
                <td class="border-left-thick">{{ $teamAverage['dist_per_min'] ?? '-' }}</td>
                <td>{{ isset($teamAverage['dist_per_min_percent']) ? $teamAverage['dist_per_min_percent'] . '%' : '-' }}</td>
                
                <td class="border-left-thick">{{ $teamAverage['hir_18_kmh'] ?? '-' }}</td>
                <td>{{ isset($teamAverage['hir_18_kmh_percent']) ? $teamAverage['hir_18_kmh_percent'] . '%' : '-' }}</td>
                
                <td class="bg-muted">{{ $teamAverage['hir_19_8_kmh'] ?? '-' }}</td>
                <td class="bg-muted">{{ isset($teamAverage['hir_19_8_kmh_percent']) ? $teamAverage['hir_19_8_kmh_percent'] . '%' : '-' }}</td>
                
                <td>{{ $teamAverage['hsr_21_kmh'] ?? '-' }}</td>
                <td>{{ isset($teamAverage['hsr_21_kmh_percent']) ? $teamAverage['hsr_21_kmh_percent'] . '%' : '-' }}</td>
                
                <td>{{ $teamAverage['sprint_distance'] ?? '-' }}</td>
                <td>{{ isset($teamAverage['sprint_distance_percent']) ? $teamAverage['sprint_distance_percent'] . '%' : '-' }}</td>
                
                <td class="bg-muted">{{ $teamAverage['total_18kmh'] ?? '-' }}</td>
                <td class="bg-muted">{{ isset($teamAverage['total_18kmh_percent']) ? $teamAverage['total_18kmh_percent'] . '%' : '-' }}</td>
                
                <td class="border-left-thick" colspan="6"></td>
                
                <td>{{ $teamAverage['max_velocity'] ?? '-' }}</td>
                <td>{{ isset($teamAverage['max_velocity_percent']) ? $teamAverage['max_velocity_percent'] . '%' : '-' }}</td>
                <td class="bg-muted border-right-thick"></td>
                
                <td></td>
            </tr>
        </tfoot>
    </table>

</body>
</html>