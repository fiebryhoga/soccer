// resources/js/Layouts/Partials/Sidebar.jsx

import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    ShieldCheck,
    Shield, 
    Activity, 
    Settings, 
    PanelLeftClose,
    Calendar,
    PanelLeftOpen,
    LifeBuoy,
    LogOut,
    Target,
    LineChart,   // <-- Import Ikon untuk Analysis
    ChevronDown  // <-- Import Ikon untuk efek Accordion
} from 'lucide-react';
import IconButton from '@/Components/ui/IconButton';

export default function Sidebar({ isExpanded, setIsExpanded }) {
    
    // State untuk mengontrol Accordion (Menu mana yang sedang terbuka)
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    // Susunan Menu Utama dan Sub-Menu
    const navGroups = [
        {
            label: 'Analytics',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, href: route('dashboard'), activeRule: 'dashboard' },
                { name: 'Training Calendar', icon: Calendar, href: route('performance-logs.index'), activeRule: 'performance-logs.*' },
                
                { 
                    name: 'Analysis Data Session', 
                    icon: LineChart, 
                    href: '#', // Menu utama ini tetap '#', karena dia berfungsi membuka dropdown accordion
                    activeRule: 'analysis.*', 
                    subItems: [
                        { 
                            name: 'Comparasion Metric', 
                            href: route('analysis.comparison'),
                            activeRule: 'analysis.comparison' 
                        },
                        { 
                            name: 'Strain & Monotony', 
                            href: route('analysis.strain'),
                            activeRule: 'analysis.strain' 
                        },
                        { 
                            name: 'ACWR', 
                            href: route('analysis.acwr'),
                            activeRule: 'analysis.acwr' 
                        }
                    ]
                },
            ]
        },
        {
            label: 'Management',
            items: [
                { name: 'Club Info', icon: Shield, href: route('club.index'), activeRule: 'club.*' },
                { name: 'Benchmarks', icon: Target, href: route('benchmarks.index'), activeRule: 'benchmarks.*' },
                { name: 'Admins', icon: ShieldCheck, href: route('admins.index'), activeRule: 'admins.*' },
                { name: 'Settings', icon: Settings, href: '#', activeRule: 'settings.*' },
            ]
        }
    ];

    return (
        <aside 
            className={`${
                isExpanded ? 'w-64' : 'w-16'
            } hidden sm:flex flex-col bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative z-20 h-full overflow-hidden`}
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
                    className={`shrink-0 ${!isExpanded ? "mx-auto" : ""}`}
                    title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                />
            </div>

            {/* Menu Navigasi Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                                
                                // Cek status aktif: Jika punya sub-menu, cek apakah salah satu sub-menu-nya sedang aktif
                                const isActive = hasSubItems 
                                    ? item.subItems.some(sub => sub.href !== '#' && route().current(sub.activeRule))
                                    : (item.href !== '#' && route().current(item.activeRule)); 
                                
                                const isOpen = openMenus[item.name];

                                return (
                                    <div key={index} className="flex flex-col">
                                        
                                        {/* Jika Menu Utama memiliki Sub-Menu */}
                                        {hasSubItems ? (
                                            <button
                                                onClick={() => {
                                                    // Jika sidebar tertutup, auto-expand saat menu diklik
                                                    if (!isExpanded) setIsExpanded(true); 
                                                    toggleMenu(item.name);
                                                }}
                                                className={`relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 whitespace-nowrap group w-full ${
                                                    isActive 
                                                        ? 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 font-medium' 
                                                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100'
                                                } ${!isExpanded && 'justify-center px-0'}`}
                                                title={!isExpanded ? item.name : undefined}
                                            >
                                                {isActive && isExpanded && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-zinc-900 dark:bg-zinc-100 rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(255,255,255,0.1)]"></div>
                                                )}

                                                <item.icon 
                                                    size={18} 
                                                    strokeWidth={isActive ? 2.2 : 2} 
                                                    className={`shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} 
                                                />
                                                
                                                <div className={`flex flex-1 items-center justify-between transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                                                    <span className="text-[13px]">{item.name}</span>
                                                    {/* Ikon panah berputar untuk animasi buka/tutup (shadcn style) */}
                                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                                                </div>
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
                                                title={!isExpanded ? item.name : undefined}
                                            >
                                                {isActive && isExpanded && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-zinc-900 dark:bg-zinc-100 rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(255,255,255,0.1)]"></div>
                                                )}

                                                <item.icon 
                                                    size={18} 
                                                    strokeWidth={isActive ? 2.2 : 2} 
                                                    className={`shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} 
                                                />
                                                
                                                <div className={`flex flex-1 items-center justify-between transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                                                    <span className="text-[13px]">{item.name}</span>
                                                    
                                                    {item.badge && (
                                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex items-center justify-center ${
                                                            isActive 
                                                                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                                        }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        )}

                                        {/* RENDER SUB-ITEMS (Shadcn Accordion Style) */}
                                        {hasSubItems && isExpanded && (
                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                                {/* Garis vertikal tipis (border-l) di sebelah kiri menonjolkan visual hirarki */}
                                                <div className="flex flex-col gap-1 ml-7 pl-3 border-l border-zinc-200 dark:border-zinc-800/80 my-1">
                                                    {item.subItems.map((sub, subIdx) => {
                                                        const isSubActive = sub.href !== '#' && route().current(sub.activeRule);
                                                        return (
                                                            <Link
                                                                key={subIdx}
                                                                href={sub.href}
                                                                className={`text-[12px] px-3 py-2 rounded-md transition-colors w-full flex items-center ${
                                                                    isSubActive
                                                                    ? 'text-zinc-900 dark:text-zinc-100 font-semibold bg-zinc-100/50 dark:bg-zinc-800/50'
                                                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                                                                }`}
                                                            >
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
                <nav className="space-y-1">
                    <Link
                        href="#"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap group text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100 ${!isExpanded && 'justify-center px-0'}`}
                        title={!isExpanded ? "Support" : undefined}
                    >
                        <LifeBuoy size={18} strokeWidth={2} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span className={`text-[13px] transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                            Help & Support
                        </span>
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap group text-red-600/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 ${!isExpanded && 'justify-center px-0'}`}
                        title={!isExpanded ? "Log Out" : undefined}
                    >
                        <LogOut size={18} strokeWidth={2} className="shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
                        <span className={`text-[13px] font-medium transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                            Log Out
                        </span>
                    </Link>
                </nav>
            </div>
        </aside>
    );
}