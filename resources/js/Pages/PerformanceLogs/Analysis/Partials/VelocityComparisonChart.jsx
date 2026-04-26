// resources/js/Pages/PerformanceLogs/Analysis/Partials/VelocityComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function VelocityComparisonChart({ data }) {
    
    const chartData = data.map(s => ({
        name: s.title,
        maxVel: parseFloat(s.averages.max_velocity) || 0,
        percent: parseFloat(s.averages.max_velocity_percent) || 0,
        tooltipLabel: `${s.title} (${s.date})`
    }));

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            {/* Ambient Background Glow (Premium Effect) */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    VELOCITY <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">ANALYSIS</span>
                </h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Perbandingan <span className="text-cyan-500 dark:text-cyan-400">Max Velocity (km/h)</span> dan <span className="text-amber-500 dark:text-amber-400">Persentase (%)</span> terhadap rekor tertinggi pemain.
                </p>
            </div>

            <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, bottom: 20, left: -20 }}>
                        
                        {/* DEFINISI GRADIENT WARNA */}
                        <defs>
                            <linearGradient id="colorMaxVel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#67e8f9" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#fcd34d" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                        
                        {/* X-Axis Miring untuk Teks Panjang */}
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
                        
                        {/* Sumbu Kiri: km/h */}
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={-10} />
                        
                        {/* Sumbu Kanan: Persentase (%) */}
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={10} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                            formatter={(value, name) => {
                                if (name.includes('%')) return [`${Number(value).toFixed(1)}%`, name];
                                return [`${Number(value).toFixed(2)} km/h`, name];
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* Dua Bar Bersebelahan dengan Gradient */}
                        <Bar yAxisId="left" dataKey="maxVel" name="Max Velocity" fill="url(#colorMaxVel)" radius={[6, 6, 0, 0]} barSize={36} />
                        <Bar yAxisId="right" dataKey="percent" name="% Max Velocity" fill="url(#colorPercent)" radius={[6, 6, 0, 0]} barSize={36} />
                        
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}