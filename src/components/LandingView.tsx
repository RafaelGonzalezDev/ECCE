'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Zap, ShoppingBag, Store, Users, ArrowRight, Check,
    MessageSquare, Globe, Heart, Shield, Star, Menu, X,
    ArrowUpRight, Mail, Phone, MapPin, Facebook, Instagram, Twitter, User
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const PLANS = [
    {
        name: 'Emprendedor',
        price: '500',
        period: 'mensual',
        description: 'Ideal para quienes inician su camino en el comercio digital.',
        features: [
            'Hasta 20 productos activos',
            'Perfil básico de emprendedor',
            'Gestión básica de inventario',
            'Soporte por comunidad',
            'Chat con clientes limitado'
        ],
        highlight: false,
        btnText: 'Empezar Básico'
    },
    {
        name: 'Crecimiento',
        price: '900',
        period: 'mensual',
        description: 'La opción predilecta para negocios en expansión.',
        features: [
            'Hasta 100 productos activos',
            'Perfil destacado en catálogo',
            'Estadísticas de ventas avanzadas',
            'Soporte técnico prioritario',
            'Chat ilimitado y etiquetas',
            'Publicidad en marketplace'
        ],
        highlight: true,
        btnText: 'Plan Crecimiento'
    },
    {
        name: 'Impulso',
        price: '1,500',
        period: 'mensual',
        description: 'Sin límites para quienes buscan liderar el mercado.',
        features: [
            'Productos activos ilimitados',
            'Perfil Premium verificado',
            'Dashboard de analítica total',
            'Asesoría estratégica 1 a 1',
            'Acceso anticipado a funciones',
            'Personalización visual de tienda',
            'Multiusuario (3 cuentas)'
        ],
        highlight: false,
        btnText: 'Plan Impulso'
    }
];

const FEATURES = [
    {
        title: 'Red de Emprendedores',
        desc: 'Conecta con cientos de personas que, como tú, están transformando el mercado local.',
        icon: Users,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        title: 'Marketplace Inteligente',
        desc: 'Tu tienda abierta 24/7 con las herramientas necesarias para vender y gestionar.',
        icon: ShoppingBag,
        color: 'text-primary',
        bg: 'bg-primary/10'
    },
    {
        title: 'Comunicación Directa',
        desc: 'Sistema de chat integrado para cerrar acuerdos de forma rápida y segura.',
        icon: MessageSquare,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    }
];

// ─── Components ──────────────────────────────────────────────────────────────

