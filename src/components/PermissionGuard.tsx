'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface Props {
  /** The permission required to view this page, e.g. "store:read" */
  require: string;
  /** Human-readable module name for error messages */
  moduleName?: string;
  children: React.ReactNode;
}

/**
 * Wraps a page and blocks access if the current user
 * doesn't have the required permission.
 *
 * Admins always pass through regardless of the permission.
 */
export default function PermissionGuard({ require: perm, moduleName, children }: Props) {
  const { currentUser, isLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const toastShown = useRef(false);

  const isAdmin = currentUser?.roles?.includes('admin') ?? false;
  const hasAccess = isAdmin || (currentUser?.permissions?.includes(perm) ?? false);

  useEffect(() => {
    if (!isLoading && currentUser && !hasAccess && !toastShown.current) {
      toastShown.current = true;
      addToast(
        `No tienes permiso para acceder a "${moduleName ?? 'este módulo'}". Contacta al administrador.`,
        'error'
      );
    }
  }, [isLoading, currentUser, hasAccess, addToast, moduleName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse opacity-50 text-lg">Verificando acceso...</div>
      </div>
    );
  }

  if (!currentUser) {
    router.replace('/login');
    return null;
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <ShieldOff size={36} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold mb-2">Acceso Restringido</h2>
          <p className="text-neutral-500 max-w-sm">
            No tienes los permisos necesarios para ver{' '}
            <strong className="text-primary">{moduleName ?? 'este módulo'}</strong>.
            Contacta al administrador del sistema para solicitar acceso.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
        >
          Volver
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
