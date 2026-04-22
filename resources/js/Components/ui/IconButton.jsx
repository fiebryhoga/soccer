export default function IconButton({ icon: Icon, onClick, className = '', ...props }) {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 ${className}`}
            {...props}
        >
            <Icon size={18} strokeWidth={2} />
        </button>
    );
}