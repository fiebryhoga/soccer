// resources/js/Pages/PerformanceLogs/Partials/SummaryCards.jsx

import React, { useMemo } from 'react';
import { Zap, Flame, Timer, Activity, Users } from 'lucide-react';

export default function SummaryCards({ playersData, isMatch }) {
    
    const squadStats = useMemo(() => {
        if (!playersData || playersData.length === 0) return null;
        
        let topSpeed = 0, totalSprint = 0, totalLoad = 0, validLoadCount = 0, activePlayers = 0;
        const totalPlayers = playersData.length;

        playersData.forEach(p => {
            if (p.is_playing !== false) {
                activePlayers++;
                const speed = parseFloat(p.metrics?.highest_velocity || p.metrics?.max_velocity || 0);
                if (speed > topSpeed) topSpeed = speed;
                const sprint = parseFloat(p.metrics?.sprint_distance || 0);
                if (!isNaN(sprint)) totalSprint += sprint;
                const load = parseFloat(p.metrics?.player_load || 0);
                if (!isNaN(load) && load > 0) { totalLoad += load; validLoadCount++; }
            }
        });

        const readiness = Math.round((activePlayers / totalPlayers) * 100) || 0;
        const avgLoad = validLoadCount > 0 ? (totalLoad / validLoadCount).toFixed(1) : 0;

        return { topSpeed, totalSprint, avgLoad, readiness, activePlayers, totalPlayers };
    }, [playersData]);

    if (!squadStats) return null;

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
                
                <div className="flex-1 py-4 sm:pr-8 sm:py-2">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        {isMatch ? <Users size={14} /> : <Activity size={14} />} 
                        {isMatch ? 'Pemain Tampil' : 'Tingkat Kehadiran'}
                    </p>
                    <div className="flex items-end gap-2">
                        {isMatch ? (
                            <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                {squadStats.activePlayers}
                                <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-500 tracking-normal ml-1">/ {squadStats.totalPlayers}</span>
                            </h3>
                        ) : (
                            <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                {squadStats.readiness}<span className="text-2xl text-zinc-400 dark:text-zinc-500">%</span>
                            </h3>
                        )}
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-3 overflow-hidden">
                        <div className="h-full transition-all duration-1000 ease-out bg-zinc-900 dark:bg-white" style={{ width: `${squadStats.readiness}%` }} />
                    </div>
                </div>

                <div className="flex-1 py-4 sm:px-8 sm:py-2">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Zap size={14} /> Top Speed Sesi</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">{squadStats.topSpeed ? squadStats.topSpeed.toFixed(1) : '-'}</h3>
                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">km/h</span>
                    </div>
                </div>

                <div className="flex-1 py-4 sm:px-8 sm:py-2">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Flame size={14} /> Total Skuad Sprint</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">{squadStats.totalSprint > 0 ? Math.round(squadStats.totalSprint).toLocaleString('id-ID') : '-'}</h3>
                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">meter</span>
                    </div>
                </div>

                <div className="flex-1 py-4 sm:pl-8 sm:py-2">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Timer size={14} /> Rata-Rata Load</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">{squadStats.avgLoad > 0 ? squadStats.avgLoad : '-'}</h3>
                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">AU</span>
                    </div>
                </div>

            </div>
        </div>
    );
}