import React from 'react';

export default function PlayerMetricsTable({ playerMetrics }) {
    if (!playerMetrics || playerMetrics.length === 0) return null;

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-between items-center">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Detail Metrik Pemain</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-xs font-black text-zinc-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Pemain</th>
                            <th className="px-6 py-4 text-right">Distance (m)</th>
                            <th className="px-6 py-4 text-right">Sprint (m)</th>
                            <th className="px-6 py-4 text-right">Max Speed</th>
                            <th className="px-6 py-4 text-right">Accels</th>
                            <th className="px-6 py-4 text-right">Decels</th>
                            <th className="px-6 py-4 text-right">Load</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {playerMetrics.map((pm, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{pm.player?.name}</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">{pm.player?.position} • #{pm.player?.position_number}</div>
                                </td>
                                <td className="px-6 py-4 text-right tabular-nums font-medium">{pm.metrics?.total_distance || '-'}</td>
                                <td className="px-6 py-4 text-right tabular-nums font-medium">{pm.metrics?.sprint_distance || '-'}</td>
                                <td className="px-6 py-4 text-right tabular-nums font-medium">{pm.metrics?.max_velocity || '-'}</td>
                                <td className="px-6 py-4 text-right tabular-nums font-medium">{pm.metrics?.accels || '-'}</td>
                                <td className="px-6 py-4 text-right tabular-nums font-medium">{pm.metrics?.decels || '-'}</td>
                                <td className="px-6 py-4 text-right tabular-nums font-medium">{pm.metrics?.player_load || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}