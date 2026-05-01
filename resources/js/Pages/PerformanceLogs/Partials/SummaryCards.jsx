// resources/js/Pages/PerformanceLogs/Partials/SummaryCards.jsx

import React, { useMemo } from 'react';
import { Users, Activity, TrendingUp } from 'lucide-react';

export default function SummaryCards({ playersData }) {
    
    // Kalkulasi Data Summary
    const summary = useMemo(() => {
        if (!playersData) return { totalPlayers: 0, activePlayers: 0, benchPlayers: 0, participationRate: 0 };
        
        const totalPlayers = playersData.length;
        // Hitung pemain yang is_playing = true (berarti datanya ada/ikut sesi)
        const activePlayers = playersData.filter(p => p.is_playing !== false).length;
        const benchPlayers = totalPlayers - activePlayers;
        const participationRate = totalPlayers > 0 ? Math.round((activePlayers / totalPlayers) * 100) : 0;

        return { totalPlayers, activePlayers, benchPlayers, participationRate };
    }, [playersData]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Total Pemain Terlibat */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Pemain Aktif</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{summary.activePlayers}</h3>
                        <span className="text-sm font-semibold text-zinc-500 mb-1">/ {summary.totalPlayers}</span>
                    </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Users size={24} />
                </div>
            </div>

            {/* Card 2: Persentase Kehadiran */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Kehadiran</p>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{summary.participationRate}%</h3>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Activity size={24} />
                </div>
            </div>

            {/* Card 3: Pemain Absen / Bench */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Bench / Absen</p>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{summary.benchPlayers}</h3>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl">
                    <TrendingUp size={24} />
                </div>
            </div>
        </div>
    );
}