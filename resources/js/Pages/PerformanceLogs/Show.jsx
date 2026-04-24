import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics'; // Pakai list kolom yang sama

export default function Show({ log, players, existing_metrics }) {
    const { data, setData, post } = useForm({ players_data: [] });
    const [preview, setPreview] = useState(existing_metrics || {});

    const handlePaste = (e) => {
        e.preventDefault();
        const rows = e.clipboardData.getData('text').split('\n').map(r => r.split('\t'));
        let payload = [];
        
        rows.forEach(row => {
            if (row.length < 5) return;
            const np = parseInt(row[2]); // NP ada di kolom 3 (indeks 2)
            const player = players.find(p => p.position_number === np);
            
            if (player) {
                const metrics = {
                    total_distance: row[5],
                    dist_per_min: row[7],
                    accels: row[10],
                    // ... petakan semua kolom sesuai urutan excel Anda
                };
                payload.push({ player_id: player.id, metrics });
            }
        });
        setData('players_data', payload);
        // Update state lokal untuk tampil di tabel
    };

    return (
        <AuthenticatedLayout headerTitle={`Log ${log.type.toUpperCase()}: ${log.date}`}>
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <textarea onPaste={handlePaste} placeholder="PASTE DATA EXCEL DI SINI..." className="w-full h-20 mb-6 p-4 border-2 border-dashed rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800" />
                
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-900">
                            <tr>
                                <th className="p-3">NO</th>
                                <th className="p-3">PEMAIN</th>
                                <th className="p-3">POS</th>
                                {FIXED_EXCEL_COLUMNS.map(col => <th key={col.id} className="p-3">{col.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(player => (
                                <tr key={player.id} className="border-b dark:border-zinc-800">
                                    <td className="p-3 font-bold">{player.position_number}</td>
                                    <td className="p-3 font-bold">{player.name}</td>
                                    <td className="p-3">{player.position}</td>
                                    {FIXED_EXCEL_COLUMNS.map(col => (
                                        <td key={col.id} className="p-3 text-zinc-500">
                                            {/* Ambil dari state preview */}
                                            {preview[player.id]?.metrics?.[col.id] || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}