'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, ShieldCheck, Tag, Package,
  ChevronRight, LogOut, ArrowLeft,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/roles', label: 'Roles & Permisos', icon: ShieldCheck },
  { href: '/admin/categories', label: 'Categorías', icon: Tag },
  { href: '/admin/products', label: 'Productos', icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!currentUser || !currentUser.roles.includes('admin'))) {
      router.replace('/');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser?.roles.includes('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg opacity-60">Verificando acceso...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-extrabold text-sm leading-none">Panel Admin</p>
              <p className="text-xs opacity-50 mt-0.5">ECCE Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <item.icon size={17} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          >
            <ArrowLeft size={17} /> Volver al Inicio
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={17} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
