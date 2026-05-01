// resources/js/Pages/Analysis/Partials/TrendChart.jsx

import React, { useMemo } from 'react';
import { 
    ResponsiveContainer, ComposedChart, Bar, Line, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area 
} from 'recharts';

export default function TrendChart({ data, metricLabel, height = 320 }) {
    
    // GENERATE ID UNIK AGAR GRADIENT TIDAK BENTROK DI DALAM GRID
    const chartId = useMemo(() => {
        return metricLabel ? metricLabel.replace(/[^a-zA-Z0-9]/g, '') : Math.random().toString(36).substring(7);
    }, [metricLabel]);

    const colorLoadId = `colorLoad-${chartId}`;
    const colorMeanId = `colorMean-${chartId}`;

    // Custom Tooltip Premium (Responsif Dark Mode)
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            
            return (
                <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xl min-w-[180px] z-50">
                    <p className="font-bold text-xs text-zinc-900 dark:text-white mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        {dataPoint.tooltipName || label}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-6 text-[11px]">
                                <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-semibold">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                                    {entry.name}
                                </span>
                                <span className="font-black tabular-nums text-zinc-900 dark:text-white">
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
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Tidak ada data untuk ditampilkan</span>
            </div>
        );
    }

    return (
        <div className="w-full relative flex-1 min-h-0" style={{ height }}>
            {/* Judul Watermark di Belakang */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] z-0 overflow-hidden">
                <span className="text-6xl font-black uppercase tracking-tighter whitespace-nowrap">
                    {metricLabel}
                </span>
            </div>

            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 0, left: -20, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id={colorLoadId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3f3f46" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#71717a" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id={colorMeanId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="currentColor" 
                        className="text-zinc-200 dark:text-zinc-800 opacity-50" 
                    />
                    
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        height={40}
                        tick={(props) => {
                            const { x, y, payload } = props;
                            return (
                                <text x={x} y={y + 10} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400 text-[9px] font-bold" transform={`rotate(-20, ${x}, ${y + 10})`}>
                                    {payload.value}
                                </text>
                            );
                        }}
                    />
                    
                    <YAxis 
                        yAxisId="left"
                        orientation="left"
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
                        domain={[0, dataMax => dataMax === 0 ? 2 : dataMax + 0.5]}
                        tick={(props) => <text x={props.x + 10} y={props.y + 3} textAnchor="start" className="fill-red-500 dark:fill-red-400 text-[9px] font-bold">{props.payload.value}</text>}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', className: 'text-zinc-200 dark:text-zinc-800 opacity-20' }} />
                    
                    <Legend 
                        wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '5px' }}
                        formatter={(value) => <span className="text-zinc-700 dark:text-zinc-300">{value}</span>}
                    />

                    {/* AREA: Mean Daily */}
                    <Area yAxisId="left" type="monotone" dataKey="meanDaily" name="Mean Daily" stroke="#0ea5e9" fill={`url(#${colorMeanId})`} strokeWidth={2} />

                    {/* BAR: Weekly Load */}
                    <Bar yAxisId="left" dataKey="weeklyLoad" name="Weekly Load" fill={`url(#${colorLoadId})`} radius={[4, 4, 0, 0]} barSize={24} />

                    {/* LINE: Strain */}
                    <Line yAxisId="left" type="monotone" dataKey="strain" name="Strain" stroke="#f97316" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, className: 'fill-white dark:fill-zinc-950' }} activeDot={{ r: 5, strokeWidth: 0 }} />

                    {/* LINE: Monotony */}
                    <Line yAxisId="right" type="monotone" dataKey="monotony" name="Monotony" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, className: 'fill-white dark:fill-zinc-950' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}