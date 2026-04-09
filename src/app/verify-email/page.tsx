'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace de verificación no es válido o está incompleto.');
      return;
    }

    const verify = async () => {
      try {
        const res = await apiFetch<any>(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.message || 'Correo verificado exitosamente. Ya puedes iniciar sesión.');
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'El enlace ha expirado o ya fue utilizado.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-black p-4">
      <div className="absolute top-8 left-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--primary-color), #9333ea)' }}>
          ECCE
        </h2>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl border border-primary/10 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          {status === 'loading' && <Loader2 size={64} className="text-primary animate-spin" />}
          {status === 'success' && <CheckCircle size={64} className="text-emerald-500" />}
          {status === 'error' && <XCircle size={64} className="text-red-500" />}
        </div>
        
        <h1 className="text-2xl font-bold mb-3">
          {status === 'loading' && 'Verificando...'}
          {status === 'success' && '¡Cuenta Verificada!'}
          {status === 'error' && 'Error de Verificación'}
        </h1>
        
        <p className="text-neutral-500 mb-8">{message}</p>

        {status !== 'loading' && (
          <Link 
            href="/login" 
            className="w-full inline-block py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-transform"
          >
            Ir al inicio de sesión
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Cargando modulo...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
