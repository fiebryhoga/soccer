import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, TrendingDown, TrendingUp, AlertTriangle, Lightbulb, Activity } from 'lucide-react';

export default function PerformanceAnalysis({ auth, trendData, insights, latestLog, previousLog }) {
    
    // Kustomisasi Tooltip Grafik
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 p-3 border border-zinc-700 rounded-lg shadow-xl">
                    <p className="text-zinc-100 font-bold mb-2">{payload[0]?.payload?.title} ({label})</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-xs font-semibold">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Analisis & Insights Tim" headerDescription="Pantau tren fisik, deteksi kelelahan, dan evaluasi progres pemain.">
            <Head title="Analysis Dashboard" />

            <div className="max-w-7xl mx-auto pb-12 space-y-6">
                <Link href={route('performance-logs.index')} className="inline-flex items-center gap-2 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2">
                    <ArrowLeft size={14} /> Kembali ke Kalender
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* BAGIAN KIRI: GRAFIK TREN (Memakan 2 Kolom) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Tren Jarak Tim (5 Sesi Terakhir)</h2>
                                    <p className="text-xs text-zinc-500">Pergerakan rata-rata Total Distance & Sprint.</p>
                                </div>
                                <Activity className="text-blue-500" />
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickMargin={10} />
                                        <YAxis stroke="#71717a" fontSize={10} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        <Line type="monotone" dataKey="Total Distance" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="Sprint Distance" stroke="#10b981" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0a0a0a] p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Tren Player Load</h2>
                                    <p className="text-xs text-zinc-500">Indikator beban kerja internal rata-rata tim.</p>
                                </div>
                            </div>
                            <div className="h-60 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                                        <YAxis stroke="#71717a" fontSize={10} />
                                        <Tooltip cursor={{ fill: '#27272a' }} content={<CustomTooltip />} />
                                        <Bar dataKey="Player Load" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: INSIGHTS & ALERT */}
                    <div className="space-y-6">
                        
                        {/* Box Peningkatan */}
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-4">
                                <TrendingUp size={18} /> Pemain On-Fire (Meningkat)
                            </div>
                            {insights.improving.length > 0 ? (
                                <ul className="space-y-3">
                                    {insights.improving.map((p, i) => (
                                        <li key={i} className="text-sm">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{p.name}</span>
                                            <span className="text-emerald-600 dark:text-emerald-500 text-xs">{p.note}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-zinc-500 italic">Belum ada lonjakan performa di sesi ini.</p>
                            )}
                        </div>

                        {/* Box Penurunan / Warning */}
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-4">
                                <TrendingDown size={18} /> Perlu Perhatian (Menurun)
                            </div>
                            {insights.declining.length > 0 ? (
                                <ul className="space-y-3">
                                    {insights.declining.map((p, i) => (
                                        <li key={i} className="text-sm">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{p.name}</span>
                                            <span className="text-red-600 dark:text-red-400 text-xs">{p.note}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-zinc-500 italic">Kondisi tim stabil. Tidak ada *drop* drastis.</p>
                            )}
                        </div>

                        {/* Box Saran AI/Sistem */}
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-5">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold mb-4">
                                <Lightbulb size={18} /> Saran Pelatih (Auto-Generated)
                            </div>
                            {insights.suggestions.length > 0 ? (
                                <ul className="space-y-3 list-disc list-inside">
                                    {insights.suggestions.map((sug, i) => (
                                        <li key={i} className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                            {sug}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-zinc-500 italic">Kumpulkan lebih banyak data untuk mendapatkan saran cerdas.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}