import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    // Animasi gaya Vercel/Geist (Snappy & Subtle)
    const fadeUp = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-50 flex flex-col justify-center items-center p-4 font-sans selection:bg-zinc-800 selection:text-zinc-100">
            <Head title="Login - Tactical Analysis" />

            {/* Subtle background glow effect (opsional, sangat tipis) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-900/50 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
                className="w-full max-w-[380px] z-10"
            >
                {/* Header Section */}
                <motion.div variants={fadeUp} className="mb-8 text-center flex flex-col items-center">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 shadow-sm">
                        <svg className="w-5 h-5 text-zinc-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">Tactical Portal</h1>
                    <p className="text-sm text-zinc-400 mt-1.5">Sign in with your coach credentials</p>
                </motion.div>

                {/* Card Container */}
                <motion.div variants={fadeUp} className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl p-6 shadow-2xl">
                    {status && <div className="mb-4 font-medium text-sm text-zinc-300">{status}</div>}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Username Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-[13px] font-medium text-zinc-300">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={data.username}
                                className="block w-full bg-transparent border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-colors shadow-sm"
                                placeholder="coach_name"
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('username', e.target.value)}
                            />
                            <InputError message={errors.username} className="mt-1" />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-[13px] font-medium text-zinc-300">
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full bg-transparent border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-colors shadow-sm"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center pt-1">
                            <label className="flex items-center cursor-pointer group">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-zinc-500 rounded-[4px] group-hover:border-zinc-500 transition-colors"
                                />
                                <span className="ms-2 text-[13px] text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center h-9 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <svg className="animate-spin h-4 w-4 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
                
                {/* Footer Text */}
                <motion.div variants={fadeUp} className="mt-6 text-center">
                    <p className="text-[12px] text-zinc-500">
                        Soccer Analysis Platform v1.0
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}