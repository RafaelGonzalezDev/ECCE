'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Trash2, Search, Package } from 'lucide-react';

interface AdminProduct {
  id: number; title: string; price: number; isActive: boolean;
  createdAt: string;
  images: { url: string; publicId: string }[];
  seller: { id: number; firstName: string; lastName: string; businessName: string | null; };
  category: { id: number; name: string; };
}

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AdminProduct[]>('/admin/products');
      setProducts(data);
    } catch (e: any) {
      addToast(e.message || 'Error cargando productos', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.seller.businessName || `${p.seller.firstName} ${p.seller.lastName}`).toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? p.isActive : !p.isActive);
    return matchSearch && matchActive;
  });

  const deactivate = async (p: AdminProduct) => {
    if (!confirm(`¿Desactivar "${p.title}"? Sus imágenes en Cloudinary serán eliminadas para ahorrar recursos. Los datos del producto se conservan.`)) return;
    try {
      await apiFetch(`/admin/products/${p.id}`, { method: 'DELETE' });
      addToast(`Producto "${p.title}" desactivado e imágenes eliminadas de Cloudinary`, 'success');
      await load();
    } catch (e: any) { addToast(e.message || 'Error desactivando producto', 'error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Gestión de Productos</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{products.length} productos en el sistema</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Buscar producto o vendedor..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button key={f} onClick={() => setFilterActive(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${filterActive === f ? 'bg-primary text-white border-primary' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
            {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center opacity-50">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-500">Producto</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Vendedor</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Categoría</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Precio</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Estado</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {filtered.map(p => (
                  <tr key={p.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-neutral-100 dark:border-neutral-800 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0"><Package size={16} className="text-neutral-400" /></div>
                        )}
                        <div>
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-xs text-neutral-500">ID #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">{p.seller.businessName || `${p.seller.firstName} ${p.seller.lastName}`}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded font-semibold">{p.category?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">L {Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${p.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'}`}>
                        {p.isActive ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.isActive && (
                        <button onClick={() => deactivate(p)} title="Desactivar y limpiar Cloudinary"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-12 text-center opacity-50">No se encontraron productos.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
