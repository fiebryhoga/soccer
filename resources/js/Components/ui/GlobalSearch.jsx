import { useState, useEffect, useRef } from 'react';
import { Search, Command, User, ArrowRight, Loader2, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import axios from 'axios';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // 1. Tangani Keyboard Shortcut (Cmd+K / Ctrl+K) untuk Fokus ke Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
            // Tutup dropdown jika tekan Escape
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 2. Klik di luar area pencarian untuk menutup dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 3. Logika Debounce API yang lebih ringan
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsLoading(false);
            // Jangan tutup otomatis jika sedang mengetik, biarkan pengguna melihat pesan "mulai mengetik"
            return;
        }

        setIsLoading(true);
        setIsOpen(true); // Buka dropdown saat mulai mengetik

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await axios.get(route('global.search'), {
                    params: { q: query }
                });
                setResults(response.data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // 4. Navigasi dan Reset
    const handleSelect = (url) => {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
        router.visit(url);
    };

    const clearInput = () => {
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full max-w-[520px] hidden sm:block" ref={containerRef}>
            
            {/* INPUT FIELD LANGSUNG DI NAVBAR */}
            <div className="relative flex items-center w-full h-9 bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-zinc-400/20 focus-within:bg-white dark:focus-within:bg-[#0a0a0a] transition-all overflow-hidden group">
                <Search size={14} className="text-zinc-400 absolute left-3 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
                
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if(query) setIsOpen(true) }}
                    placeholder="Quick search..."
                    className="w-full h-full bg-transparent border-0 pl-8 pr-16 text-[13px] font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:ring-0 outline-none"
                    autoComplete="off"
                />

                {/* Indikator Loading, Tombol X, atau Shortcut Cmd+K */}
                <div className="absolute right-2 flex items-center gap-1">
                    {isLoading ? (
                        <Loader2 size={12} className="text-zinc-400 animate-spin mr-1" />
                    ) : query ? (
                        <button onClick={clearInput} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                            <X size={12} />
                        </button>
                    ) : (
                        <>
                            <kbd className="inline-flex items-center justify-center h-5 px-1 border border-zinc-200 dark:border-zinc-700 rounded-[4px] text-[10px] font-sans font-semibold text-zinc-400 bg-white dark:bg-zinc-800">
                                <Command size={10} strokeWidth={2.5} />
                            </kbd>
                            <kbd className="inline-flex items-center justify-center h-5 min-w-[18px] px-1 border border-zinc-200 dark:border-zinc-700 rounded-[4px] text-[10px] font-sans font-semibold text-zinc-400 bg-white dark:bg-zinc-800">
                                K
                            </kbd>
                        </>
                    )}
                </div>
            </div>

            {/* DROPDOWN HASIL PENCARIAN (POPOVER) */}
            <Transition
                show={isOpen && query.length > 0}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800">
                        
                        {isLoading && results.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Mencari data...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="p-1.5">
                                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                    Hasil Pencarian
                                </div>
                                <ul className="space-y-0.5">
                                    {results.map((result) => (
                                        <li key={`${result.type}-${result.id}`}>
                                            <button
                                                onClick={() => handleSelect(result.url)}
                                                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group text-left"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                {result.avatar ? (
                                                    // Jika ada foto dari database
                                                    <img 
                                                        src={result.avatar} 
                                                        alt={result.title} 
                                                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm" 
                                                    />
                                                ) : (
                                                    // Jika tidak ada foto, gunakan inisial nama seperti di fitur lain
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${result.title}&background=random&color=fff&bold=true`} 
                                                        alt={result.title} 
                                                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm" 
                                                    />
                                                )}
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">{result.title}</span>
                                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{result.subtitle} • {result.type}</span>
                                                    </div>
                                                </div>
                                                <ArrowRight size={12} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 shrink-0" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Tidak ada hasil untuk <span className="font-semibold text-zinc-700 dark:text-zinc-300">"{query}"</span></p>
                            </div>
                        )}
                        
                    </div>
                </div>
            </Transition>
        </div>
    );
}