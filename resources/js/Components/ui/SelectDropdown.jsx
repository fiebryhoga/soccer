// resources/js/Components/ui/SelectDropdown.jsx

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function SelectDropdown({ value, onChange, options, className = '', disabled = false, icon: Icon = null }) {
    return (
        <div className="relative w-full">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 z-10">
                    <Icon size={14} strokeWidth={2.5} />
                </div>
            )}
            
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                /* Mengubah bg menjadi solid: bg-white dan dark:bg-[#09090b] */
                className={`w-full appearance-none bg-none bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold rounded-lg py-2 pr-9 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors cursor-pointer shadow-sm disabled:opacity-50 outline-none relative z-0 ${Icon ? 'pl-9' : 'pl-3'} ${className}`}
            >
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400 z-10">
                <ChevronDown size={14} strokeWidth={2.5} />
            </div>
        </div>
    );
}