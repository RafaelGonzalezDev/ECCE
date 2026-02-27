'use client';

import { useState } from 'react';
import { Plus, Package, TrendingUp, MessageSquare, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/components/ProductCard';

export default function MyStorePage() {
    // We simulate the logged in user as 'u1' for this mock
    const currentUserId = 'u1';
    const { products, addProduct, editProduct } = useProducts();
    const myProducts = products.filter(p => p.seller.id === currentUserId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Diseño');
    const [emoji, setEmoji] = useState('📦');

    const categories = ['Diseño', 'Desarrollo Web', 'Soporte', 'Repostería', 'Fotografía', 'Tecnología', 'Marketing'];

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setTitle(product.title);
        // Remove '$' and parse price
        setPrice(product.price.replace('$', ''));
        setCategory(product.category);
        setEmoji(product.image.split(' ')[0]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setTitle('');
        setPrice('');
        setCategory('Diseño');
        setEmoji('📦');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !price.trim()) return;

        const productData: Omit<Product, 'id'> = {
            title,
            price: `$${parseFloat(price).toFixed(2)}`,
            category,
            image: `${emoji} ${category}`,
            seller: { id: currentUserId, name: 'Ana García' } // Mocking Ana García as the logged user
        };

        if (editingProduct) {
            editProduct(editingProduct.id, productData);
        } else {
            addProduct(productData);
        }

        handleCloseModal();
    };

    const stats = [
        { label: 'Ventas del Mes', value: '$1,250', icon: TrendingUp, trend: '+15%' },
        { label: 'Visitas', value: '3,450', icon: Eye, trend: '+5%' },
        { label: 'Mensajes Nuevos', value: '12', icon: MessageSquare, trend: 'Urgente' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Mi Tienda</h1>
                    <p className="text-lg opacity-70">
                        Gestiona tu catálogo, ventas y mensajes con clientes.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:-translate-y-1 transition-transform active:scale-95"
                >
                    <Plus size={20} />
                    Crear Publicación
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 dark:bg-black/5 border border-primary/10 p-6 rounded-3xl backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold opacity-70">{stat.label}</h3>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary'
                            }`}>
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* Products Management List */}
            <div className="bg-white/5 dark:bg-black/5 border border-primary/10 rounded-3xl backdrop-blur-md overflow-hidden">
                <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="text-primary" />
                        Tus Publicaciones Activas ({myProducts.length})
                    </h2>
                </div>

                {myProducts.length > 0 ? (
                    <div className="divide-y divide-primary/5 max-h-[600px] overflow-y-auto">
                        {myProducts.map(product => (
                            <div key={product.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 dark:hover:bg-black/10 transition-colors">
                                {/* Thumbnail */}
                                <div className="w-24 h-24 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-3xl shrink-0 border border-primary/10">
                                    {product.image.split(' ')[0]} {/* Show just the emoji icon if possible */}
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold mb-1">{product.title}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm opacity-70">
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                                            {product.category}
                                        </span>
                                        <span>Última edición: Hoy</span>
                                    </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                                    <span className="text-xl font-black text-primary">{product.price}</span>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Link href={`/marketplace/product/${product.id}`} className="flex-1 md:flex-none px-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-bold text-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                            Ver Pública
                                        </Link>
                                        <button
                                            onClick={() => handleEditClick(product)}
                                            className="flex-1 md:flex-none px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors"
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Aún no tienes productos</h3>
                        <p className="opacity-70 max-w-sm mx-auto mb-6">
                            Comienza a publicar tus servicios o productos para que otros emprendedores puedan comprarlos o interesarse.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 mx-auto"
                        >
                            Crear mi primer producto
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for Creating a Product */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-primary/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="flex items-center justify-between p-6 border-b border-primary/10">
                            <h2 className="text-2xl font-bold">
                                {editingProduct ? 'Editar Publicación' : 'Nueva Publicación'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 opacity-80">Título del Producto / Servicio</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej. Consultoría Financiera 1hr"
                                    className="w-full bg-black/5 dark:bg-white/5 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 opacity-80">Precio (USD)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-black/5 dark:bg-white/5 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 opacity-80">Categoría</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-neutral-50 dark:bg-neutral-900">{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 opacity-80">Elige un Emoji Representativo</label>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {['📦', '💼', '💻', '🎨', '🧁', '📸', '🔧', '📈', '✨', '🔥'].map(emj => (
                                        <button
                                            key={emj}
                                            type="button"
                                            onClick={() => setEmoji(emj)}
                                            className={`w-12 h-12 flex-shrink-0 text-2xl flex items-center justify-center rounded-xl transition-all ${emoji === emj ? 'bg-primary/20 border-2 border-primary' : 'bg-black/5 dark:bg-white/5 border border-transparent'}`}
                                        >
                                            {emj}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:-translate-y-1 transition-transform"
                                >
                                    {editingProduct ? 'Guardar Cambios' : 'Publicar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
