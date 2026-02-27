'use client';

import Link from 'next/link';
import { ShoppingBag, Store, Zap, Users, ArrowRight, TrendingUp, MessageSquare, Star } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import ProductCard from '@/components/ProductCard';

export default function DashboardView() {
    const { products } = useProducts();

    // Take the 4 newest products for the showcase
    const featuredProducts = products.slice(0, 4);

    const metrics = [
        { label: 'Emprendedores', value: '124+', icon: Users, color: 'text-blue-500' },
        { label: 'Productos Activos', value: '450+', icon: ShoppingBag, color: 'text-primary' },
        { label: 'Ventas Totales', value: '$12k+', icon: TrendingUp, color: 'text-green-500' },
        { label: 'Satisfacción', value: '4.9', icon: Star, color: 'text-yellow-500' },
    ];

    const quickActions = [
        {
            title: 'Ir al Marketplace',
            desc: 'Explora servicios y productos de otros emprendedores.',
            href: '/marketplace',
            icon: ShoppingBag,
            color: 'bg-primary/20 text-primary'
        },
        {
            title: 'Gestionar Mi Tienda',
            desc: 'Publica nuevos productos y revisa tus ventas.',
            href: '/store',
            icon: Store,
            color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
        },
        {
            title: 'Bandeja de Entrada',
            desc: 'Responde a posibles clientes y socios.',
            href: '/messages',
            icon: MessageSquare,
            color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white/5 dark:bg-black/5 border border-primary/10 rounded-[2.5rem] p-8 sm:p-16 lg:p-24 backdrop-blur-sm">
                <div className="absolute top-0 right-0 -m-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -m-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-6">
                        <Zap size={14} className="mr-2 fill-current" />
                        Plataforma de Emprendimiento ECCE
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
                        Impulsa tu Negocio en la <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                            Red de Emprendedores
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl opacity-70 leading-relaxed mb-10 max-w-xl">
                        Conecta, vende y escala tu emprendimiento con herramientas diseñadas para potenciar tu productividad y alcance en el marketplace.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/marketplace"
                            className="px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 text-center flex items-center justify-center gap-2"
                        >
                            Explorar Marketplace
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="/store"
                            className="px-8 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 font-bold text-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10 text-center"
                        >
                            Ver Mi Tienda
                        </Link>
                    </div>
                </div>
            </section>

            {/* Metrics Bar */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {metrics.map((metric, i) => (
                    <div key={i} className="bg-white/5 dark:bg-black/5 border border-primary/5 p-6 rounded-3xl flex flex-col items-center sm:items-start text-center sm:text-left hover:border-primary/20 transition-colors group">
                        <div className={`w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <metric.icon className={metric.color} size={24} />
                        </div>
                        <p className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-1">{metric.label}</p>
                        <h3 className="text-3xl font-black">{metric.value}</h3>
                    </div>
                ))}
            </section>

            {/* Novedades / Featured Products */}
            <section>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                        <h2 className="text-3xl font-black">Novedades en la Red</h2>
                        <p className="opacity-60 font-medium">Últimas publicaciones de nuestra comunidad.</p>
                    </div>
                    <Link href="/marketplace" className="text-primary font-bold hover:underline flex items-center gap-1 group">
                        Ver todo el catálogo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, i) => (
                    <Link
                        key={i}
                        href={action.href}
                        className="p-8 bg-white/5 dark:bg-black/5 border border-primary/10 rounded-[2rem] hover:border-primary/40 transition-all hover:-translate-y-2 group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                            <action.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{action.title}</h3>
                        <p className="opacity-70 leading-relaxed mb-6">{action.desc}</p>
                        <div className="flex items-center text-primary font-bold gap-2 group-hover:gap-3 transition-all">
                            Acceder ahora <ArrowRight size={18} />
                        </div>
                    </Link>
                ))}
            </section>

            {/* Footer-like banner */}
            <section className="py-12 px-4 sm:px-8 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black mb-2">¿Necesitas ayuda con tu perfil?</h3>
                    <p className="opacity-70">Nuestro equipo de soporte está disponible 24/7 para apoyarte.</p>
                </div>
                <Link
                    href="/settings"
                    className="whitespace-nowrap px-8 py-3 bg-white dark:bg-neutral-900 border border-primary/20 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    Centro de Ayuda
                </Link>
            </section>

        </div>
    );
}
