import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Video, MessageSquare, Activity, CheckCircle2, MoreVertical, Calendar } from 'lucide-react';

export default function Index({ auth, activities }) {
    
    // Fungsi untuk menentukan warna dan icon berdasarkan tipe aktivitas
    const getActivityStyling = (type) => {
        switch(type) {
            case 'video': 
                return { icon: <Video size={14} className="text-emerald-500" />, bg: 'bg-emerald-100 dark:bg-emerald-500/20' };
            case 'comment': 
                return { icon: <MessageSquare size={14} className="text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-500/20' };
            case 'system': 
                return { icon: <Activity size={14} className="text-amber-500" />, bg: 'bg-amber-100 dark:bg-amber-500/20' };
            default: 
                return { icon: <Activity size={14} className="text-zinc-500" />, bg: 'bg-zinc-100 dark:bg-zinc-800' };
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            headerTitle="Activity Log"
            headerDescription="Track all actions, tactical updates, and system events in one place."
        >
            <Head title="Activity Log" />

            <div className="max-w-4xl pb-12">
                
                {/* Kontainer Utama */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
                    
                    {/* Header/Filter Bar */}
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="flex items-center gap-1">
                            <button className="px-3 py-1.5 text-[13px] font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 shadow-sm transition-colors">
                                All Activities
                            </button>
                            <button className="px-3 py-1.5 text-[13px] font-medium border border-transparent rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                System Logs
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#0a0a0a] transition-colors focus:outline-none" title="Filter by Date">
                                <Calendar size={16} />
                            </button>
                            <button className="hidden sm:flex px-3 py-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-md items-center gap-1.5 transition-colors focus:outline-none">
                                <CheckCircle2 size={14} />
                                Export Log
                            </button>
                        </div>
                    </div>

                    {/* Timeline List */}
                    <div className="p-6">
                        {activities.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
                                No activity recorded yet.
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800/80 ml-[1.125rem] space-y-8 pb-4">
                                {activities.map((activity) => {
                                    const style = getActivityStyling(activity.type);
                                    
                                    // LOGIKA PENTING: Cek siapa pelakunya
                                    const isMe = auth.user.id === activity.actor_id;
                                    const displayName = isMe ? 'Anda' : activity.user_name; // Mengubah notif menjadi activity
                                    
                                    return (
                                        <div key={activity.id} className="relative group pl-8">
                                            {/* Titik Timeline (Icon) */}
                                            <div className={`absolute -left-[1.0625rem] top-1 w-8 h-8 rounded-full border-4 border-white dark:border-[#0a0a0a] flex items-center justify-center ${style.bg} shadow-sm transition-transform group-hover:scale-110`}>
                                                {style.icon}
                                            </div>

                                            {/* Konten Activity */}
                                            <div className={`p-4 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all ${!activity.is_read ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : ''}`}>
                                                <div className="flex justify-between items-start gap-4">
                                                    
                                                    {/* Detail Teks */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {activity.user_avatar ? (
                                                                <img src={activity.user_avatar} alt={displayName} className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                                                    <Activity size={10} className="text-zinc-500" />
                                                                </div>
                                                            )}
                                                            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                                                                {displayName}
                                                            </span>
                                                            <span className="text-[12px] text-zinc-400 dark:text-zinc-500">
                                                                • {activity.date} pada {activity.time}
                                                            </span>
                                                            {!activity.is_read && (
                                                                <span className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                                            )}
                                                        </div>
                                                        
                                                        <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-snug">
                                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mr-1">
                                                                {displayName}
                                                            </span>
                                                            {/* Mengubah notif menjadi activity */}
                                                            {activity.action} 
                                                            <span className="font-medium text-zinc-800 dark:text-zinc-200 ml-1">"{activity.target}"</span>
                                                        </p>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link 
                                                            href={activity.href || '#'}
                                                            className="px-2.5 py-1 text-[11px] font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none">
                                                            <MoreVertical size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}