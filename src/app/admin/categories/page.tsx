'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface Category { id: number; name: string; slug: string; isActive: boolean; }

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Category[]>('/admin/categories');
      setCategories(data);
    } catch (e: any) {
      addToast(e.message || 'Error cargando categorías', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '' }); setModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug }); setModal(true); };

  const autoSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');

  const handleNameChange = (name: string) => {
    setForm(p => ({ ...p, name, slug: editing ? p.slug : autoSlug(name) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/admin/categories/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        addToast(`Categoría "${form.name}" actualizada`, 'success');
      } else {
        await apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify(form) });
        addToast(`Categoría "${form.name}" creada exitosamente`, 'success');
      }
      setModal(false); await load();
    } catch (e: any) { addToast(e.message || 'Error guardando categoría', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (cat: Category) => {
    try {
      await apiFetch(`/admin/categories/${cat.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !cat.isActive }) });
      addToast(`Categoría "${cat.name}" ${!cat.isActive ? 'activada' : 'desactivada'}`, 'info');
      await load();
    } catch (e: any) { addToast(e.message || 'Error cambiando estado', 'error'); }
  };

  const del = async (cat: Category) => {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await apiFetch(`/admin/categories/${cat.id}`, { method: 'DELETE' });
      addToast(`Categoría "${cat.name}" eliminada`, 'success');
      await load();
    } catch (e: any) { addToast(e.message || 'Error eliminando categoría', 'error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Categorías</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{categories.length} categorías registradas</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center opacity-50">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-500">Nombre</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">Slug</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">Estado</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 font-semibold">{cat.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-neutral-500">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${cat.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'}`}>
                      {cat.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-primary transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => toggleActive(cat)} title={cat.isActive ? 'Desactivar' : 'Activar'}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        {cat.isActive ? <ToggleRight size={15} className="text-emerald-500" /> : <ToggleLeft size={15} />}
                      </button>
                      <button onClick={() => del(cat)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && categories.length === 0 && <div className="p-12 text-center opacity-50">No hay categorías.</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold">{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold opacity-70 block mb-1">Nombre *</label>
                <input value={form.name} onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold opacity-70 block mb-1">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm(p => ({...p, slug: e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold text-sm">Cancelar</button>
              <button onClick={save} disabled={saving || !form.name} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60 hover:-translate-y-0.5 transition-all">
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
