// resources/js/Pages/PerformanceLogs/Analysis/Partials/HeartRateComparisonChart.jsx

import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function HeartRateComparisonChart({ data }) {
    
    // Fungsi mengubah waktu "00.15.30" menjadi menit desimal untuk sumbu grafik
    const parseDurationToMinutes = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.split('.').map(Number);
        if (parts.length === 3) return (parts[0] * 60) + parts[1] + (parts[2] / 60);
        if (parts.length === 2) return parts[0] + (parts[1] / 60);
        return parseFloat(timeStr) || 0;
    };

    const chartData = data.map(s => ({
        name: s.title,
        hr4Dist: parseFloat(s.averages.hr_band_4_dist) || 0,
        hr5Dist: parseFloat(s.averages.hr_band_5_dist) || 0,
        hr4Dur: parseDurationToMinutes(s.averages.hr_band_4_dur),
        hr5Dur: parseDurationToMinutes(s.averages.hr_band_5_dur),
        // Simpan format asli untuk ditampilkan di Tooltip saat di-hover
        hr4DurRaw: s.averages.hr_band_4_dur || '00.00.00',
        hr5DurRaw: s.averages.hr_band_5_dur || '00.00.00',
    }));

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
            <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Heart Rate Analysis</h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Perbandingan Jarak Tempuh (m) dan Durasi (Waktu) pada <span className="text-orange-500">HR Band 4</span> & <span className="text-red-500">HR Band 5</span>.
                </p>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.15} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                        
                        {/* Sumbu Kiri: Untuk Jarak (Meter) */}
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={-10} />
                        
                        {/* Sumbu Kanan: Untuk Durasi (Menit) */}
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={10} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                            formatter={(value, name, props) => {
                                // Ganti angka desimal dengan format waktu aslinya saat di-hover
                                if (name === 'HR 4 Duration') return [props.payload.hr4DurRaw, 'Durasi HR 4'];
                                if (name === 'HR 5 Duration') return [props.payload.hr5DurRaw, 'Durasi HR 5'];
                                return [`${value} m`, name];
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                        
                        {/* Batang Jarak (Meter) */}
                        <Bar yAxisId="left" dataKey="hr4Dist" name="HR 4 Distance" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar yAxisId="left" dataKey="hr5Dist" name="HR 5 Distance" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                        
                        {/* Garis Durasi Waktu */}
                        <Line yAxisId="right" type="monotone" dataKey="hr4Dur" name="HR 4 Duration" stroke="#f97316" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 5, strokeWidth: 2 }} />
                        <Line yAxisId="right" type="monotone" dataKey="hr5Dur" name="HR 5 Duration" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 5, strokeWidth: 2 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}