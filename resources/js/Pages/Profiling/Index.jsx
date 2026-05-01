import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Activity } from 'lucide-react';

export default function Index({ auth, club, players }) {
    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Player Profiling" headerDescription="Pilih pemain untuk melihat dashboard profil lengkap, input tes fisik, dan analisis performa.">
            <Head title="Player Profiling" />

            <div className="max-w-7xl mx-auto pb-12">
                {!club ? (
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                        <p className="text-zinc-500">Anda belum mengatur profil klub.</p>
                    </div>
                ) : players.length === 0 ? (
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                        <p className="text-zinc-500">Belum ada pemain yang terdaftar di klub.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {players.map(player => (
                            <div key={player.id} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                                <div className="p-5 flex items-start gap-4">
                                    <img 
                                        src={player.photo_url || `https://ui-avatars.com/api/?name=${player.name}&background=787b80&color=fff&bold=true`} 
                                        alt={player.name} 
                                        className="w-16 h-16 rounded-full object-cover border-2 border-zinc-100 dark:border-zinc-800"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-black text-zinc-400">#{String(player.position_number).padStart(2, '0')}</span>
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                {player.position}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 truncate mt-1">{player.name}</h3>
                                        <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                                            {player.age ? `${player.age} thn` : '-'} • {player.height ? `${player.height} cm` : '-'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 flex gap-2">
                                    <Link 
                                        href={route('players.assessments.index', player.id)} 
                                        className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <Activity size={14} /> Input Tes
                                    </Link>
                                    
                                    {/* CHANGED: Now linking to profiling.show */}
                                    <Link 
                                        href={route('profiling.show', player.id)}
                                        className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-bold hover:bg-zinc-800 dark:hover:bg-white transition-colors"
                                    >
                                        Profil <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}