export default function LandingView() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col">
            <style jsx global>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float 6s ease-in-out infinite;
                    animation-delay: 3s;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .section-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}</style>

            {/* ── Navbar ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-primary/10 shadow-lg' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-black text-xl">E</span>
                        </div>
                        <span className="text-xl font-black tracking-tight hidden sm:block">ECCE</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Inicio', 'Precios', 'Nosotros', 'Contacto'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold opacity-70 hover:opacity-100 hover:text-primary transition-all">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="px-5 py-2 text-sm font-bold hover:text-primary transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link href="/register" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all">
                            Crear Cuenta
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-neutral-900 border-b border-primary/10 p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
                        {['Inicio', 'Precios', 'Nosotros', 'Contacto'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold opacity-80 py-2">
                                {item}
                            </a>
                        ))}
                        <div className="pt-4 flex flex-col gap-3">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 rounded-xl border border-primary/20 font-bold">
                                Iniciar Sesión
                            </Link>
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 rounded-xl bg-primary text-white font-bold">
                                Crear Cuenta
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-1">
                {/* ── Hero Section ── */}
                <section id="inicio" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
                    {/* Background shapes */}
                    <div className="absolute top-0 right-0 -m-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -m-20 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <Zap size={14} className="fill-current" />
                            Potenciando el espíritu emprendedor
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            El futuro de tu negocio <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-indigo-600">
                                empieza ahora.
                            </span>
                        </h1>

                        <p className="max-w-2xl text-lg md:text-xl opacity-70 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                            La plataforma integral para emprendedores que buscan conectar, vender y automatizar su crecimiento en una red sólida y dinámica.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <Link href="/register" className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:-translate-y-1 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-3">
                                Unirse a ECCE <ArrowRight size={22} />
                            </Link>
                            <Link href="#precios" className="px-10 py-5 bg-white/10 dark:bg-white/5 border border-primary/20 rounded-2xl font-black text-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all text-center">
                                Ver Planes
                            </Link>
                        </div>

                        {/* Visual Floating elements */}
                        <div className="mt-20 relative w-full max-w-4xl h-[400px] hidden md:block">
                            <div className="absolute top-10 left-0 bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-primary/20 shadow-2xl animate-float">
                                <Users size={32} className="text-primary mb-3" />
                                <div className="space-y-2">
                                    <div className="h-2 w-24 bg-primary/20 rounded-full" />
                                    <div className="h-2 w-16 bg-primary/10 rounded-full" />
                                </div>
                            </div>
                            <div className="absolute bottom-10 right-0 bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-primary/20 shadow-2xl animate-float-delayed">
                                <Store size={32} className="text-purple-500 mb-3" />
                                <div className="space-y-2">
                                    <div className="h-2 w-24 bg-purple-500/20 rounded-full" />
                                    <div className="h-2 w-16 bg-purple-500/10 rounded-full" />
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20" />
                                <div className="relative text-[200px] font-black opacity-5 select-none pointer-events-none">ECCE</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Features Section ── */}
                <section id="nosotros" className="py-24 bg-black/5 dark:bg-white/5 px-4 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4">Todo lo que necesitas para escalar</h2>
                            <p className="opacity-60 max-w-xl mx-auto">Herramientas diseñadas para eliminar la fricción técnica y dejarte brillar en lo que mejor haces.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {FEATURES.map((f, i) => (
                                <div key={i} className="group p-8 bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-primary/10 hover:border-primary/40 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
                                    <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                                        <f.icon className={f.color} size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                                    <p className="opacity-70 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Pricing Section ── */}
                <section id="precios" className="py-24 px-4 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Planes de membresía</h2>
                            <p className="opacity-60 max-w-xl mx-auto">Elige el nivel de impulso que tu negocio merece hoy.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                            {PLANS.map((plan, i) => (
                                <div key={i} className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all border
                                    ${plan.highlight
                                        ? 'bg-gradient-to-b from-primary/10 to-transparent border-primary/40 shadow-2xl shadow-primary/10 scale-105 z-10'
                                        : 'bg-white/40 dark:bg-white/5 border-primary/10 hover:border-primary/20'}`}>

                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                                            Más popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                        <p className="text-sm opacity-60 min-h-[40px]">{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black">L {plan.price}</span>
                                            <span className="opacity-60 text-sm font-semibold">/{plan.period}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1">
                                        {plan.features.map((feat, j) => (
                                            <div key={j} className="flex items-start gap-3">
                                                <div className={`mt-1 p-0.5 rounded-full ${plan.highlight ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                                    <Check size={12} />
                                                </div>
                                                <span className="text-sm font-medium opacity-80">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link href="/register" className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95
                                        ${plan.highlight
                                            ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:scale-[1.02]'
                                            : 'border border-primary/20 hover:bg-primary/5'}`}>
                                        {plan.btnText} <ArrowRight size={18} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Why ECCE? ── */}
                <section className="py-24 px-4 bg-primary text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Más que una plataforma, una comunidad que cree en ti.</h2>
                            <div className="space-y-8">
                                {[
                                    { title: 'Soporte 24/7', desc: 'Estamos aquí para resolver cualquier duda en cualquier momento.', icon: Heart },
                                    { title: 'Seguridad Garantizada', desc: 'Tus datos y transacciones están protegidos por tecnología de punta.', icon: Shield },
                                    { title: 'Impacto Regional', desc: 'Forma parte del motor económico que impulsa Honduras.', icon: Globe }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                            <p className="opacity-80 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-8 border border-white/20 shadow-3xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-xl">Testimonio Real</h5>
                                        <div className="flex text-yellow-500">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-current" />)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xl italic font-medium opacity-90 leading-relaxed mb-6">
                                    "Gracias a ECCE pude digitalizar mi venta de repuestos. Lo que más me gusta es el chat con mis clientes y lo fácil que es subir productos. ¡El plan Impulso realmente vale la pena!"
                                </p>
                                <p className="font-bold">— Roberto Sánchez, TecnoHN</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section id="contacto" className="py-24 px-4 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black mb-8">¿Listo para dar el gran salto?</h2>
                        <p className="text-xl opacity-60 mb-12 max-w-2xl mx-auto">
                            Únete hoy a los cientos de emprendedores que ya están transformando su futuro. Sin contratos forzosos, solo crecimiento puro.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all">
                                Crear mi cuenta gratis
                            </Link>
                            <Link href="mailto:soporte@ecce.app" className="w-full sm:w-auto px-10 py-5 bg-black/5 dark:bg-white/10 border border-primary/20 rounded-2xl font-black text-lg hover:bg-black/10 transition-all">
                                Hablar con soporte
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="bg-white dark:bg-neutral-900 border-t border-primary/10 pt-20 pb-10 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black">E</div>
                            <span className="text-xl font-black tracking-tight">ECCE</span>
                        </div>
                        <p className="opacity-60 text-sm leading-relaxed mb-8">
                            Empoderando el ecosistema emprendedor en Honduras y más allá. Conectamos sueños con realidades digitales.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter].map((Social, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                    <Social size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h5 className="font-black text-sm uppercase tracking-widest mb-6">Plataforma</h5>
                        <ul className="space-y-4 opacity-60 text-sm font-semibold">
                            <li><a href="#" className="hover:text-primary transition-colors">Marketplace</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Comunidad</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Eventos</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Directorio</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black text-sm uppercase tracking-widest mb-6">Compañía</h5>
                        <ul className="space-y-4 opacity-60 text-sm font-semibold">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Términos</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Soporte</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black text-sm uppercase tracking-widest mb-6">Newsletter</h5>
                        <p className="text-xs opacity-60 mb-4 font-medium">Recibe tips de ventas y noticias de la red semanalmente.</p>
                        <div className="relative">
                            <input type="email" placeholder="tu@correo.com" className="w-full bg-black/5 dark:bg-white/5 border border-primary/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            <button className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:scale-110 transition-transform">
                                <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto border-t border-primary/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs opacity-40 font-bold tracking-widest uppercase">© 2026 ECCE Platform. Made with ❤️ for entrepreneurs.</p>
                    <div className="flex items-center gap-8 opacity-40 text-xs font-bold uppercase tracking-widest">
                        <span>Honduras 🇭🇳</span>
                        <span>Español 🇪🇸</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
