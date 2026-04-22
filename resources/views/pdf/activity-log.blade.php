<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Activity Log Export</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #222; padding-bottom: 10px; }
        .header h2 { margin: 0; padding: 0; font-size: 20px; }
        .header p { margin: 5px 0 0; color: #666; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
        th { background-color: #f4f4f4; font-size: 11px; text-transform: uppercase; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .badge { display: inline-block; padding: 3px 6px; font-size: 10px; border-radius: 4px; color: #fff; }
        .bg-system { background-color: #f59e0b; }
        .bg-create { background-color: #10b981; }
        .bg-update { background-color: #3b82f6; }
        .bg-delete { background-color: #f43f5e; }
        .bg-default { background-color: #6b7280; }
    </style>
</head>
<body>

    <div class="header">
        <h2>Laporan Jejak Aktivitas (Activity Log)</h2>
        <p>Diekspor pada: {{ $export_date }}</p>
        @if(!empty($filters['date']))
            <p>Filter Tanggal: {{ \Carbon\Carbon::parse($filters['date'])->translatedFormat('d F Y') }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th width="15%">Waktu</th>
                <th width="15%">Pelaku (User)</th>
                <th width="25%">Aksi</th>
                <th width="10%">Tipe</th>
                <th width="15%">IP Address</th>
                <th width="15%">Perangkat / OS</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($activities as $log)
                <tr>
                    <td>{{ $log->created_at->format('Y-m-d H:i:s') }}</td>
                    <td>{{ $log->user ? $log->user->name : 'System' }}</td>
                    <td>{{ $log->action }} <strong>"{{ $log->target }}"</strong></td>
                    <td>
                        @php
                            $typeClass = 'bg-default';
                            if($log->type == 'system') $typeClass = 'bg-system';
                            elseif(in_array($log->type, ['create', 'add'])) $typeClass = 'bg-create';
                            elseif(in_array($log->type, ['update', 'edit'])) $typeClass = 'bg-update';
                            elseif(in_array($log->type, ['delete', 'remove'])) $typeClass = 'bg-delete';
                        @endphp
                        <span class="badge {{ $typeClass }}">{{ strtoupper($log->type) }}</span>
                    </td>
                    <td>{{ $log->ip_address ?? '-' }}</td>
                    {{-- Batasi user_agent agar tidak merusak lebar tabel --}}
                    <td>{{ Str::limit($log->user_agent, 100) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center;">Tidak ada data aktivitas.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>