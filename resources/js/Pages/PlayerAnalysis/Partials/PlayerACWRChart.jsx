// resources/js/Pages/PerformanceLogs/Analysis/Partials/PlayerACWRChart.jsx

import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea, Area } from 'recharts';

export default function PlayerACWRChart({ data, metricLabel, height = 320 }) {
    
    // ID Unik agar gradient SVG tidak bentrok di Grid
    const chartId = useMemo(() => {
        return metricLabel ? metricLabel.replace(/[^a-zA-Z0-9]/g, '') : Math.random().toString(36).substring(7);
    }, [metricLabel]);

    const colorAcuteId = `colorAcute-${chartId}`;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-xl min-w-[200px] z-50">
                    <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200 mb-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                        {dataPoint.tooltipName || label}
                    </p>
                    <div className="space-y-1.5">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-[11px]">
                                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
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

    if (!data || data.length === 0) {
        return (
            <div className="w-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl" style={{ height }}>
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Tidak ada data</span>
            </div>
        );
    }

    return (
        <div className="w-full relative flex-1 min-h-0" style={{ height }}>
            {/* Watermark Judul Variabel */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] z-0 overflow-hidden">
                <span className="text-5xl font-black uppercase tracking-tighter whitespace-nowrap">{metricLabel}</span>
            </div>
            
            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 5 }}>
                    
                    <defs>
                        <linearGradient id={colorAcuteId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800 opacity-50" />
                    
                    {/* Dark Mode Responsive Axes */}
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        height={40}
                        tick={(props) => {
                            const { x, y, payload } = props;
                            return (
                                <text x={x} y={y + 10} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400 text-[9px] font-bold" transform={`rotate(-25, ${x}, ${y + 10})`}>
                                    {payload.value}
                                </text>
                            );
                        }}
                    />
                    
                    <YAxis 
                        yAxisId="left" 
                        axisLine={false} 
                        tickLine={false} 
                        domain={[0, dataMax => dataMax === 0 ? 100 : Math.ceil(dataMax * 1.2)]}
                        tick={(props) => <text x={props.x - 10} y={props.y + 3} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400 text-[9px] font-semibold">{props.payload.value >= 1000 ? `${(props.payload.value/1000).toFixed(1)}k` : props.payload.value}</text>} 
                    />
                    
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        axisLine={false} 
                        tickLine={false} 
                        domain={[0, 3]} 
                        tick={(props) => <text x={props.x + 10} y={props.y + 3} textAnchor="start" className="fill-emerald-500 dark:fill-emerald-400 text-[9px] font-bold">{props.payload.value}</text>} 
                    />
                    
                    {/* ZONA AMAN ACWR (SWEET SPOT) */}
                    <ReferenceArea y1={0.8} y2={1.5} yAxisId="right" fill="#10b981" fillOpacity={0.05} />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', className: 'text-zinc-200 dark:text-zinc-800 opacity-20' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '10px' }} formatter={(value) => <span className="text-zinc-700 dark:text-zinc-300">{value}</span>} />

                    {/* 1. DAILY LOAD (Bar Background Gelap) */}
                    <Bar yAxisId="left" dataKey="dailyLoad" name="Daily Load" fill="#3f3f46" radius={[2, 2, 0, 0]} barSize={24} />
                    
                    {/* 2. EWMA ACUTE (Area Oranye) */}
                    <Area yAxisId="left" type="monotone" dataKey="acuteLoad" name="EWMA Acute" stroke="#f97316" fill={`url(#${colorAcuteId})`} strokeWidth={2} activeDot={{ r: 4, strokeWidth: 0, fill: '#f97316' }} />
                    
                    {/* 3. EWMA CHRONIC (Garis Biru) */}
                    <Line yAxisId="left" type="monotone" dataKey="chronicLoad" name="EWMA Chronic" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" activeDot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }} />

                    {/* 4. ACWR RATIO (Garis Hijau Utama Sumbu Kanan) */}
                    <Line yAxisId="right" type="monotone" dataKey="acwr" name="ACWR Ratio" stroke="#10b981" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, className: 'fill-white dark:fill-zinc-950' }} activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}