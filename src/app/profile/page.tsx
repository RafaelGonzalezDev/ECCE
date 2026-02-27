'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Phone, Shield, Bell, Key, LogOut, Edit3, Save, X,
    Church, Briefcase, CheckCircle, Store, MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HONDURAS_DEPARTAMENTOS } from '@/lib/hondurasData';
import Link from 'next/link';

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditProfileModal({ onClose }: { onClose: () => void }) {
    const { currentUser, updateProfile } = useAuth();
    const { addToast } = useToast();

    const [form, setForm] = useState({
        firstName: currentUser?.firstName ?? '',
        lastName: currentUser?.lastName ?? '',
        phone: currentUser?.phone ?? '',
        isChurchMember: currentUser?.isChurchMember ?? false,
        churchName: currentUser?.churchName ?? '',
        isEntrepreneur: currentUser?.isEntrepreneur ?? false,
        businessName: currentUser?.businessName ?? '',
        departamento: currentUser?.departamento ?? '',
        municipio: currentUser?.municipio ?? '',
    });

    const selectedDept = useMemo(() =>
        HONDURAS_DEPARTAMENTOS.find(d => d.nombre === form.departamento),
        [form.departamento]);

    const handleChange = (field: string, value: string | boolean) => {
        const next = { ...form, [field]: value };

        // If department changes, reset municipality
        if (field === 'departamento') {
            next.municipio = '';
        }

        setForm(next);
        // Real-time update as user types
        updateProfile(next as any);
    };

    const handleSave = () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            addToast('Nombre y apellido son obligatorios.', 'warning');
            return;
        }
        if (!form.departamento || !form.municipio) {
            addToast('Departamento y municipio son obligatorios.', 'warning');
            return;
        }
        if (form.isChurchMember && !form.churchName.trim()) {
            addToast('Debes indicar el nombre de tu iglesia.', 'warning');
            return;
        }
        if (form.isEntrepreneur && !form.businessName.trim()) {
            addToast('Debes indicar el nombre de tu negocio.', 'warning');
            return;
        }
        addToast('Perfil actualizado correctamente.', 'success');
        onClose();
    };

    const inputCls = 'w-full bg-black/5 dark:bg-white/5 border border-primary/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-primary/20 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Edit3 size={20} className="text-primary" /> Editar Perfil
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold opacity-60 mb-1 block">Nombre *</label>
                            <input className={inputCls} value={form.firstName}
                                onChange={e => handleChange('firstName', e.target.value)} placeholder="Nombre" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold opacity-60 mb-1 block">Apellido *</label>
                            <input className={inputCls} value={form.lastName}
                                onChange={e => handleChange('lastName', e.target.value)} placeholder="Apellido" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold opacity-60 mb-1 block">Departamento *</label>
                            <select
                                className={inputCls}
                                value={form.departamento}
                                onChange={e => handleChange('departamento', e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {HONDURAS_DEPARTAMENTOS.map(d => (
                                    <option key={d.id} value={d.nombre}>{d.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold opacity-60 mb-1 block">Municipio *</label>
                            <select
                                disabled={!form.departamento}
                                className={inputCls}
                                value={form.municipio}
                                onChange={e => handleChange('municipio', e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {selectedDept?.municipios.map(m => (
                                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold opacity-60 mb-1 block">Teléfono</label>
                        <input className={inputCls} value={form.phone} type="tel"
                            onChange={e => handleChange('phone', e.target.value)} placeholder="+504 9888-1234" />
                    </div>

                    {/* Church toggle */}
                    <button type="button" onClick={() => handleChange('isChurchMember', !form.isChurchMember)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm
              ${form.isChurchMember ? 'border-primary/40 bg-primary/5' : 'border-primary/10 hover:border-primary/20'}`}
                    >
                        <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${form.isChurchMember ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isChurchMember ? 'translate-x-5' : ''}`} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Church size={16} className="text-primary" />
                            <span className="font-medium">Miembro de las Iglesias de Dios</span>
                        </div>
                    </button>
                    {form.isChurchMember && (
                        <div className="pl-4 animate-in slide-in-from-top-1 fade-in duration-150">
                            <label className="text-xs font-semibold opacity-60 mb-1 block">Nombre de la iglesia *</label>
                            <input className={inputCls} value={form.churchName}
                                onChange={e => handleChange('churchName', e.target.value)}
                                placeholder="Iglesia de Dios - Sector/Ciudad" />
                        </div>
                    )}

                    {/* Entrepreneur toggle */}
                    <button type="button" onClick={() => handleChange('isEntrepreneur', !form.isEntrepreneur)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm
              ${form.isEntrepreneur ? 'border-primary/40 bg-primary/5' : 'border-primary/10 hover:border-primary/20'}`}
                    >
                        <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${form.isEntrepreneur ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isEntrepreneur ? 'translate-x-5' : ''}`} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} className="text-primary" />
                            <span className="font-medium">Soy emprendedor/a</span>
                        </div>
                    </button>
                    {form.isEntrepreneur && (
                        <div className="pl-4 animate-in slide-in-from-top-1 fade-in duration-150">
                            <label className="text-xs font-semibold opacity-60 mb-1 block">Nombre del negocio *</label>
                            <input className={inputCls} value={form.businessName}
                                onChange={e => handleChange('businessName', e.target.value)}
                                placeholder="Nombre de tu empresa o marca" />
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-6 border-t border-primary/10">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-primary/20 text-sm font-medium hover:bg-primary/5 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave}
                        className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Save size={16} /> Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Profile Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { currentUser, logout } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);

    const handleLogout = () => {
        logout();
        addToast('Has cerrado sesión correctamente.', 'info');
        router.push('/login');
    };

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                <User size={64} className="opacity-20" />
                <h2 className="text-2xl font-bold">No has iniciado sesión</h2>
                <p className="opacity-60 text-sm">Inicia sesión para ver tu perfil.</p>
                <Link href="/login"
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all text-sm">
                    Ir al inicio de sesión
                </Link>
            </div>
        );
    }

    return (
        <>
            {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Mi Perfil</h1>
                    <p className="opacity-70">Gestiona tu información personal y preferencias.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Left Column ── */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Avatar card */}
                        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-primary/10 shadow-xl flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-1 mb-6 shadow-xl shadow-primary/20">
                                <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                                    <User size={56} className="text-primary/70" />
                                </div>
                            </div>
                            {/* Real-time name display */}
                            <h2 className="text-2xl font-bold mb-1">{currentUser.firstName} {currentUser.lastName}</h2>
                            <p className="text-sm opacity-60 mb-1 flex items-center gap-1.5"><Mail size={13} />{currentUser.email}</p>
                            {currentUser.phone && <p className="text-sm opacity-60 mb-4 flex items-center gap-1.5"><Phone size={13} />{currentUser.phone}</p>}

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                {currentUser.isChurchMember && (
                                    <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                                        <Church size={11} /> Miembro IDdD
                                    </span>
                                )}
                                {currentUser.isEntrepreneur && (
                                    <span className="flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        <Store size={11} /> Emprendedor
                                    </span>
                                )}
                            </div>

                            <div className="w-full flex gap-3">
                                <button onClick={() => setEditOpen(true)}
                                    className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Edit3 size={15} /> Editar Perfil
                                </button>
                                <button onClick={handleLogout}
                                    className="p-2.5 border-2 border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Account status */}
                        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-primary/10 shadow-xl">
                            <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-4">Estado de cuenta</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Ubicación</span>
                                    <span className="text-sm opacity-60 truncate max-w-[60%]">{currentUser.municipio}, {currentUser.departamento}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Membresía</span>
                                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">Activa</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Miembro desde</span>
                                    <span className="text-sm opacity-60">{currentUser.memberSince}</span>
                                </div>
                                {currentUser.isChurchMember && (
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-sm flex items-center gap-1"><Church size={13} className="text-primary" /> Iglesia</span>
                                        <span className="text-xs opacity-60 text-right max-w-[55%]">{currentUser.churchName}</span>
                                    </div>
                                )}
                                {currentUser.isEntrepreneur && (
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-sm flex items-center gap-1"><Briefcase size={13} className="text-primary" /> Negocio</span>
                                        <span className="text-xs opacity-60 text-right">{currentUser.businessName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Security */}
                        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-primary/10 shadow-xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Shield className="text-primary" size={22} /> Seguridad y Acceso
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { title: 'Contraseña', desc: 'Última actualización hace 2 meses', icon: Key, action: 'Cambiar' },
                                    { title: 'Autenticación en 2 Pasos', desc: 'No configurada — recomendada', icon: Shield, action: 'Activar' },
                                    { title: 'Dispositivos Activos', desc: '1 sesión activa actualmente', icon: Bell, action: 'Ver' },
                                ].map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                    <Icon size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</h4>
                                                    <p className="text-xs opacity-60">{item.desc}</p>
                                                </div>
                                            </div>
                                            <button className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-medium transition-colors">
                                                {item.action}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Communication prefs */}
                        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-primary/10 shadow-xl">
                            <h3 className="text-xl font-bold mb-2">Preferencias de Comunicación</h3>
                            <p className="opacity-60 text-sm mb-5">Elige qué notificaciones deseas recibir.</p>
                            <div className="space-y-3">
                                {[
                                    { id: 'marketing', label: 'Noticias y Actualizaciones' },
                                    { id: 'security', label: 'Alertas de Seguridad (Recomendado)' },
                                    { id: 'activity', label: 'Resumen de Actividad' },
                                ].map((pref, i) => (
                                    <label key={pref.id} className="flex items-center justify-between p-4 rounded-2xl border border-primary/10 cursor-pointer hover:bg-primary/5 transition-colors">
                                        <span className="font-medium text-sm">{pref.label}</span>
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${i !== 2 ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${i !== 2 ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Verification badge */}
                        {currentUser.isChurchMember && (
                            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-3xl p-6 border border-primary/20">
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={32} className="text-primary flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold">Miembro verificado</h3>
                                        <p className="text-sm opacity-70">{currentUser.churchName}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
