'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { User, MapPin, Calendar, Star, MessageSquare } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useProducts } from '@/context/ProductContext';
import React from 'react';

export default function StorePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = React.use(params);
    const numericUserId = parseInt(userId, 10);
    const { openChat } = useChat();
    const { products, loading } = useProducts();
    const [activeTab, setActiveTab] = useState<'catalogo' | 'resenas' | 'politicas'>('catalogo');

    const storeProducts = products.filter(p => p.seller.id === numericUserId);
    
    // Si la lista de productos cargó pero no hay productos, mostramos un fallback básico, de caso contrario extraemos el nombre del vendedor del primer producto.
    const sellerBasicInfo = storeProducts.length > 0 ? storeProducts[0].seller : { id: numericUserId, name: 'Emprendedor', businessName: 'Tienda', avatarUrl: undefined as string | undefined, municipio: undefined as string | undefined, departamento: undefined as string | undefined, createdAt: undefined as string | undefined };

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 py-20 text-center opacity-60">Cargando perfil de tienda...</div>;
    }

    const mockReviews = [
        { id: 1, user: 'Miguel L.', rating: 5, date: 'Hace 2 semanas', content: 'Excelente servicio, muy recomendado. La atención fue rápida y el producto superó mis expectativas.' },
        { id: 2, user: 'Sofía R.', rating: 4, date: 'Hace 1 mes', content: 'Todo muy bien, aunque tardó un poco más de lo esperado en la entrega. Volvería a comprar.' },
        { id: 3, user: 'Javier P.', rating: 5, date: 'Hace 2 meses', content: 'El nivel de profesionalismo de este emprendedor es top. El trato fue inmejorable y la calidad 10/10.' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Cover and Profile Banner */}
            <div className="mb-12 rounded-3xl overflow-hidden border border-primary/10 shadow-lg relative bg-white/5 dark:bg-black/5 backdrop-blur-md">
                <div className="h-48 md:h-64 bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/10" />

                <div className="px-6 md:px-12 pb-8 flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 md:-mt-24 relative z-10">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white dark:bg-black p-1 shadow-xl border border-primary/20 overflow-hidden">
                        {sellerBasicInfo.avatarUrl ? (
                            <img src={sellerBasicInfo.avatarUrl} alt={sellerBasicInfo.businessName || sellerBasicInfo.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white">
                                <User size={64} className="opacity-80" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left pt-4 md:pt-0">
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-2">{sellerBasicInfo.businessName || sellerBasicInfo.name}</h1>
                        <p className="text-lg opacity-70 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                            Tienda de Emprendedor
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium opacity-80">
                            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                <Star size={16} className="fill-current" /> 4.8 / 5.0
                            </div>
                            {sellerBasicInfo.municipio && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full">
                                    <MapPin size={16} /> {sellerBasicInfo.municipio}, {sellerBasicInfo.departamento}
                                </div>
                            )}
                            {sellerBasicInfo.createdAt && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full">
                                    <Calendar size={16} /> Registrado {new Date(sellerBasicInfo.createdAt).toLocaleDateString('es-HN')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full md:w-auto mt-4 md:mt-0">
                        <button
                            onClick={() => openChat(sellerBasicInfo.id.toString())}
                            className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-1 transition-transform"
                        >
                            <MessageSquare size={20} />
                            Contactar Emprendedor
                        </button>
                    </div>
                </div>
            </div>

            {/* Store Navigation Filter */}
            <div className="flex border-b border-primary/10 mb-8 sticky top-[72px] bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-md z-30 pt-4">
                <button
                    onClick={() => setActiveTab('catalogo')}
                    className={`px-6 py-4 border-b-2 font-bold transition-colors ${activeTab === 'catalogo' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-primary'}`}
                >
                    Catálogo ({storeProducts.length})
                </button>
                <button
                    onClick={() => setActiveTab('resenas')}
                    className={`px-6 py-4 border-b-2 font-bold transition-colors ${activeTab === 'resenas' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-primary'}`}
                >
                    Reseñas ({mockReviews.length})
                </button>
                <button
                    onClick={() => setActiveTab('politicas')}
                    className={`px-6 py-4 border-b-2 font-bold transition-colors ${activeTab === 'politicas' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-primary'}`}
                >
                    Políticas
                </button>
            </div>

            {/* Tab Visualizer */}
            {activeTab === 'catalogo' && (
                storeProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {storeProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/5 dark:bg-black/5 rounded-3xl border border-dashed border-primary/30">
                        <p className="text-lg opacity-60">Este emprendedor aún no ha publicado productos.</p>
                    </div>
                )
            )}

            {activeTab === 'resenas' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="text-6xl font-black text-primary">4.8</div>
                        <div>
                            <div className="flex gap-1 text-primary mb-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={20} className={star <= Math.floor(4.8) ? 'fill-current' : 'opacity-30'} />
                                ))}
                            </div>
                            <p className="opacity-70 text-sm">Basado en {mockReviews.length} valoraciones</p>
                        </div>
                    </div>

                    {mockReviews.map((review) => (
                        <div key={review.id} className="bg-white/5 dark:bg-black/5 border border-primary/10 p-6 rounded-3xl backdrop-blur-md hover:bg-white/10 dark:hover:bg-black/20 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                        {review.user[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{review.user}</h4>
                                        <p className="text-xs opacity-60">{review.date}</p>
                                    </div>
                                </div>
                                <div className="flex text-primary">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={16} className={star <= review.rating ? 'fill-current' : 'opacity-30'} />
                                    ))}
                                </div>
                            </div>
                            <p className="opacity-80 ml-16">{review.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'politicas' && (
                <div className="max-w-4xl mx-auto py-12 text-center bg-white/5 dark:bg-black/5 rounded-3xl border border-dashed border-primary/30">
                    <p className="text-lg opacity-60">No hay políticas adicionales registradas.</p>
                </div>
            )}
        </div>
    );
}
