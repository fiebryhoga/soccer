import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Calendar, Loader2 } from 'lucide-react';

export default function Index({ auth, calendar, season_start_date }) {
    const today = new Date().toISOString().split('T')[0];
    
    // Inisialisasi Form
    const { data, setData, post, processing, errors } = useForm({
        season_start_date: season_start_date || ''
    });

    const submitStartDate = (e) => {
        e.preventDefault();
        post(route('performance-logs.updateStartDate'));
    };

    // TAMPILAN SETUP AWAL (Jika tanggal belum diatur)
    if (!season_start_date) {
        return (
            <AuthenticatedLayout user={auth.user} headerTitle="Setup Kalender Musim">
                <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Calendar className="text-blue-500" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Tentukan Tanggal Mulai</h2>
                    <p className="text-sm text-zinc-500 mb-8">Data latihan dan pertandingan akan dicatat mulai dari tanggal ini sampai seterusnya.</p>
                    
                    <form onSubmit={submitStartDate} className="space-y-4 text-left">
                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 px-1">Pilih Tanggal</label>
                            <input 
                                type="date" 
                                value={data.season_start_date} 
                                onChange={e => setData('season_start_date', e.target.value)} 
                                className={`w-full rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 focus:ring-blue-500 ${errors.season_start_date ? 'border-red-500' : ''}`}
                            />
                            {errors.season_start_date && (
                                <p className="text-red-500 text-xs mt-1 px-1">{errors.season_start_date}</p>
                            )}
                        </div>

                        <button 
                            disabled={processing}
                            className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {processing && <Loader2 size={16} className="animate-spin" />}
                            Simpan & Mulai Kalender
                        </button>
                    </form>
                </div>
            </AuthenticatedLayout>
        );
    }

    // TAMPILAN KALENDER (Jika sudah ada season_start_date)
    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Performance Calendar">
            <div className="max-w-7xl pb-12 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {calendar.map((day) => {
                        const isToday = day.date === today;
                        return (
                            <div 
                                key={day.date} 
                                className={`p-4 rounded-2xl border-2 transition-all hover:border-blue-400 flex flex-col min-h-[140px] ${
                                    isToday 
                                    ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/10 shadow-lg' 
                                    : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">{day.date}</span>
                                    {isToday && <span className="bg-blue-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black">HARI INI</span>}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <select 
                                        value={day.type || 'off'} 
                                        onChange={(e) => router.post(route('performance-logs.store'), { date: day.date, type: e.target.value })}
                                        className="w-full text-[10px] font-bold border-none bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 px-2 focus:ring-0"
                                    >
                                        <option value="off">OFF / LIBUR</option>
                                        <option value="training">TRAINING</option>
                                        <option value="match">MATCH</option>
                                    </select>

                                    {day.type !== 'off' && (
                                        <Link 
                                            href={day.id ? route('performance-logs.show', day.id) : '#'} 
                                            className="mt-4 block p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-center text-[10px] font-black rounded-lg hover:scale-105 transition-transform"
                                        >
                                            {day.id ? 'ISI DATA GPS' : 'BUAT LOG'}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}