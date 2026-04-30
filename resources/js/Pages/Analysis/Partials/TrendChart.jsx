// resources/js/Pages/Analysis/Partials/TrendChart.jsx

import React from 'react';
import { 
    ResponsiveContainer, ComposedChart, Bar, Line, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export default function TrendChart({ data, metricLabel, height = 320 }) {
    
    // Custom Tooltip Premium ala Monochrome-Orange
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Ambil data asli dari payload
            const dataPoint = payload[0].payload;
            
            return (
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-xl min-w-[180px]">
                    <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200 mb-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                        {dataPoint.tooltipName || label}
                    </p>
                    <div className="space-y-1.5">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-[11px]">
                                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
                                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                                    {entry.name}
                                </span>
                                <span className="font-black tabular-nums text-zinc-900 dark:text-zinc-100">
                                    {Number.isInteger(entry.value) ? entry.value : Number(entry.value).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Jika data kosong
    if (!data || data.length === 0) {
        return (
            <div className="w-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl" style={{ height }}>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tidak ada data untuk ditampilkan</span>
            </div>
        );
    }

    return (
        <div className="w-full relative" style={{ height }}>
            {/* Judul Watermark di Belakang (Opsional, memberi kesan premium) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] z-0 overflow-hidden">
                <span className="text-6xl font-black uppercase tracking-tighter whitespace-nowrap">
                    {metricLabel}
                </span>
            </div>

            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="#3f3f46" 
                        strokeOpacity={0.15} 
                    />
                    
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }}
                        dy={10}
                    />
                    
                    {/* Y-Axis Kiri: Untuk Load & Strain (Angka Besar) */}
                    <YAxis 
                        yAxisId="left"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }}
                        tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                    />

                    {/* Y-Axis Kanan: Untuk Monotony (Angka Kecil: 0.5 - 3.0) */}
                    <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#ef4444', fontWeight: 700 }}
                        domain={[0, 'dataMax + 0.5']} // Beri sedikit ruang di atas
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#71717a', opacity: 0.05 }} />
                    
                    <Legend 
                        wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }}
                        iconType="circle"
                        iconSize={8}
                    />

                    {/* BAR: Weekly Load (Abu-abu Gelap) */}
                    <Bar 
                        yAxisId="left" 
                        dataKey="weeklyLoad" 
                        name="Weekly Load" 
                        fill="#3f3f46" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                    />

                    {/* BAR: Strain (Orange) */}
                    <Bar 
                        yAxisId="left" 
                        dataKey="strain" 
                        name="Strain" 
                        fill="#f97316" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                    />

                    {/* LINE: Monotony (Merah) */}
                    <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="monotony" 
                        name="Monotony" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}