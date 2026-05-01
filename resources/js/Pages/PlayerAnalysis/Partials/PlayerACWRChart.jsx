// resources/js/Pages/Analysis/Partials/PlayerACWRChart.jsx

import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';

export default function PlayerACWRChart({ data, metricLabel, height = 360 }) {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-xl min-w-[200px]">
                    <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200 mb-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                        {dataPoint.tooltipName || label}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-[11px]">
                                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                                    {entry.name}
                                </span>
                                <span className="font-black tabular-nums text-zinc-900 dark:text-zinc-100">
                                    {Number.isInteger(entry.value) ? entry.value : Number(entry.value).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full relative" style={{ height }}>
            {/* Watermark Judul Variabel */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] z-0 overflow-hidden">
                <span className="text-6xl font-black uppercase tracking-tighter whitespace-nowrap">{metricLabel}</span>
            </div>
            
            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" strokeOpacity={0.15} />
                    
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} dy={10} />
                    
                    {/* Sumbu Y Kiri: Skala untuk Daily, Acute, Chronic (Ratusan/Ribuan) */}
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value} />
                    
                    {/* Sumbu Y Kanan: Skala untuk Rasio ACWR (Angka Desimal Kecil) */}
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#10b981', fontWeight: 700 }} domain={[0, 'dataMax + 0.5']} />
                    
                    {/* ZONA AMAN ACWR (SWEET SPOT) */}
                    <ReferenceArea y1={0.8} y2={1.5} yAxisId="right" fill="#10b981" fillOpacity={0.08} />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#71717a', opacity: 0.05 }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '15px' }} iconType="circle" iconSize={8} />

                    {/* 1. VARIABEL HARIAN: Sebagai Bar transparan di belakang */}
                    <Bar yAxisId="left" dataKey="dailyLoad" name={`${metricLabel} (Daily)`} fill="#71717a" opacity={0.3} radius={[2, 2, 0, 0]} barSize={16} />
                    
                    {/* 2. EWMA ACUTE: Garis Oranye (Sumbu Kiri) */}
                    <Line yAxisId="left" type="monotone" dataKey="acuteLoad" name="EWMA Acute" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#f97316' }} />
                    
                    {/* 3. EWMA CHRONIC: Garis Biru (Sumbu Kiri) */}
                    <Line yAxisId="left" type="monotone" dataKey="chronicLoad" name="EWMA Chronic" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }} />

                    {/* 4. ACWR RATIO: Garis Hijau Utama (Sumbu Kanan) */}
                    <Line yAxisId="right" type="monotone" dataKey="acwr" name="ACWR Ratio" stroke="#10b981" strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}