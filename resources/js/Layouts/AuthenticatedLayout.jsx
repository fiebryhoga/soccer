import { useState, useEffect } from 'react';
import Sidebar from './Partials/Sidebar';
import Navbar from './Partials/Navbar';
import Header from './Partials/Header';

export default function AuthenticatedLayout({ user, headerTitle, headerDescription, children }) {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
        const saved = localStorage.getItem('sidebarExpanded');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        localStorage.setItem('sidebarExpanded', JSON.stringify(isSidebarExpanded));
    }, [isSidebarExpanded]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        // 1. Wadah utama diberi padding (p-4) dan warna background dasar
        <div className="flex h-screen bg-zinc-100 dark:bg-[#000000] p-3 sm:p-4 gap-3 sm:gap-3 overflow-hidden font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
            
            {/* 2. Sidebar (Otomatis menyesuaikan tinggi layar karena flex) */}
            <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />

            {/* 3. Kolom Kanan diberi gap untuk memisahkan Navbar & Main Content */}
            <div className="flex-1 flex flex-col min-w-0 gap-3 sm:gap-3">
                
                {/* Navbar */}
                <Navbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} user={user} />

                {/* 4. Main Content dibungkus dalam "pulau" tersendiri */}
                <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <Header title={headerTitle} description={headerDescription} />
                        
                        <div className="mt-6">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}