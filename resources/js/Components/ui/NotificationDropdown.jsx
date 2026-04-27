import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, PlusCircle, Edit2, Trash2, Activity } from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Ambil data user yang sedang login dan data aktivitas dari Middleware
    const { auth, recentActivities } = usePage().props;
    const currentUser = auth.user;
    
    // Hitung jumlah yang belum dibaca (Max 99+ untuk tampilan rapi)
    const rawUnreadCount = recentActivities.filter(n => !n.is_read).length;
    const unreadBadgeText = rawUnreadCount > 99 ? '99+' : rawUnreadCount;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Perubahan utama: Sesuaikan icon dan warna berdasarkan tipe aktivitas (CRUD)
    const getIcon = (type) => {
        switch(type?.toLowerCase()) {
            case 'create': 
            case 'add':
                return <PlusCircle size={12} className="text-slate-500" />;
            case 'update': 
            case 'edit':
                return <Edit2 size={12} className="text-gray-500" />;
            case 'delete': 
            case 'remove':
                return <Trash2 size={12} className="text-rose-500" />;
            case 'system': 
                return <Activity size={12} className="text-amber-500" />;
            default: 
                return <Bell size={12} className="text-zinc-500" />;
        }
    };

    const markAllAsRead = () => {
        router.post(route('activity.markRead'), {}, {
            preserveScroll: true,
        });
    };

    return (
        <div className="relative z-50" ref={dropdownRef}>
            {/* Tombol Lonceng dengan Badge Angka */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative z-50 w-8 h-8 flex items-center justify-center rounded-md transition-all focus:outline-none shadow-none hover:shadow-sm ${
                    isOpen 
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800'
                }`}
                title="Notifications"
            >
                <Bell size={16} strokeWidth={2.5} />
                
                {/* Badge Angka (Muncul hanya jika ada > 0 notif) */}
                {rawUnreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-slate-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-100 dark:border-zinc-900 shadow-sm z-10">
                        {unreadBadgeText}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <Transition
                show={isOpen}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-2 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-2 scale-95"
            >
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-none z-50 overflow-hidden flex flex-col origin-top-right">
                    
                    <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Activity</h3>
                            {rawUnreadCount > 0 && (
                                <span className="bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    {rawUnreadCount} new
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={markAllAsRead}
                            disabled={rawUnreadCount === 0}
                            className="text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 flex items-center gap-1 transition-colors focus:outline-none"
                        >
                            <CheckCircle2 size={12} />
                            Mark all read
                        </button>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {recentActivities.length === 0 ? (
                            <div className="p-6 text-center text-[13px] text-zinc-500 dark:text-zinc-400">
                                No recent activity.
                            </div>
                        ) : (
                            recentActivities.map((notif) => {
                                const isMe = currentUser.id === notif.actor_id;
                                const displayName = isMe ? 'Anda' : notif.user_name;

                                return (
                                    <Link 
                                        key={notif.id} 
                                        href={notif.href || '#'}
                                        onClick={() => setIsOpen(false)} 
                                        className={`flex items-start gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${!notif.is_read ? 'bg-slate-50/30 dark:bg-slate-900/10' : ''}`}
                                    >
                                        <div className="relative shrink-0">
                                            {notif.user_avatar ? (
                                                <img src={notif.user_avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                                        {displayName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Badge kecil di pojok avatar yang menunjukkan jenis tindakan */}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-sm">
                                                {getIcon(notif.type)}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-snug">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 mr-1">
                                                    {displayName}
                                                </span>
                                                {/* Memperbaiki tata bahasa jika isMe bernilai true */}
                                                {isMe ? notif.action.replace('added', 'menambahkan').replace('updated', 'memperbarui').replace('deleted', 'menghapus') : notif.action}
                                                <span className="font-medium text-zinc-800 dark:text-zinc-200 ml-1">"{notif.target}"</span>
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                                                <span>{notif.date}</span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                                                <span>{notif.time}</span>
                                            </div>
                                        </div>

                                        {!notif.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-slate-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    <div className="p-2 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 shrink-0">
                        <Link 
                            href={route('activity.index')} 
                            onClick={() => setIsOpen(false)}
                            className="block w-full py-2 text-center text-[12px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 rounded-lg transition-all shadow-none hover:shadow-sm"
                        >
                            View all activity
                        </Link>
                    </div>
                </div>
            </Transition>
        </div>
    );
}