// resources/js/Pages/PerformanceLogs/Analysis/Comparison.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Search, X, Activity, ChevronRight, Tags } from 'lucide-react';

// Import Partials
import BasicComparisonChart from './Partials/BasicComparisonChart';
import IntensityComparisonChart from './Partials/IntensityComparisonChart';
import MovementComparisonChart from './Partials/MovementComparisonChart';
import HeartRateComparisonChart from './Partials/HeartRateComparisonChart';
import VelocityComparisonChart from './Partials/VelocityComparisonChart';
import PlayerLoadComparisonChart from './Partials/PlayerLoadComparisonChart';

export default function Comparison({ auth, comparisonData, allSessions }) {
    
    const searchParams = new URLSearchParams(window.location.search);
    const initialSessions = searchParams.getAll('session_ids[]').map(Number);

    const [selectedSessions, setSelectedSessions] = useState(initialSessions);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // FUNGSI SMART SEARCH: Mencari berdasarkan Nama, Tag, Tanggal, atau Bulan
    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return allSessions.slice(0, 5); // Tampilkan 5 terbaru jika kosong
        
        const q = searchQuery.toLowerCase();
        return allSessions.filter(s => {
            const matchName = s.title?.toLowerCase().includes(q);
            const matchTag = s.tag?.toLowerCase().includes(q);
            const matchDate = s.date?.includes(q);
            
            // Format pencarian nama bulan (misal: "maret" atau "mar")
            const dateObj = new Date(s.date);
            const monthName = dateObj.toLocaleString('id-ID', { month: 'long' }).toLowerCase();
            const matchMonth = monthName.includes(q);

            return matchName || matchTag || matchDate || matchMonth;
        }).slice(0, 10); // Batasi maksimal 10 hasil pencarian agar UI tidak lag/turun ke bawah
    }, [searchQuery, allSessions]);

    // Tambah & Hapus Sesi yang Dipilih
    const addSession = (session) => {
        if (!selectedSessions.includes(session.id)) {
            setSelectedSessions(prev => [...prev, session.id]);
        }
        setSearchQuery('');
        setIsDropdownOpen(false);
    };

    const removeSession = (id) => {
        setSelectedSessions(prev => prev.filter(s => s !== id));
    };

    // Eksekusi Pencarian
    const applyFilter = () => {
        if (selectedSessions.length > 0) {
            router.get(route('analysis.comparison'), { session_ids: selectedSessions }, { preserveState: true });
        }
    };

    const clearFilter = () => {
        setSelectedSessions([]);
        router.get(route('analysis.comparison'), {}, { preserveState: true });
    };

    // Ambil detail data sesi yang sedang terpilih untuk ditampilkan sebagai 'Badge'
    const selectedSessionDetails = useMemo(() => {
        return selectedSessions.map(id => allSessions.find(s => s.id === id)).filter(Boolean);
    }, [selectedSessions, allSessions]);

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Comparison Analysis"
            headerDescription="Bandingkan metrik performa secara mendalam antar sesi."
        >
            <Head title="Metric Comparison" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* ============================================================== */}
                {/* KOTAK FILTER PENCARIAN CERDAS (SMART SEARCH) */}
                {/* ============================================================== */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 relative z-30">
                    
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Search size={16} className="text-zinc-400" /> Cari & Pilih Sesi Latihan
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        
                        {/* Area Input & Dropdown */}
                        <div className="relative w-full md:w-1/2">
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Ketik tag (MD-1), lawan (Dewa), bulan (Maret)..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                />
                                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            </div>

                            {/* DROPDOWN HASIL PENCARIAN */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden z-40 max-h-64 overflow-y-auto">
                                    {filteredSessions.length > 0 ? (
                                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                            {filteredSessions.map(session => {
                                                const isSelected = selectedSessions.includes(session.id);
                                                return (
                                                    <button 
                                                        key={session.id}
                                                        disabled={isSelected}
                                                        onClick={() => addSession(session)}
                                                        className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${isSelected ? 'opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-[#121212]' : ''}`}
                                                    >
                                                        <div>
                                                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{session.title}</div>
                                                            <div className="text-[10px] font-semibold text-zinc-500 mt-0.5">{session.date}</div>
                                                        </div>
                                                        {session.tag && (
                                                            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black tracking-widest uppercase rounded">
                                                                {session.tag}
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs font-semibold text-zinc-500">Sesi tidak ditemukan.</div>
                                    )}
                                </div>
                            )}

                            {/* Latar belakang transparan untuk menutup dropdown saat klik di luar */}
                            {isDropdownOpen && (
                                <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
                            )}
                        </div>

                        {/* Tombol Eksekusi */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button 
                                onClick={applyFilter} 
                                disabled={selectedSessions.length < 2}
                                className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 flex-1 md:flex-none justify-center ${selectedSessions.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Activity size={16} strokeWidth={2.5}/> Bandingkan Sesi
                            </button>
                            {selectedSessions.length > 0 && (
                                <button onClick={clearFilter} className="px-4 py-3 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1.5 shrink-0">
                                    <X size={16} strokeWidth={2.5} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Area Badge Sesi Terpilih */}
                    {selectedSessionDetails.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Sesi Terpilih ({selectedSessions.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedSessionDetails.map(session => (
                                    <div key={session.id} className="flex items-center gap-2 pl-3 pr-1 py-1 bg-zinc-900 dark:bg-zinc-100 rounded-md border border-zinc-900 dark:border-zinc-100">
                                        <span className="text-[11px] font-bold text-white dark:text-zinc-900">{session.title}</span>
                                        {session.tag && (
                                            <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-600">| {session.tag}</span>
                                        )}
                                        <button onClick={() => removeSession(session.id)} className="p-1 text-zinc-400 hover:text-white dark:hover:text-red-500 transition-colors bg-zinc-800 dark:bg-zinc-200 rounded">
                                            <X size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ============================================================== */}
                {/* GRID GRAFIK (Hasil Perbandingan - FULL WIDTH) */}
                {/* ============================================================== */}
                {comparisonData.length < 2 ? (
                    <div className="p-12 text-center bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <Activity size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Data</h4>
                        <p className="text-xs font-semibold text-zinc-500 mt-1">Gunakan kotak pencarian di atas dan pilih minimal 2 sesi untuk mulai membandingkan.</p>
                    </div>
                ) : (
                    // GRID DIUBAH MENJADI 1 KOLOM (FULL WIDTH)
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* 1. Grafik Dasar: Total Distance & Distance/Min */}
                        <BasicComparisonChart data={comparisonData} />
                        <IntensityComparisonChart data={comparisonData} />
                        <MovementComparisonChart data={comparisonData} />

                        <HeartRateComparisonChart data={comparisonData} />
                        <VelocityComparisonChart data={comparisonData} />
                        <PlayerLoadComparisonChart data={comparisonData} />
                        
                        {/* Grafik Intensitas & Lainnya akan kita susun ke bawah secara proporsional */}
                    </div>
                )}
                
            </div>
        </AuthenticatedLayout>
    );
}