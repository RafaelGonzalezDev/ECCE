'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ChevronRight, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function Field({ label, icon: Icon, error, touched, children }: {
    label: string; icon: React.ElementType;
    error?: string; touched?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold opacity-80">{label}</label>
            <div className={`relative flex items-center rounded-xl border bg-black/5 dark:bg-white/5 transition-all
        ${touched && error ? 'border-red-500/60 ring-2 ring-red-500/20' : touched && !error ? 'border-emerald-500/60 ring-2 ring-emerald-500/10' : 'border-primary/20 focus-within:ring-2 focus-within:ring-primary/30'}`}
            >
                <span className="pl-3 text-neutral-400 flex-shrink-0"><Icon size={17} /></span>
                {children}
                {touched && (
                    <span className="pr-3 flex-shrink-0">
                        {error ? <XCircle size={16} className="text-red-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
                    </span>
                )}
            </div>
            {touched && error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} />{error}
                </p>
            )}
        </div>
    );
}

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });
    const [errors, setErrors] = useState({ email: '', password: '' });

    const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Correo electrónico inválido.';
    const validatePassword = (v: string) => v.length >= 4 ? '' : 'Contraseña requerida.';

    const handleBlur = (field: 'email' | 'password') => {
        setTouched(prev => ({ ...prev, [field]: true }));
        if (field === 'email') setErrors(prev => ({ ...prev, email: validateEmail(email) }));
        if (field === 'password') setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailErr = validateEmail(email);
        const pwErr = validatePassword(password);
        setTouched({ email: true, password: true });
        setErrors({ email: emailErr, password: pwErr });
        if (emailErr || pwErr) return;

        const result = await login(email, password);
        if (result.ok) {
            addToast('¡Bienvenido/a de vuelta!', 'success');
            router.push('/');
        } else {
            addToast(result.error ?? 'Error al iniciar sesión.', 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 shadow-xl shadow-primary/30 mb-4">
                        <span className="text-white text-2xl font-extrabold">E</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-1">Iniciar sesión</h1>
                    <p className="opacity-65 text-sm">Bienvenido/a de vuelta a ECCE</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-primary/10 shadow-2xl p-8 space-y-5">

                        <Field label="Correo electrónico" icon={Mail} error={errors.email} touched={touched.email}>
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={e => {
                                    setEmail(e.target.value);
                                    if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                                }}
                                onBlur={() => handleBlur('email')}
                                className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                            />
                        </Field>

                        <Field label="Contraseña" icon={Lock} error={errors.password} touched={touched.password}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Tu contraseña"
                                value={password}
                                onChange={e => {
                                    setPassword(e.target.value);
                                    if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                                }}
                                onBlur={() => handleBlur('password')}
                                className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                            />
                            <button type="button" onClick={() => setShowPw(v => !v)} className="px-3 text-neutral-400 hover:text-primary transition-colors">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </Field>

                        {/* Hint for demo */}
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs space-y-1">
                            <p className="font-semibold opacity-70">Credenciales de demostración:</p>
                            <p className="opacity-60">📧 maria@ecce.app — 🔑 password123</p>
                            <p className="opacity-60">📧 juan@ecce.app — 🔑 password123</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2
                shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
                            {isLoading ? 'Verificando...' : 'Ingresar'}
                        </button>

                        <p className="text-center text-sm opacity-65">
                            ¿No tienes cuenta?{' '}
                            <Link href="/register" className="text-primary font-semibold hover:underline">
                                Regístrate gratis
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
