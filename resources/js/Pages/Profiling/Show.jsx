import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Edit3, User } from 'lucide-react';

import PlayerIdentityCard from './Partials/PlayerIdentityCard';
import PlayerBmiWidget from './Partials/PlayerBmiWidget';
import PlayerTopSpeedWidget from './Partials/PlayerTopSpeedWidget';
import PlayerHighestRecords from './Partials/PlayerHighestRecords';

export default function Show({ auth, player }) {
    
    const highestRecords = player.highest_metrics_data || {};
    
    // Ekstrak nilai Top Speed secara spesifik
    const topSpeedValue = highestRecords['highest_velocity'] || highestRecords['max_velocity'] || highestRecords['velocity_max'] || 0;

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle={`Profil Pemain: ${player.name}`} 
            headerDescription="Dashboard identitas, komposisi tubuh, dan rekor performa tertinggi."
        >
            <Head title={`Profil - ${player.name}`} />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* TOOLBAR ATAS */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-lg shadow-sm">
                            <User size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-zinc-900 dark:text-white tracking-widest uppercase">Identitas & Rekor</h2>
                            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Ringkasan data fisik dan batas maksimal pemain.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Link 
                            href={route('profiling.index')} 
                            className="flex items-center gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                        >
                            Kembali
                        </Link>
                        <Link 
                            href={route('players.assessments.index', player.id)} 
                            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                        >
                            <Edit3 size={14} strokeWidth={2.5} /> Update Data Fisik
                        </Link>
                    </div>
                </div>

                {/* AREA UTAMA: MENGGUNAKAN PARTIALS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Kartu Kiri (Identitas) */}
                    <PlayerIdentityCard player={player} />

                    {/* Area Kanan (Widget & Rekor) */}
                    <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PlayerBmiWidget player={player} />
                            <PlayerTopSpeedWidget topSpeedValue={topSpeedValue} />
                        </div>

                        <PlayerHighestRecords highestRecords={highestRecords} />

                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}