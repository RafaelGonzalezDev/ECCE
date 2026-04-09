'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Plus, Pencil, Trash2, X, Check, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface Permission { id: number; name: string; module: string; action: string; description: string | null; }
interface Role { id: number; name: string; description: string | null; isSystem: boolean; permissions: Permission[]; }

// Group permissions by module for the dynamic selector
function groupByModule(perms: Permission[]) {
  return perms.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] ??= []).push(p);
    return acc;
  }, {});
}

export default function AdminRolesPage() {
  const { addToast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState<number | null>(null);

  // Role modal
  const [roleModal, setRoleModal] = useState<'create' | 'edit' | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  // Permission modal
  const [permModal, setPermModal] = useState(false);
  const [newPerm, setNewPerm] = useState({ name: '', module: '', action: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        apiFetch<Role[]>('/admin/roles'),
        apiFetch<Permission[]>('/admin/permissions'),
      ]);
      setRoles(r); setAllPerms(p);
    } catch (e: any) {
      addToast(e.message || 'Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingRole(null); setRoleName(''); setRoleDesc(''); setSelectedPermIds([]);
    setRoleModal('create');
  };

  const openEdit = (role: Role) => {
    setEditingRole(role); setRoleName(role.name); setRoleDesc(role.description || '');
    setSelectedPermIds(role.permissions.map(p => p.id));
    setRoleModal('edit');
  };

  const saveRole = async () => {
    setSaving(true);
    try {
      const body = { name: roleName, description: roleDesc, permissionIds: selectedPermIds };
      if (roleModal === 'edit' && editingRole) {
        await apiFetch(`/admin/roles/${editingRole.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        addToast(`Rol "${roleName}" actualizado con ${selectedPermIds.length} permisos`, 'success');
      } else {
        await apiFetch('/admin/roles', { method: 'POST', body: JSON.stringify(body) });
        addToast(`Rol "${roleName}" creado con ${selectedPermIds.length} permisos`, 'success');
      }
      setRoleModal(null); await load();
    } catch (e: any) { addToast(e.message || 'Error guardando rol', 'error'); } finally { setSaving(false); }
  };

  const deleteRole = async (role: Role) => {
    if (role.isSystem) { addToast('Los roles del sistema no se pueden eliminar.', 'warning'); return; }
    if (!confirm(`¿Eliminar el rol "${role.name}"? Los usuarios que lo tengan asignado lo perderán.`)) return;
    try {
      await apiFetch(`/admin/roles/${role.id}`, { method: 'DELETE' });
      addToast(`Rol "${role.name}" eliminado`, 'success');
      await load();
    } catch (e: any) { addToast(e.message || 'Error eliminando rol', 'error'); }
  };

  const savePerm = async () => {
    setSaving(true);
    try {
      await apiFetch('/admin/permissions', { method: 'POST', body: JSON.stringify(newPerm) });
      addToast(`Permiso "${newPerm.name}" creado`, 'success');
      setPermModal(false); setNewPerm({ name: '', module: '', action: '', description: '' }); await load();
    } catch (e: any) { addToast(e.message || 'Error creando permiso', 'error'); } finally { setSaving(false); }
  };

  const deletePerm = async (id: number) => {
    if (!confirm('¿Eliminar este permiso? Los roles que lo tengan asignado lo perderán automáticamente.')) return;
    try {
      await apiFetch(`/admin/permissions/${id}`, { method: 'DELETE' });
      addToast('Permiso eliminado del catálogo', 'success');
      await load();
    } catch (e: any) { addToast(e.message || 'Error eliminando permiso', 'error'); }
  };

  const togglePerm = (id: number) => {
    setSelectedPermIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const toggleModuleAll = (perms: Permission[]) => {
    const ids = perms.map(p => p.id);
    const allSelected = ids.every(id => selectedPermIds.includes(id));
    setSelectedPermIds(prev => allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const grouped = groupByModule(allPerms);

  return (
    <div className="space-y-8">
      {/* Roles section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold">Roles & Permisos</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Gestión dinámica — asigna permisos por módulo a cada rol</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
            <Plus size={16} /> Nuevo Rol
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center opacity-50">Cargando...</div>
        ) : (
          <div className="space-y-3">
            {roles.map(role => (
              <div key={role.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {role.isSystem && <span title="Rol del sistema" className="inline-flex"><Lock size={14} className="text-neutral-400" /></span>}
                    <div>
                      <p className="font-bold text-sm">{role.name}
                        {role.isSystem && <span className="ml-2 text-xs text-neutral-400 font-normal">(sistema)</span>}
                      </p>
                      <p className="text-xs text-neutral-500">{role.description || 'Sin descripción'} · {role.permissions.length} permisos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(role)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-primary transition-colors"><Pencil size={15} /></button>
                    {!role.isSystem && (
                      <button onClick={() => deleteRole(role)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    )}
                    <button onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
                      {expandedRole === role.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>
                {expandedRole === role.id && (
                  <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.length === 0
                        ? <span className="text-xs text-neutral-400">Sin permisos asignados</span>
                        : role.permissions.map(p => (
                          <span key={p.id} className="px-2 py-0.5 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 rounded font-semibold text-neutral-600 dark:text-neutral-300">{p.name}</span>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions catalog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold">Catálogo de Permisos</h2>
            <p className="text-sm text-neutral-500">Todos los permisos disponibles organizados por módulo</p>
          </div>
          <button onClick={() => setPermModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-bold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Plus size={16} /> Nuevo Permiso
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                <p className="font-bold text-sm capitalize">{module}</p>
              </div>
              <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {perms.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm font-mono font-semibold">{p.name}</p>
                      <p className="text-xs text-neutral-500">{p.description}</p>
                    </div>
                    <button onClick={() => deletePerm(p.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold text-lg">{roleModal === 'create' ? 'Crear Rol' : 'Editar Rol'}</h2>
              <button onClick={() => setRoleModal(null)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold opacity-70 block mb-1">Nombre del Rol *</label>
                  <input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="Ej. consultor_productos"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold opacity-70 block mb-1">Descripción</label>
                  <input value={roleDesc} onChange={e => setRoleDesc(e.target.value)} placeholder="Ej. Solo puede ver productos"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {/* Dynamic permission selector by module */}
              <div>
                <p className="text-sm font-bold mb-3">Permisos del rol — por módulo</p>
                <div className="space-y-3">
                  {Object.entries(grouped).map(([module, perms]) => {
                    const allSel = perms.every(p => selectedPermIds.includes(p.id));
                    const someSel = perms.some(p => selectedPermIds.includes(p.id));
                    return (
                      <div key={module} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                        <div
                          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${allSel ? 'bg-primary/10' : 'bg-neutral-50 dark:bg-neutral-800/50'}`}
                          onClick={() => toggleModuleAll(perms)}
                        >
                          <p className="font-bold text-sm capitalize flex items-center gap-2">
                            <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${allSel ? 'bg-primary border-primary' : someSel ? 'bg-primary/30 border-primary' : 'border-neutral-300 dark:border-neutral-600'}`}>
                              {allSel && <Check size={10} className="text-white" />}
                              {someSel && !allSel && <span className="w-2 h-0.5 bg-primary block" />}
                            </span>
                            {module}
                            <span className="text-xs font-normal text-neutral-400">({perms.filter(p => selectedPermIds.includes(p.id)).length}/{perms.length})</span>
                          </p>
                        </div>
                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {perms.map(p => {
                            const sel = selectedPermIds.includes(p.id);
                            return (
                              <button key={p.id} type="button" onClick={() => togglePerm(p.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all border ${sel ? 'bg-primary/10 border-primary/30 text-primary' : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                                <span className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center ${sel ? 'bg-primary border-primary' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                  {sel && <Check size={9} className="text-white" />}
                                </span>
                                <span>
                                  <span className="font-mono font-semibold">{p.action}</span>
                                  {p.description && <span className="block opacity-60 font-normal">{p.description}</span>}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                <strong>{selectedPermIds.length}</strong> permisos seleccionados
              </div>
            </div>
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
              <button onClick={() => setRoleModal(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold text-sm">Cancelar</button>
              <button onClick={saveRole} disabled={saving || !roleName.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-60 hover:-translate-y-0.5 transition-all">
                {saving ? 'Guardando...' : roleModal === 'create' ? 'Crear Rol' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Permission Modal */}
      {permModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold">Nuevo Permiso</h2>
              <button onClick={() => setPermModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[['name','Nombre (ej: modulo:acción)'],['module','Módulo (ej: marketplace)'],['action','Acción (ej: read)'],['description','Descripción']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-xs font-semibold opacity-70 block mb-1">{l}</label>
                  <input value={(newPerm as any)[k]} onChange={e => setNewPerm(p => ({...p,[k]:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
              <button onClick={() => setPermModal(false)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold text-sm">Cancelar</button>
              <button onClick={savePerm} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60 hover:-translate-y-0.5 transition-all">
                {saving ? 'Guardando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
