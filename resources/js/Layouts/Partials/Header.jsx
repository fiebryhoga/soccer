export default function Header({ title, description }) {
    if (!title) return null;

    return (
        <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {title}
            </h1>
            {description && (
                <p className="mt-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    {description}
                </p>
            )}
        </header>
    );
}