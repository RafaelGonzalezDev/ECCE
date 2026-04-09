'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Plus, Pencil, UserCheck, UserX, ShieldCheck, X, Check } from 'lucide-react';

interface Role { id: number; name: string; }
interface AdminUser {
  id: number; firstName: string; lastName: string; email: string;
  isActive: boolean; roles: Role[]; departamento: string; municipio: string;
  createdAt: string; isEntrepreneur: boolean; businessName: string | null;
  isChurchMember: boolean; churchName: string | null; phone: string | null;
}

const HONDURAS_DEPARTAMENTOS = [
  'Atlántida','Choluteca','Colón','Comayagua','Copán','Cortés','El Paraíso',
  'Francisco Morazán','Gracias a Dios','Intibucá','Islas de la Bahía','La Paz',
  'Lempira','Ocotepeque','Olancho','Santa Bárbara','Valle','Yoro',
];

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', password: '',
  phone: '', departamento: 'Francisco Morazán', municipio: '',
  isEntrepreneur: false, businessName: '', isChurchMember: false, churchName: '',
  roleIds: [] as number[],
};

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [rolesModal, setRolesModal] = useState<AdminUser | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        apiFetch<AdminUser[]>('/admin/users'),
        apiFetch<Role[]>('/admin/roles'),
      ]);
      setUsers(u); setRoles(r);
    } catch (e: any) {
      addToast(e.message || 'Error cargando usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? u.isActive : !u.isActive);
    return matchSearch && matchActive;
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: '',          // never prefill password on edit
      phone: u.phone || '',
      departamento: u.departamento,
      municipio: u.municipio,
      isEntrepreneur: u.isEntrepreneur,
      businessName: u.businessName || '',
      isChurchMember: u.isChurchMember,
      churchName: u.churchName || '',
      roleIds: u.roles.map(r => r.id),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        // PATCH: only send fields that UpdateUserAdminDto accepts — NEVER send password or roleIds
        const updatePayload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
          isChurchMember: form.isChurchMember,
          churchName: form.isChurchMember ? form.churchName || null : null,
          isEntrepreneur: form.isEntrepreneur,
          businessName: form.isEntrepreneur ? form.businessName || null : null,
          departamento: form.departamento,
          municipio: form.municipio,
        };
        await apiFetch(`/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify(updatePayload),
        });
        // Save roles separately via the dedicated endpoint
        await apiFetch(`/admin/users/${editingUser.id}/roles`, {
          method: 'PATCH',
          body: JSON.stringify({ roleIds: form.roleIds }),
        });
        addToast(`Usuario "${form.firstName} ${form.lastName}" actualizado correctamente`, 'success');
      } else {
        // POST to create: includes password + roleIds
        await apiFetch('/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
            isChurchMember: form.isChurchMember,
            churchName: form.isChurchMember ? form.churchName || undefined : undefined,
            isEntrepreneur: form.isEntrepreneur,
            businessName: form.isEntrepreneur ? form.businessName || undefined : undefined,
            departamento: form.departamento,
            municipio: form.municipio,
            roleIds: form.roleIds,
          }),
        });
        addToast(`Usuario "${form.firstName} ${form.lastName}" creado exitosamente`, 'success');
      }
      setShowModal(false);
      await load();
    } catch (e: any) {
      addToast(e.message || 'Error al guardar usuario', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: AdminUser) => {
    try {
      await apiFetch(`/admin/users/${u.id}/toggle-active`, { method: 'PATCH' });
      addToast(
        u.isActive
          ? `Usuario "${u.firstName} ${u.lastName}" desactivado`
          : `Usuario "${u.firstName} ${u.lastName}" activado correctamente`,
        u.isActive ? 'warning' : 'success'
      );
      await load();
    } catch (e: any) {
      addToast(e.message || 'Error cambiando estado del usuario', 'error');
    }
  };

  const openRolesModal = (u: AdminUser) => {
    setRolesModal(u);
    setSelectedRoleIds(u.roles.map(r => r.id));
  };

  const saveRoles = async () => {
    if (!rolesModal) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/users/${rolesModal.id}/roles`, {
        method: 'PATCH',
        body: JSON.stringify({ roleIds: selectedRoleIds }),
      });
      addToast(`Roles de "${rolesModal.firstName} ${rolesModal.lastName}" actualizados`, 'success');
      setRolesModal(null);
      await load();
    } catch (e: any) {
      addToast(e.message || 'Error asignando roles', 'error');
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="text-xs font-semibold opacity-70 block mb-1">{label}</label>
      <input
        type={type}
        value={(form as any)[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Gestión de Usuarios</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text" placeholder="Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button key={f} onClick={() => setFilterActive(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${filterActive === f ? 'bg-primary text-white border-primary' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
            {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center opacity-50">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-500">Usuario</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Roles</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Ubicación</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Estado</th>
                  <th className="px-4 py-3 font-semibold text-neutral-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-neutral-500">{u.email}</p>
                      {u.businessName && <p className="text-xs text-primary">{u.businessName}</p>}
                      {u.churchName && <p className="text-xs text-emerald-600 dark:text-emerald-400">{u.churchName}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map(r => (
                          <span key={r.id} className="px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full border border-primary/20">{r.name}</span>
                        ))}
                        {u.roles.length === 0 && <span className="text-xs text-neutral-400">Sin roles</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{u.municipio}, {u.departamento}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {u.isActive ? <><UserCheck size={12} /> Activo</> : <><UserX size={12} /> Inactivo</>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} title="Editar datos" className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => openRolesModal(u)} title="Gestionar roles" className="p-1.5 rounded-lg hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors"><ShieldCheck size={15} /></button>
                        <button onClick={() => toggleActive(u)} title={u.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                          className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 hover:text-red-500' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-neutral-500 hover:text-emerald-600'}`}>
                          {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-12 text-center opacity-50">No se encontraron usuarios.</div>}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold text-lg">{editingUser ? `Editar: ${editingUser.firstName} ${editingUser.lastName}` : 'Nuevo Usuario'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {field('firstName', 'Nombre *')}
                {field('lastName', 'Apellido *')}
              </div>
              {field('email', 'Email *', 'email')}
              {/* Only show password field on create */}
              {!editingUser && field('password', 'Contraseña *', 'password')}
              {field('phone', 'Teléfono')}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold opacity-70 block mb-1">Departamento</label>
                  <select value={form.departamento} onChange={e => setForm(p => ({ ...p, departamento: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {HONDURAS_DEPARTAMENTOS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                {field('municipio', 'Municipio')}
              </div>

              {/* Emprendedor — dynamic */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <input type="checkbox" checked={form.isEntrepreneur}
                    onChange={e => setForm(p => ({ ...p, isEntrepreneur: e.target.checked, businessName: e.target.checked ? p.businessName : '' }))}
                    className="rounded w-4 h-4 accent-primary" />
                  <span className="text-sm font-semibold">¿Es emprendedor?</span>
                </label>
                {form.isEntrepreneur && (
                  <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3 bg-primary/5">
                    {field('businessName', 'Nombre del negocio')}
                  </div>
                )}
              </div>

              {/* Iglesia — dynamic */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <input type="checkbox" checked={form.isChurchMember}
                    onChange={e => setForm(p => ({ ...p, isChurchMember: e.target.checked, churchName: e.target.checked ? p.churchName : '' }))}
                    className="rounded w-4 h-4 accent-primary" />
                  <span className="text-sm font-semibold">¿Es miembro de una iglesia?</span>
                </label>
                {form.isChurchMember && (
                  <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3 bg-emerald-50 dark:bg-emerald-900/10">
                    {field('churchName', 'Nombre de la iglesia')}
                  </div>
                )}
              </div>

              {/* Roles */}
              <div>
                <label className="text-xs font-semibold opacity-70 block mb-2">Roles asignados</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(r => {
                    const sel = form.roleIds.includes(r.id);
                    return (
                      <button key={r.id} type="button"
                        onClick={() => setForm(p => ({ ...p, roleIds: sel ? p.roleIds.filter(id => id !== r.id) : [...p.roleIds, r.id] }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${sel ? 'bg-primary text-white border-primary' : 'border-neutral-200 dark:border-neutral-700 hover:border-primary'}`}>
                        {sel && <Check size={11} />} {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-60 hover:-translate-y-0.5 transition-all">
                {saving ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roles Modal */}
      {rolesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h2 className="font-bold">Gestionar Roles</h2>
                <p className="text-xs text-neutral-500 mt-0.5">{rolesModal.firstName} {rolesModal.lastName}</p>
              </div>
              <button onClick={() => setRolesModal(null)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-2">
              {roles.map(r => {
                const sel = selectedRoleIds.includes(r.id);
                return (
                  <button key={r.id} type="button"
                    onClick={() => setSelectedRoleIds(p => sel ? p.filter(id => id !== r.id) : [...p, r.id])}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${sel ? 'bg-primary/10 border-primary text-primary' : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50'}`}>
                    {r.name}
                    {sel && <Check size={16} />}
                  </button>
                );
              })}
            </div>
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
              <button onClick={() => setRolesModal(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold text-sm">Cancelar</button>
              <button onClick={saveRoles} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60 hover:-translate-y-0.5 transition-all">
                {saving ? 'Guardando...' : 'Guardar Roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
