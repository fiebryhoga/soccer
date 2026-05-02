import React from 'react';
import { PlusCircle, Activity } from 'lucide-react';

export default function ProfileHeader({ player, onOpenModal }) {
    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-5 flex flex-col md:flex-row justify-between items-center gap-5 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                <img 
                    src={player.photo_url || `https://ui-avatars.com/api/?name=${player.name}&background=3f3f46&color=fff&bold=true`} 
                    alt={player.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-zinc-100 dark:border-zinc-800 shadow-sm"
                />
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded border border-blue-200 dark:border-blue-800/50 shadow-sm">
                            {player.position}
                        </span>
                        <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                            No. {String(player.position_number).padStart(2, '0')}
                        </span>
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{player.name}</h2>
                </div>
            </div>

            <button 
                onClick={onOpenModal} 
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-sm transition-colors relative z-10"
            >
                <PlusCircle size={16} strokeWidth={2.5} /> Input Hasil Tes Baru
            </button>
        </div>
    );
}