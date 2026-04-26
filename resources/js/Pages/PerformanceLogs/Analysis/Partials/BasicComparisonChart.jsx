// resources/js/Pages/PerformanceLogs/Analysis/Partials/BasicComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function BasicComparisonChart({ data }) {
    
    const chartData = data.map(s => ({
        name: s.title,
        totalDistance: parseFloat(s.averages.total_distance) || 0,
        distPerMin: parseFloat(s.averages.dist_per_min) || 0,
        tooltipLabel: `${s.title} (${s.date})`
    }));

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    VOLUME & INTENSITY <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">OVERVIEW</span>
                </h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Perbandingan <span className="text-blue-500 dark:text-blue-400">Total Jarak (m)</span> dan <span className="text-emerald-500 dark:text-emerald-400">Jarak per Menit</span> antar sesi.
                </p>
            </div>

            <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 0, bottom: 20, left: -20 }}>
                        <defs>
                            <linearGradient id="colorTotalDist" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.3}/>
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
                        
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={-10} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={10} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* Bar Chart (Kiri) */}
                        <Bar yAxisId="left" dataKey="totalDistance" name="Total Distance (m)" fill="url(#colorTotalDist)" radius={[6, 6, 0, 0]} barSize={40} />
                        
                        {/* Line Chart (Kanan) */}
                        <Line yAxisId="right" type="monotone" dataKey="distPerMin" name="Distance / Min" stroke="#10b981" strokeWidth={1} dot={{ r: 5, strokeWidth: 2, fill: '#09090b', stroke: '#10b981' }} activeDot={{ r: 2, strokeWidth: 0, fill: '#10b981' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}