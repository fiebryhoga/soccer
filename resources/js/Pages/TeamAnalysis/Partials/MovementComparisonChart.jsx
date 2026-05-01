// resources/js/Pages/PerformanceLogs/Analysis/Partials/MovementComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MovementComparisonChart({ data }) {
    
    const chartData = data.map(s => ({
        name: s.title,
        accels: parseFloat(s.averages.accels) || 0,
        decels: parseFloat(s.averages.decels) || 0,
        tooltipLabel: `${s.title} (${s.date})`
    }));

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            {/* Ambient Background Glow (Premium Effect) */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/5 dark:bg-violet-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    MOVEMENT EFFORTS <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">COUNTS</span>
                </h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Total jumlah aksi <span className="text-violet-500 dark:text-violet-400">Akselerasi</span> dan <span className="text-amber-500 dark:text-amber-400">Deselerasi</span> yang melebihi batas 3m/s&sup2;.
                </p>
            </div>

            <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, bottom: 20, left: -20 }}>
                        
                        {/* DEFINISI GRADIENT WARNA UNTUK STACKED BAR */}
                        <defs>
                            <linearGradient id="colorAccels" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0.4}/>
                            </linearGradient>
                            <linearGradient id="colorDecels" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#fcd34d" stopOpacity={0.4}/>
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
                        
                        {/* Tooltip Khusus Angka Bulat */}
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                            formatter={(value) => [Number(value).toFixed(0), undefined]} // Dibulatkan tanpa koma karena ini adalah jumlah (Count)
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* Stacked Bar Chart */}
                        <Bar dataKey="accels" name="Accels (&gt;3m/s&sup2;)" stackId="a" fill="url(#colorAccels)" barSize={40} />
                        {/* Radius diletakkan hanya di elemen tumpukan paling atas (decels) */}
                        <Bar dataKey="decels" name="Decels (&gt;3m/s&sup2;)" stackId="a" fill="url(#colorDecels)" radius={[6, 6, 0, 0]} barSize={40} />
                        
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}