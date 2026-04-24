import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    CalendarDays, Filter, Activity, Trophy, Coffee, ChevronRight, Edit2, Check, Plus, Search
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PerformanceLogIndex({ auth, calendar, season_start_date }) {
    
    // 1. State Konfigurasi
    const [isEditingDate, setIsEditingDate] = useState(!season_start_date);
    const [tempDate, setTempDate] = useState(season_start_date || '');

    // 2. State untuk Filter & Pencarian
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMonth, setFilterMonth] = useState('all');

    // ==========================================
    // PINDAHKAN FORMAT DATE KE SINI (PALING ATAS)
    // ==========================================
    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // ==========================================
    // FUNGSI FILTER & SEARCH 
    // ==========================================
    const filteredCalendar = useMemo(() => {
        if (!calendar) return [];

        return calendar.filter(day => {
            const matchesSearch = 
                (day.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (formatDate(day.date).toLowerCase().includes(searchQuery.toLowerCase())) ||
                (day.type.toLowerCase().includes(searchQuery.toLowerCase()));

            let matchesMonth = true;
            if (filterMonth !== 'all') {
                const dayMonth = new Date(day.date).getMonth() + 1; 
                matchesMonth = dayMonth.toString() === filterMonth;
            }

            return matchesSearch && matchesMonth;
        });
    }, [calendar, searchQuery, filterMonth]);

    // ==========================================
    // DAFTAR BULAN UNTUK DROPDOWN
    // ==========================================
    const availableMonths = useMemo(() => {
        if (!calendar) return [];
        const months = new Set();
        calendar.forEach(day => {
            const dateObj = new Date(day.date);
            months.add(JSON.stringify({
                val: dateObj.getMonth() + 1,
                label: dateObj.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
            }));
        });
        return Array.from(months).map(m => JSON.parse(m)).sort((a,b) => a.val - b.val);
    }, [calendar]);

    // ==========================================
    // HANDLER AKSI LAINNYA
    // ==========================================
    const saveStartDate = () => {
        if (!tempDate) return;
        router.post(route('performance-logs.updateStartDate'), { season_start_date: tempDate }, {
            preserveScroll: true,
            onSuccess: () => setIsEditingDate(false)
        });
    };

    const updateAgenda = (date, type) => {
        router.post(route('performance-logs.store'), { date, type }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Kalender Performa" 
            headerDescription="Atur jadwal tim 14 hari ke depan dan catat metrik fisik dari setiap sesi."
        >
            <Head title="Jadwal & Log Performa" />

            <div className="max-w-7xl pb-12 space-y-6">
                
                {/* HEADER ACTION BAR & PENGATURAN TANGGAL AWAL */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white dark:bg-[#0a0a0a] p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-colors">
                    <div>
                        <h2 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">Jadwal Sesi 14 Hari</h2>
                        <p className="text-sm text-zinc-500 mt-1">Tentukan tipe sesi untuk masing-masing hari.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Pengaturan Tanggal Mulai Musim */}
                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5 transition-all">
                            {isEditingDate ? (
                                <div className="flex items-center gap-2 px-2">
                                    <input 
                                        type="date" 
                                        value={tempDate}
                                        onChange={(e) => setTempDate(e.target.value)}
                                        className="bg-white dark:bg-[#121212] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none"
                                    />
                                    <button onClick={saveStartDate} className="p-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:scale-105 transition-transform" title="Simpan">
                                        <Check size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 px-3 py-1.5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Mulai Musim</span>
                                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                            {formatDate(season_start_date)}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => setIsEditingDate(true)}
                                        className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
                                        title="Ubah Tanggal"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BARIS PENCARIAN & FILTER (BARU) */}
                {season_start_date && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-zinc-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari sesi (contoh: Match VS Arema, atau 26 Mei)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl leading-5 bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="sm:w-48 flex items-center gap-2 bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1">
                            <Filter className="h-4 w-4 text-zinc-400 shrink-0" />
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full bg-transparent border-none text-sm text-zinc-700 dark:text-zinc-300 focus:ring-0 cursor-pointer outline-none p-0"
                            >
                                <option value="all">Semua Bulan</option>
                                {availableMonths.map((month) => (
                                    <option key={month.val} value={month.val}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* CALENDAR CARDS GRID */}
                {!season_start_date ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 bg-white dark:bg-[#0a0a0a]">
                        <CalendarDays size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium text-zinc-500">Belum ada kalender. Atur tanggal mulai musim di pojok kanan atas.</p>
                    </div>
                ) : filteredCalendar.length === 0 ? (
                    // Tampilan jika filter tidak menemukan hasil
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Search size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Tidak ada sesi ditemukan</h3>
                        <p className="text-sm text-zinc-500 mt-1">Coba gunakan kata kunci pencarian atau filter bulan yang berbeda.</p>
                        <button 
                            onClick={() => {setSearchQuery(''); setFilterMonth('all');}}
                            className="mt-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCalendar.map((day) => {
                            const isOff = day.type === 'off';
                            const isTraining = day.type === 'training';
                            const isMatch = day.type === 'match';

                            return (
                                <div 
                                    key={day.date} 
                                    className={`group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 hover:shadow-md
                                        ${isOff ? 'bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/80' : ''}
                                        ${isTraining ? 'bg-white dark:bg-[#0a0a0a] border-blue-200 dark:border-blue-500/30' : ''}
                                        ${isMatch ? 'bg-white dark:bg-[#0a0a0a] border-emerald-200 dark:border-emerald-500/30' : ''}
                                    `}
                                >
                                    <div>
                                        {/* Header Card (Tgl & Ikon) */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                    {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                                                </span>
                                                <h3 className={`text-xl font-bold mt-0.5 ${isOff ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {new Date(day.date).getDate()} {new Date(day.date).toLocaleDateString('id-ID', { month: 'short' })}
                                                </h3>
                                            </div>
                                            
                                            <div className={`p-2 rounded-lg ${
                                                isTraining ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                isMatch ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                            }`}>
                                                {isTraining ? <Activity size={18} /> : isMatch ? <Trophy size={18} /> : <Coffee size={18} />}
                                            </div>
                                        </div>

                                        {/* TAMPILAN JUDUL SESI */}
                                        <div className="mb-5 h-10">
                                            {!isOff && day.title ? (
                                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight">
                                                    {day.title}
                                                </p>
                                            ) : (
                                                <p className="text-xs font-medium text-zinc-400 italic">
                                                    {isOff ? 'Hari Libur' : 'Judul belum diatur'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Dropdown Tipe Sesi */}
                                        <select 
                                            value={day.type || 'off'} 
                                            onChange={(e) => updateAgenda(day.date, e.target.value)}
                                            className={`w-full text-xs font-bold rounded-xl border focus:ring-2 py-2.5 px-3 mb-4 appearance-none outline-none transition-colors cursor-pointer ${
                                                isTraining ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 focus:ring-blue-500' :
                                                isMatch ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 focus:ring-emerald-500' :
                                                'bg-white dark:bg-[#121212] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 focus:ring-zinc-400'
                                            }`}
                                        >
                                            <option value="off">Off (Libur)</option>
                                            <option value="training">Training (Latihan)</option>
                                            <option value="match">Match (Pertandingan)</option>
                                        </select>
                                    </div>

                                    {/* Footer Card (Tombol Aksi ke Form Input) */}
                                    <div className="mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                                        {!isOff ? (
                                            <Link 
                                                href={day.id ? route('performance-logs.show', day.id) : '#'} 
                                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] ${
                                                    day.id 
                                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm' 
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                                                }`}
                                                onClick={(e) => !day.id && e.preventDefault()}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {day.id ? <Edit2 size={16} /> : <Plus size={16} />}
                                                    {day.id ? 'Data GPS' : 'Isi Sesi'}
                                                </span>
                                                <ChevronRight size={16} className={day.id ? 'opacity-100' : 'opacity-0'} />
                                            </Link>
                                        ) : (
                                            <div className="flex items-center justify-center px-4 py-2.5 bg-transparent border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-400 dark:text-zinc-600">
                                                Tidak Ada Aktivitas
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}