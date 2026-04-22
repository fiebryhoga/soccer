import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PlusCircle, Edit2, Trash2, Activity, Download, Calendar } from 'lucide-react';
import ActivityDetailModal from './Partials/ActivityDetailModal';

export default function Index({ auth, activities, filters }) {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State untuk Filter
    const [currentTab, setCurrentTab] = useState(filters?.tab || 'all');
    const [filterDate, setFilterDate] = useState(filters?.date || '');

    // Desain ikon minimalis & profesional (tidak "alay")
    const getActivityStyling = (type) => {
        switch(type?.toLowerCase()) {
            case 'create': 
            case 'add':
                return { icon: <PlusCircle size={16} className="text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
            case 'update': 
            case 'edit':
                return { icon: <Edit2 size={16} className="text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-500/10' };
            case 'delete': 
            case 'remove':
                return { icon: <Trash2 size={16} className="text-rose-500" />, bg: 'bg-rose-50 dark:bg-rose-500/10' };
            case 'system': 
                return { icon: <Activity size={16} className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-500/10' };
            default: 
                return { icon: <Activity size={16} className="text-zinc-500" />, bg: 'bg-zinc-100 dark:bg-zinc-800' };
        }
    };

    // Fungsi Reload Data berdasarkan Filter
    const handleFilterChange = (tab, date) => {
        setCurrentTab(tab);
        if (date !== undefined) setFilterDate(date);
        
        router.get(route('activity.index'), { tab, date: date !== undefined ? date : filterDate }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openModal = (activity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            headerTitle="Activity Log"
            headerDescription="Lacak semua tindakan, pembaruan data, dan event sistem di satu tempat."
        >
            <Head title="Activity Log" />

            <div className="w-full pb-12">
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
                    
                    {/* Toolbar / Header */}
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                        
                        {/* Tabs */}
                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <button 
                                onClick={() => handleFilterChange('all')}
                                className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${currentTab === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                            >
                                Semua Aktivitas
                            </button>
                            <button 
                                onClick={() => handleFilterChange('system')}
                                className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${currentTab === 'system' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                            >
                                Hanya Sistem
                            </button>
                        </div>
                        
                        {/* Filters & Export */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar size={14} className="text-zinc-400" />
                                </div>
                                <input 
                                    type="date" 
                                    value={filterDate}
                                    onChange={(e) => handleFilterChange(currentTab, e.target.value)}
                                    className="pl-9 pr-3 py-1.5 text-[13px] border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#0a0a0a] text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    title="Pilih Tanggal"
                                />
                            </div>
                            
                            <a 
                                href={route('activity.export', { tab: currentTab, date: filterDate })}
                                className="flex px-3 py-1.5 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg items-center gap-2 transition-colors shadow-sm"
                            >
                                <Download size={14} />
                                Export CSV
                            </a>
                        </div>
                    </div>

                    {/* Timeline List */}
                    <div className="p-6">
                        {activities.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                                    <Activity size={24} className="text-zinc-300 dark:text-zinc-700" />
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-[14px]">Tidak ada aktivitas yang ditemukan.</p>
                            </div>
                        ) : (
                            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-[1.125rem] space-y-6 pb-4">
                                {activities.map((activity) => {
                                    const style = getActivityStyling(activity.type);
                                    const isMe = auth.user.id === activity.actor_id;
                                    const displayName = isMe ? 'Anda' : activity.user_name; 
                                    
                                    const actionText = isMe 
                                        ? activity.action.replace('menambahkan', 'menambahkan').replace('memperbarui', 'memperbarui').replace('menghapus', 'menghapus') 
                                        : activity.action;
                                    
                                    return (
                                        <div key={activity.id} className="relative group pl-8">
                                            {/* Icon Minimalis */}
                                            <div className={`absolute -left-[1.0625rem] top-1 w-8 h-8 rounded-full border-4 border-white dark:border-[#0a0a0a] flex items-center justify-center ${style.bg} transition-transform group-hover:scale-110`}>
                                                {style.icon}
                                            </div>

                                            {/* Konten Minimalis - Tanpa border warna-warni */}
                                            <div className={`p-4 rounded-xl border transition-all ${!activity.is_read ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800' : 'bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'}`}>
                                                <div className="flex flex-col xl:flex-row justify-between items-start gap-4">
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            {activity.user_avatar ? (
                                                                <img src={activity.user_avatar} alt={displayName} className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{displayName.charAt(0)}</span>
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
                                                        
                                                        <p className="text-[14px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mr-1">
                                                                {displayName}
                                                            </span>
                                                            {actionText} 
                                                            <span className="font-medium text-zinc-800 dark:text-zinc-200 ml-1">"{activity.target}"</span>
                                                        </p>
                                                    </div>

                                                    {/* Tombol Detail Saja, IP disembunyikan agar rapi */}
                                                    <div className="flex items-center shrink-0 mt-2 xl:mt-0 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => openModal(activity)}
                                                            className="px-3 py-1.5 text-[12px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                        >
                                                            Lihat Detail
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

            {/* Render Modal Terpisah */}
            <ActivityDetailModal 
                show={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                activity={selectedActivity} 
            />

        </AuthenticatedLayout>
    );
}