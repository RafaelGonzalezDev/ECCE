'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, Package, ShieldCheck, Tag, TrendingUp, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalRoles: number;
  totalCategories: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Stats>('/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Usuarios', value: stats.totalUsers, sub: `${stats.activeUsers} activos`, icon: Users, color: 'bg-blue-500' },
    { label: 'Productos', value: stats.totalProducts, sub: `${stats.activeProducts} publicados`, icon: Package, color: 'bg-emerald-500' },
    { label: 'Roles', value: stats.totalRoles, sub: 'Roles del sistema', icon: ShieldCheck, color: 'bg-purple-500' },
    { label: 'Categorías', value: stats.totalCategories, sub: 'Categorías activas', icon: Tag, color: 'bg-amber-500' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1">Panel de Administración</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Vista general del sistema ECCE.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((card) => (
            <div key={card.label} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 flex items-start gap-4 hover:shadow-lg transition-shadow">
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0`}>
                <card.icon size={22} />
              </div>
              <div>
                <p className="text-3xl font-black">{card.value}</p>
                <p className="font-semibold text-sm">{card.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity size={18} className="text-primary" /> Estado del Sistema</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="opacity-70">Usuarios inactivos</span>
            <span className="font-bold text-red-500">{stats ? stats.totalUsers - stats.activeUsers : '-'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="opacity-70">Productos desactivados</span>
            <span className="font-bold text-amber-500">{stats ? stats.totalProducts - stats.activeProducts : '-'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="opacity-70">Módulo Admin</span>
            <span className="font-bold text-emerald-500 flex items-center gap-1"><TrendingUp size={14} /> Operativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
