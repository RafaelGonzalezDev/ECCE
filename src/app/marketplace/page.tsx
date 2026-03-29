'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { apiFetch } from '@/lib/api';

export default function MarketplacePage() {
    const { products, loading } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        apiFetch<{ id: number; name: string }[]>('/categories')
            .then(data => setCategories(data))
            .catch(console.error);
    }, []);

    // Filter logic
    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'Todos' || product.category?.name === activeCategory;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.seller?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Marketplace</h1>
                    <p className="text-lg opacity-70">
                        Descubre lo que ofrecen los emprendedores de la red.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar servicios, productos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 dark:bg-black/5 border border-primary/20 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-white/5 dark:bg-black/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors text-primary">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Categories shortcut mapping */}
            <div className="flex gap-3 overflow-x-auto pb-6 mb-4 scrollbar-hide">
                <button
                    onClick={() => setActiveCategory('Todos')}
                    className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-colors ${activeCategory === 'Todos'
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-primary/5 border border-primary/10 hover:bg-primary/10'
                        }`}
                >
                    Todos
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-colors ${activeCategory === cat.name
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-primary/5 border border-primary/10 hover:bg-primary/10'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center opacity-50 text-lg">
                        Cargando productos...
                    </div>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-lg opacity-70">No se encontraron productos con esos filtros.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }}
                            className="text-primary font-bold mt-4 hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
