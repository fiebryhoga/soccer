// resources/js/Pages/PerformanceLogs/Analysis/Partials/TrendChart.jsx

import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function TrendChart({ data, metricLabel }) {
    
    // SMART EXTRACTOR: Menarik meanDaily dan stdDev dari data stats otomatis
    // Tanpa perlu merombak ulang file parent (StrainMonotony.jsx)
    const enrichedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map(item => {
            let meanDaily = item.meanDaily || 0;
            let stdDev = item.stdDev || 0;
            
            // Mencari key metrik yang sedang aktif dari object stats
            if (item.stats) {
                const activeKey = Object.keys(item.stats).find(key => 
                    item.stats[key].weeklyLoad === item.weeklyLoad
                );
                if (activeKey) {
                    meanDaily = item.stats[activeKey].meanDaily;
                    stdDev = item.stats[activeKey].stdDev;
                }
            }
            
            return { ...item, meanDaily, stdDev };
        });
    }, [data]);

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            {/* Ambient Background Glow (Premium Effect) */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    {metricLabel} <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">TRENDS</span>
                </h3>
                <p className="text-xs font-medium text-zinc-500 mt-1 max-w-2xl">
                    Perbandingan komprehensif antara Load, Mean Daily, Standard Deviation, Strain, dan Monotony dari waktu ke waktu.
                </p>
            </div>
            
            <div className="w-full h-[450px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={enrichedData} margin={{ top: 20, right: 0, bottom: 20, left: -20 }}>
                        
                        {/* DEFINISI GRADIENT WARNA UNTUK BAR & AREA */}
                        <defs>
                            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="colorMean" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                        
                        {/* FORMAT TANGGAL MIRING AGAR MUAT BANYAK */}
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} 
                            angle={-25} 
                            textAnchor="end" 
                            height={60} 
                            dy={10} 
                        />
                        
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={-10} />
                        {/* Sumbu Kanan khusus Monotony (Skalanya lebih kecil: 1.0 - 3.0) */}
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold' }} dx={10} />
                        
                        {/* TOOLTIP & LEGEND */}
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            formatter={(value, name) => [Number(value).toFixed(2), name]} // Kunci Desimal 2 Angka
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipName || label}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* 1. AREA: Mean Daily (Background Dasar) */}
                        <Area yAxisId="left" type="monotone" dataKey="meanDaily" name="Mean Daily" stroke="#0ea5e9" fill="url(#colorMean)" strokeWidth={1} />
                        
                        {/* 2. BAR: Weekly Load */}
                        <Bar yAxisId="left" dataKey="weeklyLoad" name="Weekly Load" barSize={36} fill="url(#colorLoad)" radius={[4, 4, 0, 0]} />
                        
                        {/* 3. LINE DASHED: Standard Deviation */}
                        <Line yAxisId="left" type="monotone" dataKey="stdDev" name="Std. Deviation" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" dot={false} />

                        {/* 4. LINE SOLID: Strain & Monotony (Paling menonjol) */}
                        <Line yAxisId="right" type="monotone" dataKey="monotony" name="Monotony" stroke="#10b981" strokeWidth={1} dot={{ r: 4, strokeWidth: 2, fill: '#09090b', stroke: '#10b981' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                        <Line yAxisId="left" type="monotone" dataKey="strain" name="Strain" stroke="#f43f5e" strokeWidth={1} dot={{ r: 4, strokeWidth: 2, fill: '#09090b', stroke: '#f43f5e' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }} />
                        
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}