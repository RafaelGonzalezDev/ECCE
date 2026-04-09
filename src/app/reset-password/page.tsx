'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation feedback
  const match = password === confirmPassword && password.length > 0;
  const isLengthValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        addToast('Falta el token de seguridad. Usa el enlace completo de tu correo.', 'error');
        return;
    }
    if (!match || !isLengthValid) {
        addToast('Asegúrate de que las contraseñas coincidan y tengan más de 6 caracteres.', 'warning');
        return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password })
      });
      setIsSuccess(true);
    } catch (e: any) {
      addToast(e.message || 'Error restableciendo la contraseña. El enlace puede haber expirado.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
        <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">¡Contraseña restablecida!</h1>
            <p className="text-neutral-500 mb-8">
                Tu contraseña ha sido actualizada con éxito y tu cuenta fue desbloqueada en caso de intentos fallidos. Ya puedes usar tu nueva clave.
            </p>
            <Link href="/login" className="w-full inline-block py-3 rounded-xl bg-primary text-white text-center font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all">
                Ir al inicio de sesión
            </Link>
        </div>
    );
  }

  return (
    <>
        <h1 className="text-2xl font-extrabold mb-2">Crear nueva contraseña</h1>
        <p className="text-neutral-500 text-sm mb-8">
            Ingresa y confirma tu nueva contraseña de acceso.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <label className="text-xs font-semibold opacity-60 mb-2 block uppercase tracking-wider">Nueva Contraseña</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-40">
                <Lock size={18} />
                </div>
                <input
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-black rounded-xl py-3 pl-11 pr-12 text-sm transition-all outline-none"
                placeholder="Mínimo 6 caracteres"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-primary transition-colors">
                    {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
            </div>
            </div>

            <div>
            <label className="text-xs font-semibold opacity-60 mb-2 block uppercase tracking-wider">Confirmar Contraseña</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-40">
                <Lock size={18} />
                </div>
                <input
                type={showPwd ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-black rounded-xl py-3 pl-11 pr-12 text-sm transition-all outline-none"
                placeholder="Repite la contraseña"
                />
            </div>
            {password && confirmPassword && !match && <p className="text-red-500 text-xs mt-2 font-medium">Las contraseñas no coinciden.</p>}
            </div>

            <button
            type="submit"
            disabled={isLoading || !match || !isLengthValid}
            className="w-full flex items-center justify-center py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 transition-all mt-4 gap-2"
            >
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Guardar contraseña'}
            </button>
        </form>
    </>
  );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-black">
            <div className="absolute top-8 left-8">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--primary-color), #9333ea)' }}>
                ECCE
                </Link>
            </div>
    
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl border border-primary/10 animate-in fade-in zoom-in-95 duration-500">
                <Suspense fallback={<div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={32}/></div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
      );
}
