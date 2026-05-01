{{-- resources/views/exports/performance_report_excel.blade.php --}}
@php
    $isMatch = strtolower($log->type) === 'match';
    
    $clubName = strtoupper($club->name ?? 'CLUB NAME');
    $reportTitle = $isMatch ? "MATCH PERFORMANCE REPORT $clubName" : "DAILY TRAINING REPORT $clubName";
    
    $totalCols = 15 + ($isMatch ? 2 + 12 : 1 + 10);
    $distColspan = $isMatch ? 12 : 10;
    $durColspan = $isMatch ? 2 : 1;
@endphp

<table>
    <thead>
        <tr>
            <th colspan="4"></th>
            <th colspan="{{ $totalCols - 8 }}" style="font-weight: bold; font-size: 20px; text-align: center; vertical-align: middle;">
                {{ $reportTitle }}
            </th>
            <th colspan="4" style="font-weight: bold; font-size: 14px; text-align: right; vertical-align: middle;">
                SOCCER ANALYSIS
            </th>
        </tr>
        <tr>
            <th colspan="4"></th>
            <th colspan="{{ $totalCols - 8 }}" style="text-align: center; font-size: 12px; color: #4b5563; vertical-align: middle;">
                Session: {{ $log->title ?? 'N/A' }} | {{ \Carbon\Carbon::parse($log->date)->translatedFormat('l, d M Y') }}
            </th>
            <th colspan="4" style="text-align: right; font-style: italic; font-size: 10px; color: #4b5563; vertical-align: middle;">
                Performance Tracking System
            </th>
        </tr>

        <tr><th colspan="{{ $totalCols }}"></th></tr>
        <tr><th colspan="{{ $totalCols }}"></th></tr>
        <tr><th colspan="{{ $totalCols }}"></th></tr>

        <tr>
            <th colspan="4" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #1f2937; color: #ffffff;">PLAYER IDENTITY</th>
            <th colspan="{{ $durColspan }}" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #374151; color: #ffffff;">DURATION</th>
            <th colspan="{{ $distColspan }}" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #1f2937; color: #ffffff;">DISTANCE METRICS</th>
            <th colspan="11" style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #374151; color: #ffffff;">INTENSITY & OTHER METRICS</th>
        </tr>

        <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">NO</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">POS</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">NP</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: left;">NAMA PEMAIN</th>
            
            @if($isMatch)
                <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">1 ST</th>
                <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">2 ND</th>
            @else
                <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Total Dur</th>
            @endif
            
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Total Dist (m)</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #e5e7eb;">% Total Dist</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Dist/min</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #e5e7eb;">% Dist/min</th>
            
            @if($isMatch)
                <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Dist 1 ST</th>
                <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Dist 2 ND</th>
            @endif

            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HIR 18-24.5</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #e5e7eb;">% HIR</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">SPRINT >24.5</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #e5e7eb;">% SPRINT</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Total >18kmh</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #e5e7eb;">% Tot >18</th>

            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Accels >3</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Decels >3</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HR 4 Dist</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HR 4 Dur</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HR 5 Dist</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">HR 5 Dur</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Max Vel (km/h)</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #e5e7eb;">% Max Vel</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Highest (Record)</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center;">Player Load</th>
            <th style="border: 1px solid #000000; font-weight: bold; text-align: center; background-color: #e5e7eb;">% PL</th>
        </tr>
    </thead>
    <tbody>
        @foreach($players as $index => $player)
            @php $m = $player->session_metrics ?? []; @endphp
            <tr>
                <td style="border: 1px solid #000000; text-align: center;">{{ $index + 1 }}</td>
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold;">{{ $player->position }}</td>
                <td style="border: 1px solid #000000; text-align: center; font-style: italic;">{{ str_pad($player->position_number, 2, '0', STR_PAD_LEFT) }}</td>
                <td style="border: 1px solid #000000; text-align: left; font-weight: bold;">{{ $player->name }}</td>
                
                @if($isMatch)
                    <td style="border: 1px solid #000000; text-align: center;">{{ $m['duration_1st'] ?? '-' }}</td>
                    <td style="border: 1px solid #000000; text-align: center;">{{ $m['duration_2nd'] ?? '-' }}</td>
                @else
                    <td style="border: 1px solid #000000; text-align: center;">{{ $m['total_duration'] ?? '-' }}</td>
                @endif
                
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['total_distance'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; background-color: #f9fafb; font-weight: bold;">{{ isset($m['total_distance_percent']) ? $m['total_distance_percent'] . '%' : '-' }}</td> 
                
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['dist_per_min'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; background-color: #f9fafb; font-weight: bold;">{{ isset($m['dist_per_min_percent']) ? $m['dist_per_min_percent'] . '%' : '-' }}</td>

                @if($isMatch)
                    <td style="border: 1px solid #000000; text-align: center;">{{ $m['distance_1st'] ?? '-' }}</td>
                    <td style="border: 1px solid #000000; text-align: center;">{{ $m['distance_2nd'] ?? '-' }}</td>
                @endif

                <td style="border: 1px solid #000000; text-align: center;">{{ $m['hir_18_24_kmh'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; background-color: #f9fafb; font-weight: bold;">{{ isset($m['hir_18_24_kmh_percent']) ? $m['hir_18_24_kmh_percent'] . '%' : '-' }}</td>
                
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['sprint_distance'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; background-color: #f9fafb; font-weight: bold;">{{ isset($m['sprint_distance_percent']) ? $m['sprint_distance_percent'] . '%' : '-' }}</td>
                
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['total_18kmh'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; background-color: #f9fafb; font-weight: bold;">{{ isset($m['total_18kmh_percent']) ? $m['total_18kmh_percent'] . '%' : '-' }}</td>

                <td style="border: 1px solid #000000; text-align: center;">{{ $m['accels'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['decels'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['hr_band_4_dist'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['hr_band_4_dur'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['hr_band_5_dist'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['hr_band_5_dur'] ?? '-' }}</td>
                
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['max_velocity'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; background-color: #f9fafb; font-weight: bold;">{{ isset($m['max_velocity_percent']) ? $m['max_velocity_percent'] . '%' : '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #ffedd5;">{{ $m['highest_velocity'] ?? '-' }}</td>
                
                <td style="border: 1px solid #000000; text-align: center;">{{ $m['player_load'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; background-color: #f9fafb; font-weight: bold;">{{ isset($m['player_load_percent']) ? $m['player_load_percent'] . '%' : '-' }}</td>
            </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="3" style="border: none;"></td>
            <td style="border: 1px solid #000000; font-weight: bold; text-align: right; background-color: #f3f4f6;">TEAM AVERAGE</td>
            
            @if($isMatch)
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['duration_1st'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['duration_2nd'] ?? '-' }}</td>
            @else
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['total_duration'] ?? '-' }}</td>
            @endif
            
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['total_distance'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #e5e7eb;">{{ isset($teamAverage['total_distance_percent']) ? $teamAverage['total_distance_percent'] . '%' : '-' }}</td>
            
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['dist_per_min'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #e5e7eb;">{{ isset($teamAverage['dist_per_min_percent']) ? $teamAverage['dist_per_min_percent'] . '%' : '-' }}</td>
            
            @if($isMatch)
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['distance_1st'] ?? '-' }}</td>
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['distance_2nd'] ?? '-' }}</td>
            @endif

            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['hir_18_24_kmh'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #e5e7eb;">{{ isset($teamAverage['hir_18_24_kmh_percent']) ? $teamAverage['hir_18_24_kmh_percent'] . '%' : '-' }}</td>
            
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['sprint_distance'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #e5e7eb;">{{ isset($teamAverage['sprint_distance_percent']) ? $teamAverage['sprint_distance_percent'] . '%' : '-' }}</td>
            
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['total_18kmh'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #e5e7eb;">{{ isset($teamAverage['total_18kmh_percent']) ? $teamAverage['total_18kmh_percent'] . '%' : '-' }}</td>
            
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['accels'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['decels'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['hr_band_4_dist'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['hr_band_4_dur'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['hr_band_5_dist'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['hr_band_5_dur'] ?? '-' }}</td>
            
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['max_velocity'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #e5e7eb;">{{ isset($teamAverage['max_velocity_percent']) ? $teamAverage['max_velocity_percent'] . '%' : '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">-</td>
            
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f3f4f6;">{{ $teamAverage['player_load'] ?? '-' }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #e5e7eb;">{{ isset($teamAverage['player_load_percent']) ? $teamAverage['player_load_percent'] . '%' : '-' }}</td>
        </tr>
    </tfoot>
</table>