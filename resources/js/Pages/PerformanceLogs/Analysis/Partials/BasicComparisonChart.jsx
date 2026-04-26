// resources/js/Pages/PerformanceLogs/Analysis/Partials/BasicComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function BasicComparisonChart({ data }) {
    
    // Format data: Menyuntikkan label kustom agar nama sesi dan tag tergabung rapi di Sumbu X
    const chartData = data.map(s => ({
        name: s.title,
        tag: s.tag ? `[${s.tag}]` : '',
        fullName: s.tag ? `${s.title} [${s.tag}]` : s.title,
        distance: parseFloat(s.averages.total_distance) || 0,
        distMin: parseFloat(s.averages.dist_per_min) || 0
    }));

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
            <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Basic Volume Metrics</h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">Perbandingan <span className="text-blue-500">Total Distance (m)</span> dan <span className="text-emerald-500">Distance/min</span> tim.</p>
            </div>

            {/* Tinggi (Height) dinaikkan menjadi 400px karena sekarang formatnya Full Width */}
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.15} />
                        
                        <XAxis 
                            dataKey="fullName" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: '#71717a', fontWeight: 'bold' }}
                            dy={10} // Jarak teks dengan garis
                        />
                        
                        {/* Karena ada 2 satuan yang berbeda (Ribuan meter vs Puluhan meter/menit), kita pakai 2 Sumbu Y */}
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={-10} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={10} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }} // Efek highlight saat di-hover
                        />
                        
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                        
                        <Bar yAxisId="left" dataKey="distance" name="Total Distance (m)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60} />
                        <Bar yAxisId="right" dataKey="distMin" name="Dist/Min (m/min)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}