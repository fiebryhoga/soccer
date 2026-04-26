import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SpeedZoneChart({ data }) {
    
    // Kalkulasi pemecahan jarak
    const chartData = data.map(s => {
        const total = parseFloat(s.averages.total_distance) || 0;
        const sprint = parseFloat(s.averages.sprint_distance) || 0;
        const hir = parseFloat(s.averages.hir_18_24_kmh) || 0;
        
        // Jarak sisa (Low/Mid) = Total - HIR - Sprint
        const lowMid = Math.max(0, total - hir - sprint);

        return {
            name: s.title,
            lowMid,
            hir,
            sprint,
            total,
            tooltipLabel: `${s.title} (${s.date})`
        };
    });

    // Kustomisasi Tooltip agar menampilkan Jarak (m) dan Persentase (%)
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] min-w-[200px]">
                    <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                        {data.tooltipLabel}
                    </p>
                    <div className="space-y-2.5">
                        {/* SPRINT */}
                        <div className="flex items-center justify-between gap-4 text-xs font-bold">
                            <div className="flex items-center gap-1.5 text-rose-500">
                                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Sprint
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-900 dark:text-zinc-100">{data.sprint.toFixed(0)}m</span>
                                <span className="text-[10px] text-zinc-500 w-8 text-right tabular-nums">{((data.sprint / data.total) * 100 || 0).toFixed(1)}%</span>
                            </div>
                        </div>
                        {/* HIR */}
                        <div className="flex items-center justify-between gap-4 text-xs font-bold">
                            <div className="flex items-center gap-1.5 text-amber-500">
                                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> HIR
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-900 dark:text-zinc-100">{data.hir.toFixed(0)}m</span>
                                <span className="text-[10px] text-zinc-500 w-8 text-right tabular-nums">{((data.hir / data.total) * 100 || 0).toFixed(1)}%</span>
                            </div>
                        </div>
                        {/* LOW/MID */}
                        <div className="flex items-center justify-between gap-4 text-xs font-bold">
                            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                <span className="w-2.5 h-2.5 rounded bg-zinc-400 dark:bg-zinc-600"></span> Low/Mid
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-900 dark:text-zinc-100">{data.lowMid.toFixed(0)}m</span>
                                <span className="text-[10px] text-zinc-500 w-8 text-right tabular-nums">{((data.lowMid / data.total) * 100 || 0).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    SPEED ZONE <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">DISTRIBUTION</span>
                </h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Komposisi jarak berdasarkan zona kecepatan tempuh pemain.
                </p>
            </div>

            <div className="h-[350px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    {/* Menggunakan layout="vertical" agar grafik baloknya memanjang ke samping */}
                    <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#52525b" opacity={0.15} />
                        
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dy={5} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontWeight: 'bold' }} width={80} />
                        
                        <Tooltip cursor={{ fill: '#3f3f46', opacity: 0.1 }} content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* StackId="a" membuat ketiga balok ini bersambung (menumpuk) */}
                        <Bar dataKey="lowMid" name="Low/Mid Speed" stackId="a" fill="#71717a" barSize={36} opacity={0.4} />
                        <Bar dataKey="hir" name="HIR (18-24 km/h)" stackId="a" fill="#f59e0b" barSize={36} opacity={0.85} />
                        <Bar dataKey="sprint" name="Sprint (>24 km/h)" stackId="a" fill="#f43f5e" barSize={36} radius={[0, 6, 6, 0]} opacity={0.9} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}