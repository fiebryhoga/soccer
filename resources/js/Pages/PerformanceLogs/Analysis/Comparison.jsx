import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
// 1. Tambahkan CheckSquare di sini
import { Search, X, Activity, GitCompare, CheckSquare } from 'lucide-react'; 

// Import Partials
import BasicComparisonChart from './Partials/BasicComparisonChart';
import IntensityComparisonChart from './Partials/IntensityComparisonChart';
import MovementComparisonChart from './Partials/MovementComparisonChart';
import HeartRateComparisonChart from './Partials/HeartRateComparisonChart';
import VelocityComparisonChart from './Partials/VelocityComparisonChart';
import PlayerLoadComparisonChart from './Partials/PlayerLoadComparisonChart';
import SpeedZoneChart from './Partials/SpeedZoneChart';
import VolumeIntensityMatrix from './Partials/VolumeIntensityMatrix';
import SessionDNAChart from './Partials/SessionDNAChart';

export default function Comparison({ auth, comparisonData, allSessions }) {
    
    const { url } = usePage(); 

    const getSessionsFromUrl = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const ids = [];
        for (const [key, value] of searchParams.entries()) {
            if (key.startsWith('session_ids')) {
                ids.push(Number(value));
            }
        }
        return ids;
    };

    const [selectedSessions, setSelectedSessions] = useState(getSessionsFromUrl());
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const currentIds = getSessionsFromUrl();
        if (JSON.stringify(currentIds) !== JSON.stringify(selectedSessions)) {
            setSelectedSessions(currentIds);
        }
    }, [url]);

    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return allSessions.slice(0, 5); 
        
        const q = searchQuery.toLowerCase();
        return allSessions.filter(s => {
            const matchName = s.title?.toLowerCase().includes(q);
            const matchTag = s.tag?.toLowerCase().includes(q);
            const matchDate = s.date?.includes(q);
            
            const dateObj = new Date(s.date);
            const monthName = dateObj.toLocaleString('id-ID', { month: 'long' }).toLowerCase();
            const matchMonth = monthName.includes(q);

            return matchName || matchTag || matchDate || matchMonth;
        }).slice(0, 100); 
    }, [searchQuery, allSessions]);

    // 2. FUNGSI BARU: Select All dari hasil filter
    const addAllFiltered = () => {
        const newIds = filteredSessions.map(s => s.id);
        setSelectedSessions(prev => {
            // Gabungkan yang sudah ada dengan yang baru, hindari duplikat menggunakan Set
            const combined = [...prev, ...newIds];
            return [...new Set(combined)];
        });
        // Opsional: Tutup dropdown dan bersihkan pencarian setelah select all
        // Jika ingin tetap terbuka, biarkan baris di bawah dikomentari
        // setSearchQuery('');
        // setIsDropdownOpen(false);
    };

    // 3. MODIFIKASI: Hapus reset input agar teks pencarian tetap ada saat dipilih manual
    const addSession = (session) => {
        if (!selectedSessions.includes(session.id)) {
            setSelectedSessions(prev => [...prev, session.id]);
        }
        // Dihapus agar input tidak kerereset dan dropdown tetap terbuka
        // setSearchQuery(''); 
        // setIsDropdownOpen(false); 
    };

    const removeSession = (id) => {
        setSelectedSessions(prev => prev.filter(s => s !== id));
    };

    const applyFilter = () => {
        if (selectedSessions.length > 0) {
            router.get(route('analysis.comparison'), { session_ids: selectedSessions }, { preserveState: true });
            setIsDropdownOpen(false); // Tutup dropdown saat apply
        }
    };

    const clearFilter = () => {
        setSelectedSessions([]);
        setSearchQuery(''); // Opsional: bersihkan input saat clear semua
        router.get(route('analysis.comparison'), {}, { preserveState: true });
    };

    const selectedSessionDetails = useMemo(() => {
        return selectedSessions.map(id => allSessions.find(s => s.id === id)).filter(Boolean);
    }, [selectedSessions, allSessions]);

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Comparison Analysis"
            headerDescription="Bandingkan metrik performa secara mendalam antar sesi latihan atau pertandingan."
        >
            <Head title="Metric Comparison" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 lg:p-6 relative z-30 transition-colors">
                    
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Search size={16} className="text-zinc-400" strokeWidth={2.5} /> 
                        Cari & Pilih Sesi Latihan
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        
                        <div className="relative w-full md:w-1/2">
                            <div className="relative z-50">
                                <input 
                                    type="text"
                                    placeholder="Ketik tag (MD-1), lawan (Dewa), bulan..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 text-sm font-bold rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-1 dark:focus:ring-offset-zinc-950 focus:border-transparent outline-none transition-all shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                />
                                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" strokeWidth={2.5}/>
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                                    {filteredSessions.length > 0 ? (
                                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                            
                                            {/* TOMBOL SELECT ALL MUNCUL SAAT ADA PENCARIAN */}
                                            {searchQuery.trim() !== '' && (
                                                <button 
                                                    onClick={addAllFiltered}
                                                    className="w-full text-left px-4 py-2.5 bg-zinc-100/80 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CheckSquare size={16} className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" strokeWidth={2.5} />
                                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                                                            Pilih Semua Hasil Filter ({filteredSessions.length})
                                                        </span>
                                                    </div>
                                                </button>
                                            )}

                                            {filteredSessions.map(session => {
                                                const isSelected = selectedSessions.includes(session.id);
                                                return (
                                                    <button 
                                                        key={session.id}
                                                        disabled={isSelected}
                                                        onClick={() => addSession(session)}
                                                        className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${isSelected ? 'opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/30' : ''}`}
                                                    >
                                                        <div>
                                                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{session.title}</div>
                                                            <div className="text-[10px] font-semibold text-zinc-500 mt-0.5">{session.date}</div>
                                                        </div>
                                                        {session.tag && (
                                                            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[9px] font-black tracking-widest uppercase rounded border border-zinc-200 dark:border-zinc-700">
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

                            {isDropdownOpen && (
                                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto relative z-30">
                            <button 
                                onClick={applyFilter} 
                                disabled={selectedSessions.length < 2}
                                className={`px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 flex-1 md:flex-none justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-zinc-950 focus:ring-zinc-900 dark:focus:ring-zinc-100
                                    ${selectedSessions.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <GitCompare size={16} strokeWidth={2.5}/> Bandingkan Sesi
                            </button>
                            
                            {selectedSessions.length > 0 && (
                                <button 
                                    onClick={clearFilter} 
                                    className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900/20 border border-transparent hover:border-slate-200 dark:hover:border-slate-200/50 rounded-lg transition-all flex items-center gap-1.5 shrink-0"
                                >
                                    <X size={16} strokeWidth={2.5} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedSessionDetails.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 relative z-30">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                Sesi Terpilih ({selectedSessions.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedSessionDetails.map(session => (
                                    <div key={session.id} className="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">{session.title}</span>
                                        {session.tag && (
                                            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500">| {session.tag}</span>
                                        )}
                                        <button 
                                            onClick={() => removeSession(session.id)} 
                                            className="p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors rounded"
                                        >
                                            <X size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {comparisonData.length < 2 ? (
                    <div className="p-12 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <Activity size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Data Perbandingan</h4>
                        <p className="text-xs font-semibold text-zinc-500 mt-1 max-w-md mx-auto">
                            Gunakan kotak pencarian di atas dan pilih minimal <span className="font-bold text-zinc-700 dark:text-zinc-300">2 sesi</span> untuk mulai membandingkan metrik secara berdampingan.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <VolumeIntensityMatrix data={comparisonData} />
                        {/* <SessionDNAChart data={comparisonData} /> */}
                        <BasicComparisonChart data={comparisonData} />
                        <IntensityComparisonChart data={comparisonData} />
                        <SpeedZoneChart data={comparisonData} />
                        <MovementComparisonChart data={comparisonData} />
                        <HeartRateComparisonChart data={comparisonData} />
                        <VelocityComparisonChart data={comparisonData} />
                        <PlayerLoadComparisonChart data={comparisonData} />
                    </div>
                )}
                
            </div>
        </AuthenticatedLayout>
    );
}