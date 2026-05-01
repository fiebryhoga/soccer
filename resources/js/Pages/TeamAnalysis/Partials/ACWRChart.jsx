// resources/js/Pages/PerformanceLogs/Analysis/Partials/ACWRChart.jsx

import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';

export default function ACWRChart({ data, metricLabel }) {
    
    // BIKIN ID UNIK AGAR GRADIENT TIDAK CRASH SAAT DITAMPILKAN DI GRID
    const chartId = useMemo(() => {
        return metricLabel ? metricLabel.replace(/[^a-zA-Z0-9]/g, '') : Math.random().toString(36).substring(7);
    }, [metricLabel]);

    const colorAcuteId = `colorAcute-${chartId}`;

    // Custom Tooltip Recharts berbalut class Tailwind Dark Mode
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dayName = payload[0]?.payload?.day_name;
            const sessionName = payload[0]?.payload?.name;
            return (
                <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xl text-zinc-900 dark:text-white text-xs z-50">
                    <p className="font-bold text-zinc-900 dark:text-white mb-1">{dayName}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-2">{sessionName}</p>
                    
                    <div className="flex flex-col gap-2.5">
                        {payload.map((entry, index) => {
                            return (
                                <div key={index} className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: entry.color }}></div>
                                        <span className="font-semibold text-zinc-600 dark:text-zinc-400">{entry.name}:</span>
                                    </div>
                                    <span className="font-black text-sm text-zinc-900 dark:text-white">{Number(entry.value).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 lg:p-5 rounded-xl shadow-sm transition-colors relative overflow-hidden flex flex-col w-full h-[320px]">
            
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10 shrink-0">
                <div>
                    <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">
                        {metricLabel || 'Metrik'} <span className="text-zinc-400 dark:text-zinc-500 font-bold ml-1">ACWR</span>
                    </h3>
                </div>
                
                {/* Legenda Indikator Warna ACWR */}
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-black tracking-wide bg-white dark:bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Ctn
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-500">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Dgr
                    </span>
                </div>
            </div>
            
            {/* Ketinggian Fix agar fleksibel di Grid */}
            <div className="w-full flex-1 min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 0, bottom: 5, left: -20 }}>
                        
                        <defs>
                            <linearGradient id={colorAcuteId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800 opacity-50" />
                        
                        <XAxis 
                            dataKey="xLabel" 
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
                        <YAxis yAxisId="right" orientation="right" domain={[0, 2.5]} axisLine={false} tickLine={false} tick={(props) => <text x={props.x + 10} y={props.y + 3} textAnchor="start" className="fill-zinc-500 dark:fill-zinc-400 text-[9px] font-bold">{props.payload.value}</text>} />
                        
                        <ReferenceArea yAxisId="right" y1={0.8} y2={1.3} className="fill-emerald-500" fillOpacity={0.05} />
                        <ReferenceArea yAxisId="right" y1={1.3} y2={1.5} className="fill-amber-500" fillOpacity={0.05} />
                        <ReferenceArea yAxisId="right" y1={1.5} y2={3.0} className="fill-red-500" fillOpacity={0.05} />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', className: 'text-zinc-200 dark:text-zinc-800 opacity-20' }} />
                        <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '10px', fontWeight: 'bold' }} formatter={(value) => <span className="text-zinc-700 dark:text-zinc-300">{value}</span>} />
                        
                        <Bar yAxisId="left" dataKey="acute" name="Acute (Kelelahan)" barSize={24} fill={`url(#${colorAcuteId})`} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="left" type="monotone" dataKey="chronic" name="Chronic (Kebugaran)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="acwr" name="ACWR (Rasio)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, className: 'fill-white dark:fill-zinc-950 stroke-red-500' }} activeDot={{ r: 5, strokeWidth: 0, className: 'fill-red-500' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}