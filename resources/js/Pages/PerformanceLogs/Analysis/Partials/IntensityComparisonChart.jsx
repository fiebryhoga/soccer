import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function IntensityComparisonChart({ data }) {
    const chartData = data.map(s => ({
        name: s.title,
        hir: parseFloat(s.averages.hir_18_24_kmh) || 0,
        sprint: parseFloat(s.averages.sprint_distance) || 0,
        total18: parseFloat(s.averages.total_18kmh) || 0,
    }));

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
            <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Intensity Distance (m)</h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Perbandingan <span className="text-blue-500">HIR</span>, <span className="text-amber-500">Sprint</span>, dan <span className="text-red-500">Total 18km/h+</span>.
                </p>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.15} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={-10} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                        
                        <Bar dataKey="hir" name="HIR (18-24 km/h)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="sprint" name="Sprint (>24 km/h)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="total18" name="Total 18km/h+" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}