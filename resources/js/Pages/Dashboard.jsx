import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Activity, 
    CalendarDays, 
    Trophy, 
    Clock, 
    ArrowRight,
    AlertCircle
} from 'lucide-react';

export default function Dashboard({ auth }) {
    // Mock Data Sementara untuk UI Dashboard
    const recentSessions = [
        { id: 1, title: 'Match vs Persija Jakarta', date: '26 Apr 2026', tag: 'MD', load: '1050' },
        { id: 2, title: 'Session 045', date: '25 Apr 2026', tag: 'MD - 1', load: '450' },
        { id: 3, title: 'Session 044', date: '24 Apr 2026', tag: 'MD - 2', load: '720' },
    ];

    const topPerformers = [
        { id: 1, name: 'Malik Risaldi', metric: '36 km/h', label: 'Max Velocity' },
        { id: 2, name: 'Toni Firmansyah', metric: '11.5 km', label: 'Total Distance' },
        { id: 3, name: 'Bruno Moreira', metric: '25', label: 'Sprints' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            headerTitle="Dashboard Overview"
            headerDescription="Monitor performa tim dan metrik latihan terkini."
        >
            <Head title="Dashboard" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-8">
                
                {/* ALERT: DASHBOARD SEMENTARA */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start sm:items-center gap-4 shadow-sm">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg shrink-0">
                        <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                            Dashboard Sementara Coach
                        </h4>
                        <p className="text-xs font-medium text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                            Tampilan ini adalah versi *preview* sementara. Data yang ditampilkan di bawah ini masih berupa ilustrasi statis hingga integrasi penuh selesai.
                        </p>
                    </div>
                </div>

                {/* HEADER WIDGETS (STATISTIK CEPAT) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Skuad</p>
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">24</h3>
                            </div>
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                <Users size={20} className="text-zinc-600 dark:text-zinc-400" strokeWidth={2.5}/>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span>+2</span> dari bulan lalu
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Sesi Bulan Ini</p>
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">18</h3>
                            </div>
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                <Activity size={20} className="text-zinc-600 dark:text-zinc-400" strokeWidth={2.5}/>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            On Track (Periodisasi)
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Avg Player Load</p>
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">654</h3>
                            </div>
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                <Activity size={20} className="text-zinc-600 dark:text-zinc-400" strokeWidth={2.5}/>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            Normal Zone (ACWR 1.1)
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Laga Berikutnya</p>
                                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">Dewa United</h3>
                            </div>
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                <CalendarDays size={20} className="text-zinc-600 dark:text-zinc-400" strokeWidth={2.5}/>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            MD - 3 (Fase Tapering)
                        </p>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT: RECENT SESSIONS */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Clock size={16} className="text-zinc-400" /> Sesi Terakhir
                            </h3>
                            <Link href={route('performance-logs.index')} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1">
                                Lihat Semua <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2 flex-1">
                            {recentSessions.map(session => (
                                <div key={session.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors group cursor-pointer">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{session.title}</span>
                                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[9px] font-black tracking-widest uppercase rounded">
                                                {session.tag}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-semibold text-zinc-500">{session.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Avg Load</p>
                                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{session.load}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: TOP PERFORMERS */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col">
                        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Trophy size={16} className="text-yellow-500" /> Top Performers (Minggu Ini)
                            </h3>
                        </div>
                        <div className="p-5 space-y-5 flex-1">
                            {topPerformers.map((player, index) => (
                                <div key={player.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-500">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{player.name}</p>
                                            <p className="text-[10px] font-semibold text-zinc-500">{player.label}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                        {player.metric}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* EASTER EGG */}
                <div className="pt-12 text-center opacity-20 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        "Nek saranku turuo, Sesok sek ono dino."
                    </p>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}