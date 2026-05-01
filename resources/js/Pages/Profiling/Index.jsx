// resources/js/Pages/Profiling/Index.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Activity, Search, X, Users, UserX } from 'lucide-react';

export default function Index({ auth, club, players }) {
    
    // State untuk fitur pencarian
    const [searchQuery, setSearchQuery] = useState('');

    // Logika Filter Cerdas (Mencari berdasarkan Nama, Posisi, atau Nomor Punggung)
    const filteredPlayers = useMemo(() => {
        if (!searchQuery.trim()) return players;
        
        const q = searchQuery.toLowerCase();
        return players.filter(player => {
            const matchName = player.name.toLowerCase().includes(q);
            const matchPosition = player.position?.toLowerCase().includes(q);
            const matchNumber = String(player.position_number).includes(q);
            
            return matchName || matchPosition || matchNumber;
        });
    }, [searchQuery, players]);

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Player Profiling" 
            headerDescription="Pusat data komprehensif. Pilih pemain untuk melihat profil, komposisi tubuh, dan riwayat tes fisik."
        >
            <Head title="Player Profiling" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {!club ? (
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
                        <Users size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white">Klub Belum Diatur</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Silakan atur profil klub terlebih dahulu sebelum melihat daftar pemain.</p>
                    </div>
                ) : players.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
                        <UserX size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white">Skuad Kosong</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Belum ada pemain yang terdaftar di sistem. Silakan tambahkan pemain baru.</p>
                    </div>
                ) : (
                    <>
                        {/* TOOLBAR PENCARIAN */}
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
                            <div className="flex items-center gap-3 w-full md:w-1/2 relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" strokeWidth={2.5} />
                                <input 
                                    type="text" 
                                    placeholder="Cari nama, posisi, atau nomor punggung..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 text-sm font-bold rounded-lg pl-11 pr-10 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all shadow-sm"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-md transition-colors"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                                    Total: <span className="text-zinc-900 dark:text-white">{filteredPlayers.length} Pemain</span>
                                </span>
                            </div>
                        </div>

                        {/* HASIL PENCARIAN KOSONG */}
                        {filteredPlayers.length === 0 && (
                            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl p-16 text-center shadow-sm">
                                <Search size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Pemain Tidak Ditemukan</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Tidak ada pemain yang cocok dengan kata kunci "{searchQuery}".</p>
                                <button onClick={() => setSearchQuery('')} className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Reset Pencarian</button>
                            </div>
                        )}

                        {/* DAFTAR KARTU PEMAIN */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {filteredPlayers.map(player => (
                                <div key={player.id} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg dark:hover:shadow-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 group overflow-hidden flex flex-col relative">
                                    
                                    {/* Aksen Nomor Punggung Transparan di Background */}
                                    <div className="absolute -top-4 -right-4 text-zinc-100 dark:text-zinc-900/50 font-black text-7xl select-none pointer-events-none z-0 transition-all group-hover:scale-110">
                                        {String(player.position_number).padStart(2, '0')}
                                    </div>

                                    <div className="p-5 flex items-start gap-4 relative z-10">
                                        <div className="relative">
                                            <img 
                                                src={player.photo_url || `https://ui-avatars.com/api/?name=${player.name}&background=3f3f46&color=fff&bold=true`} 
                                                alt={player.name} 
                                                className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-zinc-900 shadow-sm"
                                            />
                                            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-black rounded uppercase tracking-widest border border-white dark:border-zinc-900 shadow-sm">
                                                {player.position}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h3 className="text-sm font-black text-zinc-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={player.name}>
                                                {player.name}
                                            </h3>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold mt-1 tracking-wider uppercase">
                                                {player.age ? `${player.age} Thn` : '-'} <span className="mx-1 text-zinc-300 dark:text-zinc-700">|</span> {player.height ? `${player.height} cm` : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/30 p-3 flex gap-2 relative z-10">
                                        <Link 
                                            href={route('players.assessments.index', player.id)} 
                                            className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 transition-all shadow-sm"
                                            title="Input Tes Fisik"
                                        >
                                            <Activity size={14} strokeWidth={2.5}/> Tes
                                        </Link>
                                        
                                        <Link 
                                            href={route('profiling.show', player.id)}
                                            className="flex-[1.5] flex justify-center items-center gap-1.5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-[11px] font-bold hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm"
                                            title="Lihat Profil Lengkap"
                                        >
                                            Profil <ChevronRight size={14} strokeWidth={2.5}/>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}