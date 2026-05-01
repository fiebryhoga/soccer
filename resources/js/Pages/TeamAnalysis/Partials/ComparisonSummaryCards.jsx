import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Gauge, Zap, Weight } from 'lucide-react';

export default function ComparisonSummaryCards({ data }) {
    
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        // Urutkan berdasarkan tanggal terlama ke terbaru
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

        const getDelta = (metricId) => {
            if (sortedData.length < 2) return null;
            const first = parseFloat(sortedData[0].averages[metricId]) || 0;
            const last = parseFloat(sortedData[sortedData.length - 1].averages[metricId]) || 0;
            
            if (first === 0) return { val: 0, text: '0%', trend: 'neutral' };
            
            const diff = ((last - first) / first) * 100;
            return {
                val: diff,
                text: `${Math.abs(diff).toFixed(1)}%`,
                trend: diff > 5 ? 'up' : diff < -5 ? 'down' : 'neutral' // Threshold 5% dianggap netral
            };
        };

        const getHighest = (metricId) => {
            let max = -1;
            let sessionName = '-';
            sortedData.forEach(s => {
                const val = parseFloat(s.averages[metricId]) || 0;
                if (val > max) { max = val; sessionName = s.title || s.date; }
            });
            return { val: max, sessionName };
        };

        return {
            volume: {
                label: 'Total Jarak (Volume)',
                icon: Activity,
                delta: getDelta('total_distance'),
                highest: getHighest('total_distance'),
                format: 'm'
            },
            intensity: {
                label: 'Jarak Sprint (Intensitas)',
                icon: Zap,
                delta: getDelta('sprint_distance'),
                highest: getHighest('sprint_distance'),
                format: 'm'
            },
            workload: {
                label: 'Player Load (Beban)',
                icon: Weight,
                delta: getDelta('player_load'),
                highest: getHighest('player_load'),
                format: ''
            },
            speed: {
                label: 'Max Velocity (Top Speed)',
                icon: Gauge,
                delta: getDelta('max_velocity'),
                highest: getHighest('max_velocity'),
                format: 'km/h'
            }
        };
    }, [data]);

    if (!summary || data.length < 2) return null;

    const renderTrendBadge = (delta) => {
        if (!delta) return null;
        if (delta.trend === 'up') return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-[10px] font-black"><TrendingUp size={12} strokeWidth={3}/> +{delta.text}</span>;
        if (delta.trend === 'down') return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-[10px] font-black"><TrendingDown size={12} strokeWidth={3}/> -{delta.text}</span>;
        return <span className="flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 rounded-md text-[10px] font-black"><Minus size={12} strokeWidth={3}/> {delta.text}</span>;
    };

    const isCompareTwo = data.length === 2;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(summary).map(([key, item]) => {
                const Icon = item.icon;
                return (
                    <div key={key} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{item.label}</h4>
                            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-400"><Icon size={16} /></div>
                        </div>
                        
                        <div className="relative z-10">
                            {isCompareTwo ? (
                                <div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{item.delta?.trend === 'up' ? 'Naik' : item.delta?.trend === 'down' ? 'Turun' : 'Stabil'}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                                        <span className="text-[10px] font-semibold text-zinc-500">Vs Sesi Sebelumnya:</span>
                                        {renderTrendBadge(item.delta)}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-end gap-1 mb-2">
                                        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{item.highest.val}</span>
                                        <span className="text-xs font-bold text-zinc-400 mb-1">{item.format}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                                        <span className="text-[10px] font-semibold text-zinc-500">Puncak tertinggi di:</span>
                                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-500 px-2 py-1 rounded truncate max-w-[120px]">{item.highest.sessionName}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}