import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Lock, KeyRound, Check } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            {/* Header dihapus karena sudah ada di Edit.jsx untuk mengurangi redundansi */}
            
            <form onSubmit={updatePassword} className="space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="current_password" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                        Current Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={16} className="text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            className="block w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 dark:focus:ring-zinc-500 dark:focus:border-zinc-500 transition-colors shadow-sm"
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                    </div>
                    <InputError message={errors.current_password} className="mt-1" />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                        New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyRound size={16} className="text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="block w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 dark:focus:ring-zinc-500 dark:focus:border-zinc-500 transition-colors shadow-sm"
                            autoComplete="new-password"
                            placeholder="••••••••"
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password_confirmation" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Check size={16} className="text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type="password"
                            className="block w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 dark:focus:ring-zinc-500 dark:focus:border-zinc-500 transition-colors shadow-sm"
                            autoComplete="new-password"
                            placeholder="••••••••"
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex justify-center items-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {processing ? 'Saving...' : 'Update Password'}
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