import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { User, AtSign, Check } from 'lucide-react';

export default function UpdateProfileInformation({ className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            username: user.username, // Mengubah email menjadi username
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            {/* Header dihapus karena sudah ada di Edit.jsx */}
            
            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="name" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                        Display Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={16} className="text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            type="text"
                            className="block w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 dark:focus:ring-zinc-500 dark:focus:border-zinc-500 transition-colors shadow-sm"
                            required
                            autoComplete="name"
                            placeholder="e.g. Coach Shin"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.name} />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="username" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                        Username (Used for Login)
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <AtSign size={16} className="text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <input
                            id="username"
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className="block w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 dark:focus:ring-zinc-500 dark:focus:border-zinc-500 transition-colors shadow-sm"
                            required
                            autoComplete="username"
                            placeholder="e.g. coach_shin123"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.username} />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex justify-center items-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-x-2"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-300"
                        leaveFrom="opacity-100 translate-x-0"
                        leaveTo="opacity-0 translate-x-2"
                    >
                        <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                            <Check size={14} />
                            <span>Saved successfully.</span>
                        </div>
                    </Transition>
                </div>
            </form>
        </section>
    );
}