import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MovementComparisonChart({ data }) {
    const chartData = data.map(s => ({
        name: s.title,
        accels: parseFloat(s.averages.accels) || 0,
        decels: parseFloat(s.averages.decels) || 0,
    }));

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
            <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Movement Efforts (Counts)</h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Total aksi <span className="text-indigo-500">Akselerasi</span> dan <span className="text-rose-500">Deselerasi</span> (&gt;3m/s²).
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
                        
                        {/* StackId yang sama membuat bar menumpuk */}
                        <Bar dataKey="accels" name="Accels (>3m/s²)" stackId="a" fill="#6366f1" barSize={50} />
                        <Bar dataKey="decels" name="Decels (>3m/s²)" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}