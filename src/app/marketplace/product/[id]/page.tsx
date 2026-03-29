'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Heart, User, Share2, MapPin, ExternalLink, MessageCircle, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useChat } from '@/context/ChatContext';
import { useProducts } from '@/context/ProductContext';
import React from 'react';

// Mocked seller details that aren't provided by the backend product record yet
const getMockSellerDetails = (id: number) => ({
    storeName: `Tienda ${id}`,
    rating: 4.8,
});

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Next 15 specific unwrapping
    const { id } = React.use(params);
    const productId = parseInt(id, 10);
    const { openChat } = useChat();
    const { products, loading } = useProducts();

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 py-20 text-center opacity-60">Cargando producto...</div>;
    }

    const product = products.find(p => p.id === productId);

    if (!product) {
        notFound();
    }

    const sellerDetails = getMockSellerDetails(product.seller?.id);
    const relatedProducts = products.filter(p => p.seller?.id === product.seller?.id && p.id !== product.id).slice(0, 3);

    // Actual images gallery from DB
    const galleryImages = product.images && product.images.length > 0 
        ? product.images.map(img => img.url) 
        : ['https://via.placeholder.com/800?text=Sin+Imagen'];

    const formattedPrice = `L ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <nav className="flex text-sm font-medium mb-8 text-neutral-500">
                <Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                <span className="mx-2">/</span>
                <span className="text-neutral-900 dark:text-neutral-100">{product.category?.name || 'Categoría'}</span>
                <span className="mx-2">/</span>
                <span className="text-primary truncate max-w-xs block">{product.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Product Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-3xl bg-neutral-100 dark:bg-neutral-800 border border-primary/10 overflow-hidden relative group">
                        <img 
                            src={galleryImages[activeImageIndex]} 
                            alt={product.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                    </div>
                    {/* Thumbnails */}
                    {galleryImages.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`w-24 h-24 rounded-2xl flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 border-2 overflow-hidden transition-all flex items-center justify-center opacity-70 ${activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-105 opacity-100' : 'border-transparent hover:border-primary/40'
                                        }`}
                                >
                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="mb-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                            {product.category?.name || 'Categoría'}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{product.title}</h1>
                        <p className="text-3xl font-black text-primary mb-6">{formattedPrice}</p>

                        <div className="prose dark:prose-invert text-neutral-600 dark:text-neutral-400 opacity-80 mb-8 max-w-none">
                            <p>
                                {product.description || `Este es un producto o servicio ofrecido en nuestra red de emprendedores ECCE. La atención al detalle y el compromiso con la excelencia hacen que esta opción destaque en la categoría de ${product.category?.name?.toLowerCase() || 'su categoría'}.`}
                            </p>
                            <p>
                                Contacta al vendedor para conocer tiempos de entrega, variaciones y especificaciones técnicas.
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => product.seller && openChat(product.seller.id.toString())}
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
                        {product.seller && (
                            <Link href={`/marketplace/store/${product.seller.id}`} className="block mt-6 p-4 rounded-2xl bg-white/5 dark:bg-black/5 border border-primary/10 hover:border-primary/30 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-primary/20 bg-primary/10 text-primary">
                                            {product.seller.avatarUrl ? (
                                                <img src={product.seller.avatarUrl} alt={product.seller.businessName || product.seller.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg group-hover:text-primary transition-colors">
                                                {product.seller.businessName || product.seller.name || sellerDetails.storeName}
                                            </p>
                                            <div className="flex items-center text-sm opacity-70 gap-3">
                                                {(product.seller.municipio) ? (
                                                    <span className="flex items-center gap-1"><MapPin size={14} /> {product.seller.municipio}</span>
                                                ) : (
                                                    <span className="flex items-center gap-1"><MapPin size={14} /> Local</span>
                                                )}
                                                <span>⭐ {sellerDetails.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ExternalLink size={20} className="text-neutral-400 group-hover:text-primary transition-colors shrink-0" />
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
                        {product.seller && (
                            <Link href={`/marketplace/store/${product.seller.id}`} className="text-primary font-medium hover:underline flex items-center gap-1">
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
