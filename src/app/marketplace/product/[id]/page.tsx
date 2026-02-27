'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Heart, User, Share2, MapPin, ExternalLink, MessageCircle, ChevronRight } from 'lucide-react';
import { getProductById, getProductsByUser, getUserById } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';
import { useChat } from '@/context/ChatContext';
import { useProducts } from '@/context/ProductContext';
import React from 'react';

// Wrap the actual content in a client component that receives props
export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Next 15 specific unwrapping
    const { id } = React.use(params);
    const { openChat } = useChat();
    const { products } = useProducts();

    // Simulate data fetching
    const product = products.find(p => p.id === id);

    if (!product) {
        notFound();
    }

    const seller = getUserById(product.seller.id);
    const relatedProducts = products.filter(p => p.seller.id === product.seller.id && p.id !== product.id).slice(0, 3);

    // Interactivity: Gallery and Like state
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    // Mock an array of variations for the image since we only have one string natively
    const galleryImages = [
        product.image,
        product.image.replace(/./, '✨'), // Just a slight visual change for mock
        product.image.replace(/./, '🌟')
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <nav className="flex text-sm font-medium mb-8 text-neutral-500">
                <Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                <span className="mx-2">/</span>
                <span className="text-neutral-900 dark:text-neutral-100">{product.category}</span>
                <span className="mx-2">/</span>
                <span className="text-primary truncate max-w-xs block">{product.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Product Image Gallery Mock */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-3xl bg-neutral-100 dark:bg-neutral-800 border border-primary/10 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-purple-500/10 mix-blend-overlay" />
                        <div className="absolute inset-0 flex items-center justify-center text-8xl md:text-[10rem] opacity-80 group-hover:scale-110 transition-transform duration-500">
                            {galleryImages[activeImageIndex]}
                        </div>
                    </div>
                    {/* Thumbnail mocks */}
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {galleryImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`w-24 h-24 rounded-2xl flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 border-2 transition-all flex items-center justify-center text-3xl opacity-70 ${activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent hover:border-primary/40'
                                    }`}
                            >
                                {img}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="mb-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                            {product.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{product.title}</h1>
                        <p className="text-3xl font-black text-primary mb-6">{product.price}</p>

                        <div className="prose dark:prose-invert text-neutral-600 dark:text-neutral-400 opacity-80 mb-8 max-w-none">
                            <p>
                                Este es un producto o servicio de alta calidad ofrecido en nuestra red de emprendedores ECCE.
                                La atención al detalle y el compromiso con la excelencia hacen que esta opción destaque en la categoría de {product.category.toLowerCase()}.
                            </p>
                            <p>
                                Contacta al vendedor para conocer tiempos de entrega, variaciones y especificaciones técnicas.
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => seller && openChat(seller.id)}
                                className="flex-1 bg-primary text-white py-4 rounded-xl font-bold shadow-xl shadow-primary/30 transition-transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={20} />
                                ¡Me Interesa!
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsLiked(!isLiked)}
                                    className={`p-4 border border-primary/20 rounded-xl transition-colors flex items-center justify-center group ${isLiked ? 'bg-primary/10 text-primary border-primary' : 'hover:bg-primary/5 text-primary'}`}
                                    title="Guardar"
                                >
                                    <Heart size={24} className={`group-active:scale-75 transition-transform ${isLiked ? 'fill-current' : ''}`} />
                                </button>
                                <button className="p-4 border border-primary/20 rounded-xl hover:bg-primary/5 text-primary transition-colors flex items-center justify-center group" title="Compartir">
                                    <Share2 size={24} className="group-active:scale-75 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Seller Card mini */}
                        {seller && (
                            <Link href={`/marketplace/store/${seller.id}`} className="block mt-6 p-4 rounded-2xl bg-white/5 dark:bg-black/5 border border-primary/10 hover:border-primary/30 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
                                            <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                                                <User size={24} className="text-primary" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg group-hover:text-primary transition-colors">{seller.storeName}</p>
                                            <div className="flex items-center text-sm opacity-70 gap-3">
                                                <span className="flex items-center gap-1"><MapPin size={14} /> Local</span>
                                                <span>⭐ {seller.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ExternalLink size={20} className="text-neutral-400 group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="pt-12 border-t border-primary/10 mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Más de este emprendedor</h2>
                        {seller && (
                            <Link href={`/marketplace/store/${seller.id}`} className="text-primary font-medium hover:underline flex items-center gap-1">
                                Ver su tienda <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
