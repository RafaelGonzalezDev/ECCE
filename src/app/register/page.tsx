'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Lock, Phone, ChevronRight, Eye, EyeOff,
    Church, Briefcase, CheckCircle, XCircle, AlertCircle, Loader2, MapPin
} from 'lucide-react';
import { useAuth, RegisterData } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HONDURAS_DEPARTAMENTOS } from '@/lib/hondurasData';

// ─── Validation helpers ───────────────────────────────────────────────────────
const validators = {
    firstName: (v: string) => v.trim().length >= 2 ? '' : 'Mínimo 2 caracteres.',
    lastName: (v: string) => v.trim().length >= 2 ? '' : 'Mínimo 2 caracteres.',
    email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Correo electrónico inválido.',
    phone: (v: string) => v === '' || /^\+?[\d\s\-()]{7,}$/.test(v) ? '' : 'Número de teléfono inválido.',
    password: (v: string) => {
        if (v.length < 8) return 'Mínimo 8 caracteres.';
        if (!/[A-Z]/.test(v)) return 'Debe incluir al menos una mayúscula.';
        if (!/[0-9]/.test(v)) return 'Debe incluir al menos un número.';
        return '';
    },
    confirmPassword: (v: string, ref: string) => v === ref ? '' : 'Las contraseñas no coinciden.',
    churchName: (v: string, required: boolean) => required && v.trim().length < 3 ? 'Nombre de iglesia requerido (mín. 3 caracteres).' : '',
    businessName: (v: string, required: boolean) => required && v.trim().length < 2 ? 'Nombre de empresa requerido.' : '',
    departamento: (v: string) => v === '' ? 'Selecciona un departamento.' : '',
    municipio: (v: string) => v === '' ? 'Selecciona un municipio.' : '',
};

function passwordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: 'Muy débil', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Débil', color: 'bg-orange-500' };
    if (score === 3) return { score, label: 'Moderada', color: 'bg-amber-500' };
    if (score === 4) return { score, label: 'Fuerte', color: 'bg-emerald-500' };
    return { score, label: 'Muy fuerte', color: 'bg-emerald-600' };
}

interface FormValues {
    firstName: string; lastName: string; email: string;
    phone: string; password: string; confirmPassword: string;
    isChurchMember: boolean; churchName: string;
    isEntrepreneur: boolean; businessName: string;
    departamento: string; municipio: string;
}

