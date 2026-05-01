// resources/js/Pages/PerformanceLogs/Analysis/Partials/PlayerLoadComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function PlayerLoadComparisonChart({ data }) {
    
    const chartData = data.map(s => ({
        name: s.title,
        load: parseFloat(s.averages.player_load) || 0,
        tooltipLabel: `${s.title} (${s.date})`
    }));

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            {/* Ambient Background Glow (Premium Effect) */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    PLAYER LOAD <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">ANALYSIS</span>
                </h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Perbandingan akumulasi beban mekanis sesi (<span className="text-teal-600 dark:text-teal-400">Player Load</span>) yang mencerminkan total volume kerja.
                </p>
            </div>

            <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, bottom: 20, left: -20 }}>
                        
                        {/* DEFINISI GRADIENT WARNA */}
                        <defs>
                            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.9}/> {/* teal-600 */}
                                <stop offset="95%" stopColor="#5eead4" stopOpacity={0.3}/> {/* teal-300 */}
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                        
                        {/* X-Axis Miring agar teks sesi yang panjang tidak tertumpuk */}
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
                        
                        {/* Tooltip Presisi 2 Desimal */}
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                            formatter={(value) => [Number(value).toFixed(2), 'Total Load']} 
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                        />
                        
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* Bar Gradient Player Load */}
                        <Bar 
                            dataKey="load" 
                            name="Player Load (AU)" 
                            fill="url(#colorLoad)" 
                            radius={[6, 6, 0, 0]} 
                            barSize={40} 
                        />
                        
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}