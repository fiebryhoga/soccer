// resources/js/Pages/PerformanceLogs/Analysis/Partials/ACWRChart.jsx

import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';

export default function ACWRChart({ data, metricLabel }) {
    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            {/* Dekorasi Glow Halus di Background (Optional, menambah kesan premium) */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                <div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                        {metricLabel} <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">ACWR TREND</span>
                    </h3>
                    <p className="text-xs font-semibold text-zinc-500 mt-1">Pemantauan keseimbangan beban dengan metode EWMA.</p>
                </div>
                <div className="flex flex-col sm:items-end gap-1.5">
                    <div className="flex items-center gap-2 text-[9px] font-black tracking-wide bg-white dark:bg-zinc-900/80 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe (0 - 1.3)
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Caution (1.3 - 1.5)
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-500">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Danger (&gt;1.5)
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="w-full h-[400px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 0, bottom: 20, left: -20 }}>
                        
                        {/* DEFINISI WARNA GRADIENT UNTUK BAR */}
                        <defs>
                            <linearGradient id="colorAcute" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                        
                        <XAxis 
                            dataKey="xLabel" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} 
                            angle={-25} 
                            textAnchor="end" 
                            height={60} 
                            dy={10} 
                        />
                        
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={-10} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 2.5]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold' }} dx={10} />
                        
                        {/* ZONA WARNA LATAR BELAKANG ACWR (Lebih soft agar grafik utamanya yang menonjol) */}
                        <ReferenceArea yAxisId="right" y1={0.8} y2={1.3} fill="#10b981" fillOpacity={0.03} />
                        <ReferenceArea yAxisId="right" y1={1.3} y2={1.5} fill="#f59e0b" fillOpacity={0.03} />
                        <ReferenceArea yAxisId="right" y1={1.5} y2={3.0} fill="#ef4444" fillOpacity={0.03} />

                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            formatter={(value) => Number(value).toFixed(2)}
                            labelFormatter={(label, payload) => `${payload?.[0]?.payload?.day_name} | ${payload?.[0]?.payload?.name}`}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* METRIK GRAFIK DENGAN WARNA PREMIUM */}
                        <Bar yAxisId="left" dataKey="acute" name="Acute (Kelelahan)" barSize={28} fill="url(#colorAcute)" radius={[6, 6, 0, 0]} />
                        <Line yAxisId="left" type="monotone" dataKey="chronic" name="Chronic (Kebugaran)" stroke="#0ea5e9" strokeWidth={1} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="acwr" name="ACWR (Rasio)" stroke="#f43f5e" strokeWidth={1} dot={{ r: 4, strokeWidth: 2, fill: '#09090b', stroke: '#f43f5e' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}