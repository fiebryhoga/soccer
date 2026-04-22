import Modal from '@/Components/Modal';
import { Globe, Monitor, Clock, ExternalLink, Activity, Info, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ActivityDetailModal({ show, onClose, activity }) {
    if (!activity) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {/* Pembungkus utama untuk memastikan Dark Mode tereksekusi sempurna di Modal */}
            <div className="bg-white dark:bg-[#121212] overflow-hidden">
                <div className="p-6">
                    
                    {/* Header Modal */}
                    <div className="flex items-center justify-between mb-5 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                            <Info size={18} className="text-zinc-500 dark:text-zinc-400" />
                            <h2 className="text-lg font-semibold">Detail Aktivitas</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Box Highlight: User & Action */}
                        <div className="bg-zinc-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                            <div className="flex items-center gap-3 mb-3">
                                {activity.user_avatar ? (
                                    <img src={activity.user_avatar} alt={activity.user_name} className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                                        <Activity size={18} className="text-zinc-500 dark:text-zinc-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{activity.user_name}</p>
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">{activity.date} • {activity.time}</p>
                                </div>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {activity.action} <span className="font-semibold text-zinc-900 dark:text-zinc-100">"{activity.target}"</span>
                            </p>
                        </div>

                        {/* Box Informasi Teknis */}
                        <div className="space-y-4 px-1">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Informasi Teknis</h3>
                            
                            <div className="flex items-start gap-3">
                                <Clock size={16} className="text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Waktu Server</p>
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">{activity.full_date}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Globe size={16} className="text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">IP Address</p>
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 font-mono">{activity.ip_address}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Monitor size={16} className="text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                                <div className="w-full min-w-0">
                                    <p className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Perangkat / Browser</p>
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed break-words">{activity.user_agent}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Tombol Aksi */}
                    <div className="mt-8 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800/80 pt-5">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors border border-transparent dark:hover:border-zinc-700"
                        >
                            Tutup
                        </button>
                        {activity.href && activity.href !== '#' && (
                            <Link 
                                href={activity.href}
                                className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm flex items-center gap-2"
                            >
                                Menuju Halaman Target
                                <ExternalLink size={14} />
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </Modal>
    );
}