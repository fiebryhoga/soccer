// resources/js/Pages/PerformanceLogs/Analysis/Partials/VelocityComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function VelocityComparisonChart({ data }) {
    const chartData = data.map(s => ({
        name: s.title,
        maxVel: parseFloat(s.averages.max_velocity) || 0,
        percent: parseFloat(s.averages.max_velocity_percent) || 0,
    }));

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
            <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Velocity Analysis</h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Perbandingan <span className="text-blue-500">Max Velocity (km/h)</span> dan <span className="text-amber-500">% Max Velocity</span> terhadap Highest.
                </p>
            </div>

            <div className="h-[400px] w-full">
                {/* Kita ubah dari ComposedChart menjadi BarChart biasa untuk Grouped Bar */}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.15} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                        
                        {/* Sumbu Kiri: km/h (Maksimal normal sprint ~40km/h) */}
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={-10} />
                        
                        {/* Sumbu Kanan: Persentase (Maksimal 100%+) */}
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={10} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                            formatter={(value, name) => {
                                // Otomatis tambahkan simbol % atau km/h di tooltip
                                if (name === '% Max Velocity') return [`${value.toFixed(1)}%`, name];
                                return [`${value.toFixed(2)} km/h`, name];
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                        
                        {/* Dua Bar Bersebelahan */}
                        <Bar yAxisId="left" dataKey="maxVel" name="Max Velocity" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                        <Bar yAxisId="right" dataKey="percent" name="% Max Velocity" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}