interface FormErrors { [key: string]: string }

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ label, icon: Icon, error, touched, children }: {
    label: string; icon: React.ElementType;
    error?: string; touched?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold opacity-80">{label}</label>
            <div className={`relative flex items-center rounded-xl border bg-black/5 dark:bg-white/5 transition-all
        ${touched && error ? 'border-red-500/60 ring-2 ring-red-500/20' : touched && !error ? 'border-emerald-500/60 ring-2 ring-emerald-500/10' : 'border-primary/20 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40'}`}
            >
                <span className="pl-3 text-neutral-400 flex-shrink-0"><Icon size={17} /></span>
                {children}
                {touched && (
                    <span className="pr-3 flex-shrink-0">
                        {error ? <XCircle size={16} className="text-red-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
                    </span>
                )}
            </div>
            {touched && error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} />{error}
                </p>
            )}
        </div>
    );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }: {
    checked: boolean; onChange: () => void;
    label: string; description?: string;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
        ${checked ? 'border-primary/40 bg-primary/5' : 'border-primary/10 hover:border-primary/20'}`}
        >
            <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <div>
                <p className="font-semibold text-sm">{label}</p>
                {description && <p className="text-xs opacity-60">{description}</p>}
            </div>
        </button>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
    const { register, isLoading } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [values, setValues] = useState<FormValues>({
        firstName: '', lastName: '', email: '', phone: '',
        password: '', confirmPassword: '',
        isChurchMember: false, churchName: '',
        isEntrepreneur: false, businessName: '',
        departamento: '', municipio: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const pwStrength = passwordStrength(values.password);

    // Filtered municipios based on selected departamento
    const selectedDept = useMemo(() =>
        HONDURAS_DEPARTAMENTOS.find(d => d.nombre === values.departamento),
        [values.departamento]);

    const validate = useCallback((field: string, val: FormValues): string => {
        switch (field) {
            case 'firstName': return validators.firstName(val.firstName);
            case 'lastName': return validators.lastName(val.lastName);
            case 'email': return validators.email(val.email);
            case 'phone': return validators.phone(val.phone);
            case 'password': return validators.password(val.password);
            case 'confirmPassword': return validators.confirmPassword(val.confirmPassword, val.password);
            case 'churchName': return validators.churchName(val.churchName, val.isChurchMember);
            case 'businessName': return validators.businessName(val.businessName, val.isEntrepreneur);
            case 'departamento': return validators.departamento(val.departamento);
            case 'municipio': return validators.municipio(val.municipio);
            default: return '';
        }
    }, []);

    const handleChange = (field: keyof FormValues, value: string | boolean) => {
        const next = { ...values, [field]: value };

        // If department changes, reset municipality
        if (field === 'departamento') {
            next.municipio = '';
        }

        setValues(next);
        if (touched[field]) {
            setErrors(prev => ({ ...prev, [field]: validate(field, next) }));
        }
        // Re-validate confirmPassword when password changes
        if (field === 'password' && touched.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: validators.confirmPassword(next.confirmPassword, next.password) }));
        }
        // Re-validate churchName / businessName when toggles change
        if ((field === 'isChurchMember') && touched.churchName) {
            setErrors(prev => ({ ...prev, churchName: validators.churchName(next.churchName, next.isChurchMember) }));
        }
        if ((field === 'isEntrepreneur') && touched.businessName) {
            setErrors(prev => ({ ...prev, businessName: validators.businessName(next.businessName, next.isEntrepreneur) }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({ ...prev, [field]: validate(field, values) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Touch all fields to trigger validation display
        const allFields = [
            'firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword',
            'churchName', 'businessName', 'departamento', 'municipio'
        ];
        const newTouched: Record<string, boolean> = {};
        const newErrors: FormErrors = {};
        allFields.forEach(f => {
            newTouched[f] = true;
            newErrors[f] = validate(f, values);
        });
        setTouched(newTouched);
        setErrors(newErrors);

        const hasError = Object.values(newErrors).some(e => e !== '');
        if (hasError) {
            addToast('Por favor corrige los errores antes de continuar.', 'warning');
            return;
        }

        const data: RegisterData = {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            password: values.password,
            phone: values.phone.trim(),
            isChurchMember: values.isChurchMember,
            churchName: values.isChurchMember ? values.churchName.trim() : '',
            isEntrepreneur: values.isEntrepreneur,
            businessName: values.isEntrepreneur ? values.businessName.trim() : '',
            departamento: values.departamento,
            municipio: values.municipio,
        };

        const result = await register(data);
        if (result.ok) {
            addToast(`¡Bienvenido/a, ${data.firstName}! Tu cuenta fue creada exitosamente.`, 'success');
            router.push('/');
        } else {
            addToast(result.error ?? 'Error desconocido.', 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-xl relative">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 shadow-xl shadow-primary/30 mb-4">
                        <span className="text-white text-2xl font-extrabold">E</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-1">Crear cuenta</h1>
                    <p className="opacity-65 text-sm">Únete a la comunidad ECCE</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-primary/10 shadow-2xl p-8 space-y-5">

                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Nombre *" icon={User} error={errors.firstName} touched={touched.firstName}>
                                <input
                                    type="text"
                                    placeholder="María"
                                    value={values.firstName}
                                    onChange={e => handleChange('firstName', e.target.value)}
                                    onBlur={() => handleBlur('firstName')}
                                    className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                                />
                            </Field>
                            <Field label="Apellido *" icon={User} error={errors.lastName} touched={touched.lastName}>
                                <input
                                    type="text"
                                    placeholder="González"
                                    value={values.lastName}
                                    onChange={e => handleChange('lastName', e.target.value)}
                                    onBlur={() => handleBlur('lastName')}
                                    className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                                />
                            </Field>
                        </div>

                        {/* Email */}
                        <Field label="Correo electrónico *" icon={Mail} error={errors.email} touched={touched.email}>
                            <input
                                type="email"
                                placeholder="maria@ejemplo.com"
                                value={values.email}
                                onChange={e => handleChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                            />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Departamento */}
                            <Field label="Departamento *" icon={MapPin} error={errors.departamento} touched={touched.departamento}>
                                <select
                                    value={values.departamento}
                                    onChange={e => handleChange('departamento', e.target.value)}
                                    onBlur={() => handleBlur('departamento')}
                                    className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="dark:bg-neutral-900">Seleccionar...</option>
                                    {HONDURAS_DEPARTAMENTOS.map(d => (
                                        <option key={d.id} value={d.nombre} className="dark:bg-neutral-900">{d.nombre}</option>
                                    ))}
                                </select>
                            </Field>

                            {/* Municipio */}
                            <Field label="Municipio *" icon={MapPin} error={errors.municipio} touched={touched.municipio}>
                                <select
                                    disabled={!values.departamento}
                                    value={values.municipio}
                                    onChange={e => handleChange('municipio', e.target.value)}
                                    onBlur={() => handleBlur('municipio')}
                                    className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none appearance-none cursor-pointer disabled:opacity-50"
                                >
                                    <option value="" className="dark:bg-neutral-900">Seleccionar...</option>
                                    {selectedDept?.municipios.map(m => (
                                        <option key={m.id} value={m.nombre} className="dark:bg-neutral-900">{m.nombre}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Phone */}
                        <Field label="Teléfono (opcional)" icon={Phone} error={errors.phone} touched={touched.phone}>
                            <input
                                type="tel"
                                placeholder="+504 9888-1234"
                                value={values.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                                onBlur={() => handleBlur('phone')}
                                className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                            />
                        </Field>

                        {/* Password */}
                        <Field label="Contraseña *" icon={Lock} error={errors.password} touched={touched.password}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Mínimo 8 caracteres"
                                value={values.password}
                                onChange={e => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                            />
                            <button type="button" onClick={() => setShowPw(v => !v)} className="px-3 text-neutral-400 hover:text-primary transition-colors">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </Field>

                        {/* Password strength */}
                        {values.password.length > 0 && (
                            <div className="space-y-1 -mt-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                                    ))}
                                </div>
                                <p className={`text-xs font-medium ${pwStrength.score >= 4 ? 'text-emerald-500' : pwStrength.score >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
                                    Seguridad: {pwStrength.label}
                                </p>
                            </div>
                        )}

                        {/* Confirm Password */}
                        <Field label="Confirmar contraseña *" icon={Lock} error={errors.confirmPassword} touched={touched.confirmPassword}>
                            <input
                                type={showConfirmPw ? 'text' : 'password'}
                                placeholder="Repite tu contraseña"
                                value={values.confirmPassword}
                                onChange={e => handleChange('confirmPassword', e.target.value)}
                                onBlur={() => handleBlur('confirmPassword')}
                                className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                            />
                            <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="px-3 text-neutral-400 hover:text-primary transition-colors">
                                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </Field>

                        {/* Divider */}
                        <div className="border-t border-primary/10 pt-2">
                            <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-3">Información adicional</p>

                            {/* Church member */}
                            <div className="space-y-3">
                                <Toggle
                                    checked={values.isChurchMember}
                                    onChange={() => handleChange('isChurchMember', !values.isChurchMember)}
                                    label="Soy miembro de las Iglesias de Dios"
                                    description="Activa para agregar tu congregación"
                                />
                                {values.isChurchMember && (
                                    <div className="pl-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <Field label="Nombre de la iglesia *" icon={Church} error={errors.churchName} touched={touched.churchName}>
                                            <input
                                                type="text"
                                                placeholder="Iglesia de Dios - Ciudad/Sector"
                                                value={values.churchName}
                                                onChange={e => handleChange('churchName', e.target.value)}
                                                onBlur={() => handleBlur('churchName')}
                                                className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                                            />
                                        </Field>
                                    </div>
                                )}

                                {/* Entrepreneur */}
                                <Toggle
                                    checked={values.isEntrepreneur}
                                    onChange={() => handleChange('isEntrepreneur', !values.isEntrepreneur)}
                                    label="Soy emprendedor/a"
                                    description="Activa para publicar productos en el marketplace"
                                />
                                {values.isEntrepreneur && (
                                    <div className="pl-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <Field label="Nombre del negocio *" icon={Briefcase} error={errors.businessName} touched={touched.businessName}>
                                            <input
                                                type="text"
                                                placeholder="Mi negocio"
                                                value={values.businessName}
                                                onChange={e => handleChange('businessName', e.target.value)}
                                                onBlur={() => handleBlur('businessName')}
                                                className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none"
                                            />
                                        </Field>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2
                shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
                            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>

                        <p className="text-center text-sm opacity-65">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
