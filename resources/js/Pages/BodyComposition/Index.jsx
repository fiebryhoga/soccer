import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Search, Users, Activity, Settings2, Save, Scale, UserX, X, ChevronRight } from 'lucide-react';

export default function Index({ auth, players, benchmarks }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('athletes'); 

    // Fitur Search Cerdas
    const filteredPlayers = useMemo(() => {
        if (!searchQuery.trim()) return players;
        const q = searchQuery.toLowerCase();
        return players.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.position?.toLowerCase().includes(q) || 
            String(p.position_number).includes(q)
        );
    }, [searchQuery, players]);

    const { data: bData, setData: setBData, post, processing } = useForm({
        benchmarks: benchmarks
    });

    const handleBenchmarkChange = (category, key, value) => {
        setBData('benchmarks', {
            ...bData.benchmarks,
            [category]: { ...bData.benchmarks[category], [key]: value === '' ? '' : value }
        });
    };

    const submitBenchmarks = (e) => {
        e.preventDefault();
        post(route('analysis.composition.save-benchmarks'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Body Composition" 
            headerDescription="Manajemen data komposisi tubuh, pengukuran lemak, otot, dan kalibrasi algoritma standar."
        >
            <Head title="Body Composition Tests" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">

                {/* TAB NAVIGASI UTAMA */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl shadow-sm flex flex-col sm:flex-row gap-2 transition-colors">
                    <button 
                        onClick={() => setActiveTab('athletes')} 
                        className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${activeTab === 'athletes' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                    >
                        <Users size={16} /> Daftar Pemain
                    </button>
                    <button 
                        onClick={() => setActiveTab('benchmarks')} 
                        className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${activeTab === 'benchmarks' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                    >
                        <Settings2 size={16} /> Kalibrasi Algoritma
                    </button>
                </div>

                {/* --- TAB: DAFTAR PEMAIN --- */}
                {activeTab === 'athletes' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex items-center justify-between transition-colors">
                            <div className="flex items-center gap-3 w-full md:w-1/2 relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" strokeWidth={2.5} />
                                <input 
                                    type="text" placeholder="Cari nama, posisi, atau nomor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 text-sm font-bold rounded-lg pl-11 pr-10 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all shadow-sm"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {filteredPlayers.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl p-16 text-center shadow-sm">
                                <UserX size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Pemain Tidak Ditemukan</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Tidak ada pemain yang cocok dengan kata kunci "{searchQuery}".</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {filteredPlayers.map(player => (
                                    <Link key={player.id} href={route('analysis.composition.show', player.id)} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-zinc-900/50 transition-all duration-300 group overflow-hidden flex flex-col relative">
                                        
                                        <div className="absolute -top-4 -right-4 text-zinc-100 dark:text-zinc-900/50 font-black text-7xl select-none pointer-events-none z-0 group-hover:scale-110 transition-transform">
                                            {String(player.position_number).padStart(2, '0')}
                                        </div>

                                        <div className="p-5 flex items-start gap-4 relative z-10">
                                            <img src={player.photo_url || `https://ui-avatars.com/api/?name=${player.name}&background=3f3f46&color=fff&bold=true`} alt={player.name} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-zinc-900 shadow-sm"/>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <h3 className="text-sm font-black text-zinc-900 dark:text-white truncate">{player.name}</h3>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold mt-1 tracking-wider uppercase flex items-center gap-1">
                                                    <Activity size={10} className="text-blue-500" /> {player.total_tests || 0} Record
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/30 p-4 relative z-10">
                                            {player.latest_test ? (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Update Terakhir</p>
                                                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">{new Date(player.latest_test.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">BMI Terakhir</span>
                                                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">{player.latest_test.bmi}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-1 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                    Belum Ada Data Komposisi
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB: ALGORITMA BENCHMARKS --- */}
                {activeTab === 'benchmarks' && (
                    <form onSubmit={submitBenchmarks} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in duration-300 transition-colors">
                        
                        <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <Settings2 size={18} className="text-blue-500" /> Parameter Benchmark Global
                                </h3>
                                <p className="text-xs font-medium text-zinc-500 mt-1">Rentang maksimal dari algoritma warna yang mendeteksi obesitas dan rasio otot pemain.</p>
                            </div>
                            <button type="submit" disabled={processing} className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-xs flex justify-center items-center gap-2 shadow-sm hover:bg-blue-700 transition-all disabled:opacity-70">
                                {processing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={16}/>} Simpan Konfigurasi
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* KOLOM KIRI */}
                            <div className="space-y-6">
                                {/* STANDAR BMI */}
                                <div className="bg-zinc-50 dark:bg-[#111113] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                    <div className="bg-zinc-100 dark:bg-zinc-900/80 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                        <h4 className="font-black text-zinc-700 dark:text-zinc-300 text-xs tracking-wider uppercase">Standar BMI (Kg/M²)</h4>
                                        <span className="text-[9px] font-black text-zinc-400 tracking-widest">UNIVERSAL</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-blue-500 font-bold text-xs uppercase tracking-widest">Underweight (&lt;)</span> 
                                            <input type="number" step="0.1" value={bData.benchmarks.bmi.underweight} onChange={e=>handleBenchmarkChange('bmi','underweight',e.target.value)} className="w-20 p-2 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center font-bold text-sm outline-none"/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Normal (&lt;)</span> 
                                            <input type="number" step="0.1" value={bData.benchmarks.bmi.normal} onChange={e=>handleBenchmarkChange('bmi','normal',e.target.value)} className="w-20 p-2 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center font-bold text-sm outline-none"/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">Overweight (&lt;)</span> 
                                            <input type="number" step="0.1" value={bData.benchmarks.bmi.overweight} onChange={e=>handleBenchmarkChange('bmi','overweight',e.target.value)} className="w-20 p-2 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center font-bold text-sm outline-none"/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Obesity I (&lt;)</span> 
                                            <input type="number" step="0.1" value={bData.benchmarks.bmi.obesity1} onChange={e=>handleBenchmarkChange('bmi','obesity1',e.target.value)} className="w-20 p-2 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center font-bold text-sm outline-none"/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KOLOM KANAN (BODY FAT) */}
                            <div className="space-y-6">
                                {/* BODYFAT LAKI-LAKI */}
                                <div className="bg-zinc-50 dark:bg-[#111113] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                    <div className="bg-blue-50 dark:bg-blue-900/10 px-4 py-3 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                                        <h4 className="font-black text-blue-900 dark:text-blue-400 text-xs tracking-wider uppercase">Bodyfat Persentase %</h4>
                                        <span className="text-[9px] font-black text-white bg-blue-500 px-2 py-0.5 rounded uppercase tracking-widest">Pria</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-blue-500 font-bold text-xs uppercase tracking-widest">Esensial (&lt;)</span> 
                                            <input type="number" step="0.1" value={bData.benchmarks.bodyfat_male.essential} onChange={e=>handleBenchmarkChange('bodyfat_male','essential',e.target.value)} className="w-20 p-2 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center font-bold text-sm outline-none"/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Atlet (&lt;)</span> 
                                            <input type="number" step="0.1" value={bData.benchmarks.bodyfat_male.athlete} onChange={e=>handleBenchmarkChange('bodyfat_male','athlete',e.target.value)} className="w-20 p-2 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center font-bold text-sm outline-none"/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-teal-500 font-bold text-xs uppercase tracking-widest">Fitness (&lt;)</span> 
                                            <input type="number" step="0.1" value={bData.benchmarks.bodyfat_male.fitness} onChange={e=>handleBenchmarkChange('bodyfat_male','fitness',e.target.value)} className="w-20 p-2 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center font-bold text-sm outline-none"/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">Acceptable (&lt;)</span> 
                                            <input type="number" step="0.1" value={bData.benchmarks.bodyfat_male.acceptable} onChange={e=>handleBenchmarkChange('bodyfat_male','acceptable',e.target.value)} className="w-20 p-2 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center font-bold text-sm outline-none"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

            </div>
        </AuthenticatedLayout>
    );
}