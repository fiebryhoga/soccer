// resources/js/Layouts/Partials/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    ShieldCheck,
    Shield, 
    Activity, 
    Settings,
    User,
    Users,
    PanelLeftClose,
    Calendar,
    PanelLeftOpen,
    LifeBuoy,
    LogOut,
    Target,
    LineChart,   
    ChevronDown,
    GitCompare, 
    ActivitySquare, 
    Percent
} from 'lucide-react';
import IconButton from '@/Components/ui/IconButton';

// Komponen Tooltip Kustom untuk Sidebar Minimize
const SidebarTooltip = ({ text, isVisible, isDanger = false }) => {
    if (!isVisible) return null;
    return (
        <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-[11px] font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl pointer-events-none ${
            isDanger 
            ? 'bg-red-600 dark:bg-red-500 text-white' 
            : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
        }`}>
            {text}
            {/* Segitiga kecil panah kiri */}
            <div className={`absolute top-1/2 -left-1 -translate-y-1/2 border-[4px] border-transparent ${
                isDanger 
                ? 'border-r-red-600 dark:border-r-red-500' 
                : 'border-r-zinc-900 dark:border-r-zinc-100'
            }`}></div>
        </div>
    );
};

export default function Sidebar({ isExpanded, setIsExpanded }) {
    
    // PERUBAHAN: Inisialisasi state dari localStorage agar tersimpan saat refresh
    const [openMenus, setOpenMenus] = useState(() => {
        try {
            const savedMenus = localStorage.getItem('sidebarOpenMenus');
            return savedMenus ? JSON.parse(savedMenus) : {};
        } catch (error) {
            console.error('Error reading localStorage', error);
            return {};
        }
    });

    // PERUBAHAN: Simpan ke localStorage setiap kali state openMenus berubah
    useEffect(() => {
        localStorage.setItem('sidebarOpenMenus', JSON.stringify(openMenus));
    }, [openMenus]);

    const toggleMenu = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const navGroups = [
        {
            label: 'Analytics',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, href: route('dashboard'), activeRule: 'dashboard' },
                { name: 'Training Calendar', icon: Calendar, href: route('performance-logs.index'), activeRule: 'performance-logs.*' },
                
                { 
                    name: 'Analysis Data Session', 
                    icon: LineChart, 
                    href: '#', 
                    activeRule: 'analysis.*', 
                    subItems: [
                        { name: 'Comparasion Metric', icon: GitCompare, href: route('analysis.comparison'), activeRule: 'analysis.comparison' },
                        { name: 'Strain & Monotony', icon: ActivitySquare, href: route('analysis.strain'), activeRule: 'analysis.strain' },
                        { name: 'ACWR', icon: Percent, href: route('analysis.acwr'), activeRule: 'analysis.acwr' }
                    ]
                },
            ]
        },
        {
            label: 'Management',
            items: [
                { name: 'Club Info', icon: Shield, href: route('club.index'), activeRule: 'club.*' },
                
                { 
                    name: 'Benchmarks', 
                    icon: Target, 
                    href: '#', 
                    activeRule: 'benchmarks.*', 
                    subItems: [
                        { name: 'Team Benchmark', icon: Users, href: route('benchmarks.index'), activeRule: 'benchmarks.index' },
                        { name: 'Player Benchmark', icon: User, href: route('players.benchmarks.index'), activeRule: 'players.benchmarks.*' }
                    ]
                },
                
                { name: 'Admins', icon: ShieldCheck, href: route('admins.index'), activeRule: 'admins.*' },
            ]
        }
    ];

    return (
        <aside 
            className={`${
                isExpanded ? 'w-64' : 'w-16'
            } hidden sm:flex flex-col bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative z-20 h-full overflow-visible`}
        >
            {/* Header Sidebar */}
            <div className="h-14 shrink-0 flex items-center justify-between px-3 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!isExpanded ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-md">
                        <Activity size={16} strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        Tactical
                    </span>
                </div>
                
                <IconButton 
                    icon={isExpanded ? PanelLeftClose : PanelLeftOpen} 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`shrink-0 ${!isExpanded ? "mx-auto relative group" : ""}`}
                />
            </div>

            {/* Menu Navigasi Scrollable */}
            <div className={`flex-1 py-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isExpanded ? 'overflow-y-auto overflow-x-hidden' : 'overflow-visible'}`}>
                {navGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="px-3">
                        {/* Group Label */}
                        <div className={`mb-2 px-1 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden mb-0'}`}>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                {group.label}
                            </span>
                        </div>

                        {/* Nav Items */}
                        <nav className="space-y-1">
                            {group.items.map((item, index) => {
                                const hasSubItems = !!item.subItems;
                                
                                const isActive = hasSubItems 
                                    ? item.subItems.some(sub => sub.href !== '#' && route().current(sub.activeRule))
                                    : (item.href !== '#' && route().current(item.activeRule)); 
                                
                                const isOpen = openMenus[item.name];

                                return (
                                <div key={index} className="flex flex-col relative group/menu hover:z-50">                                        
                                        {/* Jika Menu Utama memiliki Sub-Menu */}
                                        {hasSubItems ? (
                                            <button
                                                onClick={() => {
                                                    if (!isExpanded) setIsExpanded(true); 
                                                    toggleMenu(item.name);
                                                }}
                                                className={`relative flex items-center z-50 gap-3 px-3 py-3 rounded-lg transition-all duration-200 whitespace-nowrap group w-full ${
                                                    isActive 
                                                        ? 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium' 
                                                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100'
                                                } ${!isExpanded && 'justify-center px-0'}`}
                                                
                                                // Opsi Alternatif: Anda juga bisa pakai title bawaan HTML jika Tooltip kustom dirasa tumpang tindih dengan Popover Sub-menu
                                                // title={!isExpanded ? item.name : undefined}
                                            >
                                                {isActive && isExpanded && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-red-900 dark:bg-zinc-100 rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"></div>
                                                )}

                                                <item.icon size={18} strokeWidth={isActive ? 2.2 : 2} className={`shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                                                
                                                <div className={`flex flex-1 items-center justify-between transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                                                    <span className="text-[13px]">{item.name}</span>
                                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                                                </div>

                                                {/* --- TAMBAHKAN KODE INI DI SINI --- */}
                                                {/* Tooltip untuk Menu Utama yang memiliki Sub-menu */}
                                                <SidebarTooltip text={item.name} isVisible={!isExpanded} />
                                                
                                            </button>
                                        ) : (
                                            /* Render <Link> biasa untuk menu yang tidak memiliki sub-menu */
                                            <Link
                                                href={item.href}
                                                className={`relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 whitespace-nowrap group ${
                                                    isActive 
                                                        ? 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium' 
                                                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100'
                                                } ${!isExpanded && 'justify-center px-0'}`}
                                            >
                                                {isActive && isExpanded && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-zinc-900 dark:bg-zinc-100 rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"></div>
                                                )}

                                                <item.icon size={18} strokeWidth={isActive ? 2.2 : 2} className={`shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                                                
                                                <div className={`flex flex-1 items-center justify-between transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                                                    <span className="text-[13px]">{item.name}</span>
                                                </div>

                                                {/* Tooltip untuk Menu Biasa (Tanpa Sub-menu) */}
                                                <SidebarTooltip text={item.name} isVisible={!isExpanded} />
                                            </Link>
                                        )}

                                        {/* RENDER SUB-ITEMS UNTUK MODE MINIMIZE (Hover Popover Keren) */}
                                        {hasSubItems && !isExpanded && (
                                            <div className="absolute z-50 left-full ml-2 top-0 invisible opacity-0 group-hover/menu:visible group-hover/menu:opacity-100 translate-x-[-10px] group-hover/menu:translate-x-0 transition-all duration-200 pointer-events-auto">
                                                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-xl p-2.5 min-w-[200px]">
                                                    {/* Ini bertindak sebagai judul/tooltip untuk parent */}
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                                                        {item.name}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        {item.subItems.map((sub, subIdx) => {
                                                            const isSubActive = sub.href !== '#' && route().current(sub.activeRule);
                                                            return (
                                                                <Link
                                                                    key={subIdx}
                                                                    href={sub.href}
                                                                    className={`text-[12px] px-2.5 py-2.5 rounded-lg transition-colors w-full flex items-center gap-2.5 ${
                                                                        isSubActive
                                                                        ? 'text-zinc-900 dark:text-zinc-100 font-semibold bg-zinc-100/50 dark:bg-zinc-800/50'
                                                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                                                                    }`}
                                                                >
                                                                    <sub.icon size={14} className={isSubActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"} />
                                                                    {sub.name}
                                                                </Link>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* RENDER SUB-ITEMS UNTUK MODE EXPAND (Shadcn Accordion Style) */}
                                        {hasSubItems && isExpanded && (
                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                                <div className="flex flex-col gap-1 ml-7 pl-3 border-l border-zinc-200 dark:border-zinc-800/80 my-1">
                                                    {item.subItems.map((sub, subIdx) => {
                                                        const isSubActive = sub.href !== '#' && route().current(sub.activeRule);
                                                        return (
                                                            <Link
                                                                key={subIdx}
                                                                href={sub.href}
                                                                className={`text-[12px] px-3 py-2 rounded-md transition-colors w-full flex items-center gap-2.5 ${
                                                                    isSubActive
                                                                    ? 'text-zinc-900 dark:text-zinc-100 font-semibold bg-zinc-100/50 dark:bg-zinc-800/50'
                                                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                                                                }`}
                                                            >
                                                                <sub.icon size={14} className={isSubActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"} />
                                                                {sub.name}
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="shrink-0 p-3 border-t border-zinc-200 dark:border-zinc-800/80">
                <nav className="space-y-1 relative">
                    <Link
                        href="#"
                        className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap group text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100 ${!isExpanded && 'justify-center px-0'}`}
                    >
                        <LifeBuoy size={18} strokeWidth={2} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span className={`text-[13px] transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                            Help & Support
                        </span>
                        
                        {/* Tooltip Help & Support */}
                        <SidebarTooltip text="Help & Support" isVisible={!isExpanded} />
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`w-full relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap group text-red-600/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 ${!isExpanded && 'justify-center px-0'}`}
                    >
                        <LogOut size={18} strokeWidth={2} className="shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
                        <span className={`text-[13px] font-medium transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                            Log Out
                        </span>

                        {/* Tooltip Log Out (Warna Merah) */}
                        <SidebarTooltip text="Log Out" isVisible={!isExpanded} isDanger={true} />
                    </Link>
                </nav>
            </div>
        </aside>
    );
}