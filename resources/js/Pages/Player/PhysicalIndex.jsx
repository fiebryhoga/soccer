// resources/js/Pages/Player/PhysicalIndex.jsx

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { User, ChevronRight, ActivitySquare } from 'lucide-react';

export default function PhysicalIndex({ auth, players }) {
    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Physical Profiling Hub" headerDescription="Pilih atlet untuk melihat atau menginput hasil tes fisik mereka.">
            <Head title="Physical Profiling" />

            <div className="max-w-6xl mx-auto pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {players.map((player) => (
                        <Link 
                            key={player.id} 
                            href={route('players.physical.show', player.id)}
                            className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all group flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors mb-4">
                                <User size={28} />
                            </div>
                            
                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-1">{player.name}</h3>
                            <div className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded mb-4">
                                NO. PUNGGUNG: {String(player.position_number).padStart(2, '0')}
                            </div>
                            
                            <div className="mt-auto w-full pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-400 group-hover:text-blue-500 transition-colors">
                                <ActivitySquare size={14} /> Buka Profil Fisik <ChevronRight size={14} />
                            </div>
                        </Link>
                    ))}
                </div>

                {players.length === 0 && (
                    <div className="text-center p-12 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm font-bold text-zinc-500">Belum ada data pemain di database.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}