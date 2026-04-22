import { Search, Bell, Sun, Moon, Menu, ChevronDown, Command } from 'lucide-react';
import IconButton from '@/Components/ui/IconButton';
import NotificationDropdown from '@/Components/ui/NotificationDropdown';
import { Link } from '@inertiajs/react';

export default function Navbar({ toggleTheme, isDarkMode, user }) {
    return (
        <nav className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] dark:shadow-none z-10 transition-colors">
            
            {/* Kiri: Mobile Menu & Breadcrumb/Command */}
            <div className="flex items-center gap-4 flex-1">
                <IconButton icon={Menu} className="sm:hidden" />
                
                {/* Command Bar (Lebih menonjol ala Spotlight/Raycast) */}
                <button className="hidden sm:flex items-center justify-between w-full max-w-[320px] h-9 px-3 bg-zinc-100/70 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400/20 group shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-2.5">
                        <Search size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                        <span className="text-[13px] font-medium">Quick search...</span>
                    </div>
                    {/* Keyboard Shortcut bergaya tombol fisik */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 border border-zinc-200 dark:border-zinc-700 rounded-[4px] text-[10px] font-sans font-semibold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                            <Command size={10} strokeWidth={2.5} />
                        </kbd>
                        <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 border border-zinc-200 dark:border-zinc-700 rounded-[4px] text-[10px] font-sans font-semibold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                            K
                        </kbd>
                    </div>
                </button>
            </div>

            {/* Kanan: Actions & Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
                
                {/* Segmented Action Pill */}
                <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm dark:shadow-none">
                    <button 
                        onClick={toggleTheme}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 transition-all focus:outline-none shadow-none hover:shadow-sm"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun size={15} strokeWidth={2.5} /> : <Moon size={15} strokeWidth={2.5} />}
                    </button>
                    
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                    
                    <NotificationDropdown />
                </div>
                
                {/* Garis Pemisah Visual */}
                <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800/80"></div>

                {/* Profile Button (Lebih terstruktur) */}
                <Link 
                    href={route('profile.edit')} 
                    className="flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-1 pr-2.5 rounded-full border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50 transition-all cursor-pointer group"
                >
                    <div className="relative">
                        <img 
                            src={user?.profile_photo || `https://ui-avatars.com/api/?name=${user?.name || 'C'}&background=random&color=fff&bold=true`} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover transition-all duration-300 group-hover:ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0a] ring-zinc-200 dark:ring-zinc-700"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full"></div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex flex-col items-start justify-center">
                            <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white leading-none transition-colors">
                                {user?.name || 'Coach Shin'}
                            </span>
                            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-none">
                                Head Analyst
                            </span>
                        </div>
                        <ChevronDown size={14} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 ml-1 transition-colors" />
                    </div>
                </Link>
            </div>
        </nav>
    );
}