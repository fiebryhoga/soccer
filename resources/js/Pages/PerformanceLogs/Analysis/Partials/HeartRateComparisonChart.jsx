// resources/js/Pages/PerformanceLogs/Analysis/Partials/HeartRateComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function HeartRateComparisonChart({ data }) {
    
    // Fungsi mengubah format "HH.MM.SS" atau "MM.SS" menjadi menit desimal untuk sumbu grafik (YAxis)
    const parseDurationToMinutes = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.split('.').map(Number);
        
        if (parts.length === 3) {
            return (parts[0] * 60) + parts[1] + (parts[2] / 60);
        }
        if (parts.length === 2) {
            return parts[0] + (parts[1] / 60);
        }
        
        return parseFloat(timeStr) || 0;
    };

    const chartData = data.map(s => ({
        name: s.title,
        // Jarak (Bar Chart)
        hr4Dist: parseFloat(s.averages.hr_band_4_dist) || 0,
        hr5Dist: parseFloat(s.averages.hr_band_5_dist) || 0,
        // Durasi (Line Chart - Menit Desimal)
        hr4Dur: parseDurationToMinutes(s.averages.hr_band_4_dur),
        hr5Dur: parseDurationToMinutes(s.averages.hr_band_5_dur),
        // Simpan String Asli (Untuk Tooltip Hover)
        hr4DurRaw: s.averages.hr_band_4_dur || '00.00.00',
        hr5DurRaw: s.averages.hr_band_5_dur || '00.00.00',
    }));

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-xl shadow-sm transition-colors relative overflow-hidden">
            
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/5 dark:bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="mb-6 flex flex-col relative z-10">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    HEART RATE <span className="text-zinc-400 dark:text-zinc-600 font-bold ml-1">COMPARISON</span>
                </h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Perbandingan Jarak Tempuh (Bar) dan Durasi (Line) pada zona <span className="text-orange-500">HR Band 4</span> dan <span className="text-red-500">HR Band 5</span>.
                </p>
            </div>

            <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 0, bottom: 0, left: -20 }}>
                        
                        {/* DEFINISI GRADIENT WARNA */}
                        <defs>
                            <linearGradient id="colorHR4" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#fdba74" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="colorHR5" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#fca5a5" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                        
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                        
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={-10} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dx={10} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                            formatter={(value, name, props) => {
                                if (name === 'HR 4 Duration') return [props.payload.hr4DurRaw, 'Durasi HR 4'];
                                if (name === 'HR 5 Duration') return [props.payload.hr5DurRaw, 'Durasi HR 5'];
                                return [`${value} m`, name];
                            }}
                        />
                        
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', color: '#71717a' }} />
                        
                        {/* Bar: Jarak (Memakai Gradient) */}
                        <Bar yAxisId="left" dataKey="hr4Dist" name="HR 4 Distance" fill="url(#colorHR4)" radius={[4, 4, 0, 0]} barSize={32} />
                        <Bar yAxisId="left" dataKey="hr5Dist" name="HR 5 Distance" fill="url(#colorHR5)" radius={[4, 4, 0, 0]} barSize={32} />
                        
                        {/* Line: Durasi (Putus-putus) */}
                        <Line yAxisId="right" type="monotone" dataKey="hr4Dur" name="HR 4 Duration" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={{ r: 5, strokeWidth: 2, fill: '#09090b', stroke: '#f97316' }} activeDot={{ r: 7 }} />
                        <Line yAxisId="right" type="monotone" dataKey="hr5Dur" name="HR 5 Duration" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={{ r: 5, strokeWidth: 2, fill: '#09090b', stroke: '#ef4444' }} activeDot={{ r: 7 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}