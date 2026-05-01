// resources/js/Pages/PerformanceLogs/Analysis/Partials/TrendChart.jsx

import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function TrendChart({ data, metricLabel }) {
    
    // BIKIN ID UNIK AGAR GRADIENT TIDAK CRASH SAAT DITAMPILKAN BANYAK (GRID)
    const chartId = useMemo(() => {
        return metricLabel ? metricLabel.replace(/[^a-zA-Z0-9]/g, '') : Math.random().toString(36).substring(7);
    }, [metricLabel]);

    const colorLoadId = `colorLoad-${chartId}`;
    const colorMeanId = `colorMean-${chartId}`;

    const enrichedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map(item => {
            let meanDaily = item.meanDaily || 0;
            let stdDev = item.stdDev || 0;
            
            if (item.stats) {
                const activeKey = Object.keys(item.stats).find(key => 
                    item.stats[key].weeklyLoad === item.weeklyLoad
                );
                if (activeKey) {
                    meanDaily = item.stats[activeKey].meanDaily;
                    stdDev = item.stats[activeKey].stdDev;
                }
            }
            return { ...item, meanDaily, stdDev };
        });
    }, [data]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const titleLabel = payload[0]?.payload?.tooltipName || label;
            return (
                <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-xl z-50 min-w-[180px]">
                    <p className="font-bold text-xs text-zinc-900 dark:text-white mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        {titleLabel}
                    </p>
                    <div className="flex flex-col gap-2">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-6 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">{entry.name}:</span>
                                </div>
                                <span className="font-black text-zinc-900 dark:text-white">
                                    {Number(entry.value).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm transition-colors relative overflow-hidden flex flex-col w-full h-[320px]">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-2 flex flex-col relative z-10 shrink-0">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">
                    {metricLabel || 'Metrik'} <span className="text-zinc-400 dark:text-zinc-500 font-bold ml-1">TRENDS</span>
                </h3>
            </div>
            
            {/* HEIGHT WAJIB FIX (flex-1 min-h-0) AGAR RESPONSIVE CONTAINER JALAN DI FLEXBOX */}
            <div className="w-full flex-1 min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={enrichedData} margin={{ top: 10, right: 0, bottom: 5, left: -20 }}>
                        
                        <defs>
                            <linearGradient id={colorLoadId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id={colorMeanId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800 opacity-50" />
                        
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
                        
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} domain={[0, dataMax => dataMax === 0 ? 100 : Math.ceil(dataMax * 1.2)]} tick={(props) => <text x={props.x - 10} y={props.y + 3} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">{props.payload.value}</text>} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={(props) => <text x={props.x + 10} y={props.y + 3} textAnchor="start" className="fill-zinc-500 dark:fill-zinc-400 text-[9px] font-bold">{props.payload.value}</text>} />
                        
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', className: 'text-zinc-200 dark:text-zinc-800 opacity-20' }} />
                        
                        <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '10px', fontWeight: 'bold' }} formatter={(value) => <span className="text-zinc-700 dark:text-zinc-300">{value}</span>} />
                        
                        <Area yAxisId="left" type="monotone" dataKey="meanDaily" name="Mean Daily" stroke="#0ea5e9" fill={`url(#${colorMeanId})`} strokeWidth={2} />
                        <Bar yAxisId="left" dataKey="weeklyLoad" name="Weekly Load" barSize={30} fill={`url(#${colorLoadId})`} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="left" type="monotone" dataKey="stdDev" name="Std. Deviation" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        
                        <Line yAxisId="right" type="monotone" dataKey="monotony" name="Monotony" stroke="#10b981" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, className: 'fill-white dark:fill-zinc-950' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                        <Line yAxisId="left" type="monotone" dataKey="strain" name="Strain" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, className: 'fill-white dark:fill-zinc-950' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                        
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}