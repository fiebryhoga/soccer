// resources/js/Pages/PerformanceLogs/Analysis/Partials/IntensityComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function IntensityComparisonChart({ data }) {
    
    const chartData = data.map(s => ({
        name: s.title,
        hir: parseFloat(s.averages.hir_18_24_kmh) || 0,
        sprint: parseFloat(s.averages.sprint_distance) || 0,
        total18: parseFloat(s.averages.total_18kmh) || 0,
        tooltipLabel: `${s.title} (${s.date})`
    }));

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/5 dark:bg-rose-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    HIGH INTENSITY <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">RUNNING</span>
                </h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Komparasi <span className="text-amber-500 dark:text-amber-400">HIR (18-24 km/h)</span>, <span className="text-rose-500 dark:text-rose-400">Sprint (&gt;24 km/h)</span>, dan <span className="text-violet-500 dark:text-violet-400">Total (&gt;18 km/h)</span>.
                </p>
            </div>

            <div className="h-[400px] w-full relative z-10">
                {/* Mengubah ComposedChart menjadi BarChart Murni */}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, bottom: 20, left: -20 }}>
                        <defs>
                            <linearGradient id="colorHIR" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#fcd34d" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="colorSprint" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#fda4af" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                        
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} 
                            angle={-20} 
                            textAnchor="end" 
                            height={60} 
                            dy={10} 
                        />
                        
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={-10} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                            formatter={(value) => [`${Number(value).toFixed(0)} m`, undefined]} 
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* Ketiga Data Diubah Menjadi Bar Semua dengan barSize yang sedikit dirampingkan */}
                        <Bar dataKey="hir" name="HIR (18-24 km/h)" fill="url(#colorHIR)" radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar dataKey="sprint" name="Sprint (&gt;24 km/h)" fill="url(#colorSprint)" radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar dataKey="total18" name="Total (&gt;18 km/h)" fill="url(#colorTotal)" radius={[4, 4, 0, 0]} barSize={24} />
                        
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}