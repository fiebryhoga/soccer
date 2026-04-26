import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function PlayerLoadComparisonChart({ data }) {
    const chartData = data.map(s => {
        const load = parseFloat(s.averages.player_load) || 0;
        // Hitung persentase jika tersedia, jika tidak anggap proporsional (misal target 100%)
        const percentStr = s.averages.player_load_percent || '0';
        const percent = parseFloat(percentStr.replace('%', '')) || 0;
        
        // Asumsi: Target Match Day = 100%. Kita hitung selisihnya untuk divisualisasikan.
        // Jika persentase melebihi 100%, selisihnya 0 (karena sudah melampaui target).
        const diffToMatchDay = percent > 0 && percent < 100 ? (100 - percent) : 0;

        return {
            name: s.title,
            load: load,
            percent: percent,
            diff: diffToMatchDay,
            isOverTarget: percent > 100
        };
    });

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
            <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Player Load</h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">
                    Akumulasi beban mekanis sesi (<span className="text-teal-500">Player Load</span>) dan persentasenya terhadap Match Day.
                </p>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.15} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                        
                        {/* Kita gunakan dua sumbu agar Load (angka absolut) dan Persentase bisa berdampingan jika diperlukan */}
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dx={-10} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            formatter={(value, name, props) => {
                                // Kustomisasi Tooltip agar menampilkan nilai aktual dengan benar
                                if (name === 'Load Aktual' || name === 'Load Ekstra (>100%)') return [value.toFixed(1), name];
                                if (name === '% Match Day Target') return [`${props.payload.percent.toFixed(1)}%`, 'Percent of Match Day'];
                                return [value, name];
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                        
                        {/* Batang utama: Nilai aktual Player Load */}
                        <Bar yAxisId="left" dataKey="load" name="Load Aktual" stackId="a" fill="#14b8a6" barSize={50} radius={[4, 4, 0, 0]}/>
                        
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}