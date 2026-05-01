// resources/js/Pages/PlayerAnalysis/PlayerComparison.jsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react'; 
import { Search, X, Users, Activity, CheckSquare, PlusCircle, LayoutGrid, Columns, Square, Bookmark, BarChart2, ChevronDown } from 'lucide-react'; 
import PlayerComparisonChart from './Partials/PlayerComparisonChart'; // Komponen Chart yang akan kita buat

export default function PlayerComparison({ auth, sessions, selectedSessionId, availablePlayers, chartTemplates }) {
    
    // --- STATE MANAGEMENT (Dengan LocalStorage) ---
    // Simpan pemain terpilih berdasarkan ID sesi agar tidak tertukar jika pindah sesi
    const [selectedPlayers, setSelectedPlayers] = useState(() => {
        const saved = localStorage.getItem(`compare_players_${selectedSessionId}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [gridLayout, setGridLayout] = useState(() => {
        const saved = localStorage.getItem('player_compare_grid');
        return saved ? JSON.parse(saved) : 2;
    });

    const [charts, setCharts] = useState(() => {
        const saved = localStorage.getItem('player_compare_charts');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem(`compare_players_${selectedSessionId}`, JSON.stringify(selectedPlayers)); }, [selectedPlayers, selectedSessionId]);
    useEffect(() => { localStorage.setItem('player_compare_grid', JSON.stringify(gridLayout)); }, [gridLayout]);
    useEffect(() => { localStorage.setItem('player_compare_charts', JSON.stringify(charts)); }, [charts]);


    // --- DROPDOWN SESI ---
    const [isSessionMenuOpen, setIsSessionMenuOpen] = useState(false);
    const sessionMenuRef = useRef(null);

    // --- DROPDOWN PEMAIN (MULTI-SELECT) ---
    const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
    const playerMenuRef = useRef(null);

    // Menutup dropdown jika klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sessionMenuRef.current && !sessionMenuRef.current.contains(e.target)) setIsSessionMenuOpen(false);
            if (playerMenuRef.current && !playerMenuRef.current.contains(e.target)) setIsPlayerMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Ganti Sesi
    const handleSessionChange = (id) => {
        setIsSessionMenuOpen(false);
        router.get(route('analysis.player.comparison'), { session_id: id }, { preserveState: true });
    };

    // Toggle Pemain
    const handleTogglePlayer = (id) => {
        setSelectedPlayers(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSelectAllPlayers = () => {
        if (selectedPlayers.length === availablePlayers.length) {
            setSelectedPlayers([]);
        } else {
            setSelectedPlayers(availablePlayers.map(p => p.id));
        }
    };

    // --- MANAJEMEN GRAFIK KUSTOM ---
    const addChart = () => {
        const newChart = {
            id: Date.now().toString(),
            selectedParams: [],
            paramColors: {},
            chartType: 'bar',
            isZoomed: true
        };
        setCharts([...charts, newChart]);
    };

    const updateChart = (id, newConfig) => {
        setCharts(prev => prev.map(c => c.id === id ? { ...c, ...newConfig } : c));
    };

    const removeChart = (idToRemove) => {
        setCharts(prev => prev.filter(c => c.id !== idToRemove));
    };

    // Filter data pemain yang hanya terpilih untuk dikirim ke chart
    const activePlayersData = useMemo(() => {
        return availablePlayers.filter(p => selectedPlayers.includes(p.id));
    }, [availablePlayers, selectedPlayers]);

    const activeSession = sessions.find(s => s.id === selectedSessionId);
    const gridClass = gridLayout === 1 ? 'grid-cols-1' : gridLayout === 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Player vs Player Comparison"
            headerDescription="Bandingkan performa antar pemain dalam satu sesi yang sama secara mendetail."
        >
            <Head title="Player Comparison" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* --- TOOLBAR PENGATURAN UTAMA --- */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 lg:p-5 relative transition-colors z-30 flex flex-col xl:flex-row gap-4 justify-between items-center">
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                        
                        {/* 1. Pemilih Sesi */}
                        <div className="relative w-full sm:w-72" ref={sessionMenuRef}>
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1"><Activity size={12}/> Pilih Sesi</label>
                            <button 
                                onClick={() => setIsSessionMenuOpen(!isSessionMenuOpen)} 
                                className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white shadow-sm"
                            >
                                <span className="truncate pr-2">{activeSession ? activeSession.title : 'Pilih Sesi'}</span>
                                <ChevronDown size={16} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                            </button>

                            {isSessionMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 custom-scrollbar">
                                    <div className="p-2 space-y-1">
                                        {sessions.map(s => (
                                            <button 
                                                key={s.id} 
                                                onClick={() => handleSessionChange(s.id)}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${selectedSessionId === s.id ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                            >
                                                <div className="min-w-0">
                                                    <div className={`text-xs font-bold truncate ${selectedSessionId === s.id ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>{s.title}</div>
                                                    <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{s.date}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Pemilih Pemain (Multi-Select) */}
                        <div className="relative w-full sm:w-80" ref={playerMenuRef}>
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1"><Users size={12}/> Pilih Pemain ({selectedPlayers.length})</label>
                            <button 
                                onClick={() => setIsPlayerMenuOpen(!isPlayerMenuOpen)} 
                                className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white shadow-sm"
                            >
                                <span className="truncate pr-2 text-emerald-600 dark:text-emerald-400">
                                    {selectedPlayers.length === 0 ? 'Belum ada pemain terpilih' : `${selectedPlayers.length} Pemain Dipilih`}
                                </span>
                                <ChevronDown size={16} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                            </button>

                            {isPlayerMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                                        <button 
                                            onClick={handleSelectAllPlayers}
                                            className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckSquare size={14} /> {selectedPlayers.length === availablePlayers.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        {availablePlayers.map(p => {
                                            const isSelected = selectedPlayers.includes(p.id);
                                            return (
                                                <button 
                                                    key={p.id} 
                                                    onClick={() => handleTogglePlayer(p.id)}
                                                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${isSelected ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'}`}
                                                >
                                                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                        [{String(p.position_number).padStart(2, '0')}] {p.name}
                                                    </span>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                                        {isSelected && <CheckSquare size={10} className="text-white" strokeWidth={3}/>}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Pengatur Grid & Tambah Chart */}
                    <div className="flex items-end gap-3 w-full xl:w-auto mt-2 xl:mt-0 pt-4 xl:pt-0 border-t border-zinc-200 dark:border-zinc-800 xl:border-none">
                        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block hidden xl:block text-center">Tampilan Grid</label>
                            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-inner w-full sm:w-auto justify-center h-10">
                                <button onClick={() => setGridLayout(1)} className={`p-1.5 px-3 rounded flex items-center justify-center transition-all ${gridLayout === 1 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><Square size={16} strokeWidth={3} /></button>
                                <button onClick={() => setGridLayout(2)} className={`p-1.5 px-3 rounded flex items-center justify-center transition-all ${gridLayout === 2 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><Columns size={16} strokeWidth={3} /></button>
                                <button onClick={() => setGridLayout(3)} className={`p-1.5 px-3 rounded flex items-center justify-center transition-all ${gridLayout === 3 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><LayoutGrid size={16} strokeWidth={3} /></button>
                            </div>
                        </div>

                        <button 
                            onClick={addChart} 
                            className="h-10 px-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all flex items-center justify-center gap-2 shrink-0"
                        >
                            <PlusCircle size={16} /> <span className="hidden sm:inline">Tambah Grafik</span>
                        </button>
                    </div>
                </div>

                {/* --- AREA HASIL COMPARISON --- */}
                {selectedPlayers.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <Users size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Pemain Terpilih</h4>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                            Gunakan dropdown di atas untuk memilih minimal 1 pemain yang ingin dianalisis.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* --- WRAPPER GRID CHARTS --- */}
                        {charts.length === 0 ? (
                            <div className="w-full py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20 relative z-10">
                                <BarChart2 size={32} className="text-zinc-400 dark:text-zinc-600 opacity-50" />
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Belum ada grafik perbandingan yang dibuat.</p>
                                <button onClick={addChart} type="button" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-900 dark:hover:decoration-zinc-300 underline-offset-4">
                                    Tambah Grafik Sekarang
                                </button>
                            </div>
                        ) : (
                            <div className={`grid gap-6 items-start ${gridClass} relative z-10`}>
                                {charts.map(chartConfig => (
                                    <PlayerComparisonChart 
                                        key={chartConfig.id} 
                                        config={chartConfig} 
                                        playersData={activePlayersData} // Kita kirim data array pemain yang aktif saja
                                        onUpdate={(newConfig) => updateChart(chartConfig.id, newConfig)}
                                        onRemove={() => removeChart(chartConfig.id)} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
            </div>
        </AuthenticatedLayout>
    );
}