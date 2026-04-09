'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      setIsSent(true);
      addToast('Si el correo existe, recibirás un enlace de recuperación pronto.', 'info');
    } catch (e: any) {
      addToast(e.message || 'Error intentando enviar el correo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-black">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--primary-color), #9333ea)' }}>
          ECCE
        </Link>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl border border-primary/10 animate-in fade-in zoom-in-95 duration-500">
        
        {isSent ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Revisa tu correo</h1>
            <p className="text-neutral-500 mb-8">
              Hemos enviado instrucciones para recuperar tu contraseña a <strong className="text-current opacity-80">{email}</strong>.
              El enlace expirará en 1 hora.
            </p>
            <Link href="/login" className="w-full inline-block py-3 rounded-xl border border-primary/20 text-center font-bold hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary mb-6 transition-colors">
              <ArrowLeft size={16} /> Volver
            </Link>

            <h1 className="text-2xl font-extrabold mb-2">Recuperar cuenta</h1>
            <p className="text-neutral-500 text-sm mb-8">
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-semibold opacity-60 mb-2 block uppercase tracking-wider">Correo electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-40">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-black rounded-xl py-3 pl-11 pr-4 text-sm transition-all outline-none"
                    placeholder="tu-correo@ejemplo.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full flex items-center justify-center py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 transition-all gap-2"
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Procesando...</> : 'Enviar instrucciones'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
