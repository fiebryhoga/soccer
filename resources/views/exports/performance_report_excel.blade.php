@php
    $reportType = strtoupper($log->type ?? 'TRAINING');
    $reportTitle = $reportType === 'MATCH' ? 'MATCH PERFORMANCE REPORT' : 'DAILY TRAINING REPORT';
@endphp

<table>
    <thead>
        <tr>
            <th colspan="4" style="font-weight: bold; font-size: 14px;">{{ $club->name ?? 'CLUB NAME' }}</th>
            <th colspan="12" style="font-weight: bold; font-size: 16px; text-align: center;">{{ $reportTitle }}</th>
            <th colspan="13" style="font-weight: bold; font-size: 14px; text-align: right;">SOCCER ANALYSIS</th>
        </tr>
        <tr>
            <th colspan="4"></th>
            <th colspan="12" style="text-align: center;">Session: {{ $log->title ?? 'N/A' }} | {{ \Carbon\Carbon::parse($log->date)->translatedFormat('l, d M Y') }}</th>
            <th colspan="13" style="text-align: right; font-style: italic;">Performance Tracking System</th>
        </tr>
        <tr>
            <th colspan="29"></th> </tr>

        <tr>
            <th colspan="4" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #f3f4f6;">PLAYER IDENTITY</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #f3f4f6;">DUR</th>
            <th colspan="2" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #f3f4f6;">TOTAL DIST</th>
            <th colspan="2" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #f3f4f6;">DIST/MIN</th>
            <th colspan="10" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #f3f4f6;">DISTANCE (m)</th>
            <th colspan="10" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #f3f4f6;">OTHER METRICS</th>
        </tr>

        <tr>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">NO</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">POS</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">NP</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: left;">NAME</th>
            
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Total Dur</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Tot Dist (m)</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">% Tot Dist</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Dist /min</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">% Dist/min</th>
            
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HIR 18</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">% HIR 18</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HIR >19.8</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">% HIR >19.8</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HSR 21</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">% HSR 21</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">SPRINT</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">% SPRINT</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Tot 18kmh+</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">% Tot 18kmh+</th>

            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Accels >3</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Decels >3</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HR Band 4 Dist</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HR Band 4 Dur</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HR Band 5 Dist</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HR Band 5 Dur</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Max Vel (km/h)</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">% Max Vel</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Highest Session</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Player Load</th>
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
                    <td style="border: 1px solid #000000; text-align: center;">{{ $m['highest_velocity'] ?? '-' }}</td>
                    
                    <td>{{ $m['player_load'] ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="border:none;"></td>
                <td style="border: 1px solid #000000; text-align: center; text-align:right;">TEAM AVERAGE</td>
                <td style="background-color: #f3f4f6;"></td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $teamAverage['total_distance'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($teamAverage['total_distance_percent']) ? $teamAverage['total_distance_percent'] . '%' : '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $teamAverage['dist_per_min'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($teamAverage['dist_per_min_percent']) ? $teamAverage['dist_per_min_percent'] . '%' : '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $teamAverage['hir_18_kmh'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($teamAverage['hir_18_kmh_percent']) ? $teamAverage['hir_18_kmh_percent'] . '%' : '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $teamAverage['hir_19_8_kmh'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($teamAverage['hir_19_8_kmh_percent']) ? $teamAverage['hir_19_8_kmh_percent'] . '%' : '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $teamAverage['hsr_21_kmh'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($teamAverage['hsr_21_kmh_percent']) ? $teamAverage['hsr_21_kmh_percent'] . '%' : '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $teamAverage['sprint_distance'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($teamAverage['sprint_distance_percent']) ? $teamAverage['sprint_distance_percent'] . '%' : '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $teamAverage['total_18kmh'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($teamAverage['total_18kmh_percent']) ? $teamAverage['total_18kmh_percent'] . '%' : '-' }}</td>
                <td colspan="6" style="background-color: #f3f4f6;"></td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $teamAverage['max_velocity'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($teamAverage['max_velocity_percent']) ? $teamAverage['max_velocity_percent'] . '%' : '-' }}</td>
                <td colspan="2" style="background-color: #f3f4f6;"></td>
            </tr>
        </tfoot>
</table>