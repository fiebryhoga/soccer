import React from 'react';
import { CalendarDays, Ruler, Weight, MapPin } from 'lucide-react';

export default function PlayerIdentityCard({ player }) {
    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col relative group transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 p-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -top-4 -left-4 text-white/10 dark:text-white/5 font-black text-7xl select-none pointer-events-none">
                    {String(player.position_number).padStart(2, '0')}
                </div>

                <img 
                    src={player.photo_url || `https://ui-avatars.com/api/?name=${player.name}&background=1e3a8a&color=fff&bold=true`} 
                    alt={player.name} 
                    className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-xl relative z-10 bg-white dark:bg-zinc-900"
                />
                <h2 className="text-xl font-black text-white mt-4 relative z-10 tracking-tight">{player.name}</h2>
                <div className="flex items-center gap-2 mt-2 relative z-10">
                    <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-md backdrop-blur-sm border border-white/30">
                        {player.position}
                    </span>
                    <span className="px-3 py-1 bg-black/30 text-white text-[10px] font-black uppercase tracking-widest rounded-md backdrop-blur-sm border border-black/20">
                        No. {player.position_number}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-center divide-y divide-zinc-100 dark:divide-zinc-800/80">
                <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><CalendarDays size={14}/> Umur</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{player.age ? `${player.age} Tahun` : '-'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><Ruler size={14}/> Tinggi Badan</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{player.height ? `${player.height} cm` : '-'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><Weight size={14}/> Berat Badan</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{player.weight ? `${player.weight} kg` : '-'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><MapPin size={14}/> Kewarganegaraan</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{player.nationality || 'Indonesia'}</span>
                </div>
            </div>
        </div>
    );
}