'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, MessageSquare, Eye, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/components/ProductCard';
import { apiFetch } from '@/lib/api';

export default function MyStorePage() {
    const { currentUser: user, isLoading: authLoading, updateProfile } = useAuth();
    const { products, addProduct, editProduct, deleteProduct, loading: productsLoading } = useProducts();
    const myProducts = products.filter(p => p.seller?.id === user?.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    // Form state
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [existingImages, setExistingImages] = useState<{url: string, publicId: string}[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch categories dynamically
        apiFetch<{ id: number; name: string }[]>('/categories')
            .then(data => {
                setCategories(data);
                if (data.length > 0 && !categoryId) setCategoryId(data[0].id.toString());
            })
            .catch(console.error);
    }, []);

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setTitle(product.title);
        // Ensure price is string formatted appropriately
        setPrice(typeof product.price === 'number' ? product.price.toString() : product.price.toString());
        setCategoryId(product.category.id.toString());
        setDescription(product.description || '');
        setExistingImages(product.images || []);
        setDeletedImageIds([]);
        setFiles([]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setTitle('');
        setPrice('');
        setCategoryId(categories.length > 0 ? categories[0].id.toString() : '');
        setDescription('');
        setExistingImages([]);
        setDeletedImageIds([]);
        setFiles([]);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fm = new FormData();
        fm.append('avatar', file);
        try {
            const data = await apiFetch<{avatarUrl: string}>('/users/me/avatar', {
                method: 'PUT',
                body: fm
            });
            updateProfile({ avatarUrl: data.avatarUrl });
            alert('¡Avatar actualizado con éxito!');
        } catch (error) {
            console.error(error);
            alert('Error subiendo icono.');
        }
    };

    const handleDeleteClick = async (product: Product) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar ${product.title}?`)) return;
        try {
            await deleteProduct(product.id);
        } catch (error) {
            alert('Error eliminando producto');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const allowedMax = 4 - existingImages.length;
            const selectedFiles = Array.from(e.target.files).slice(0, allowedMax);
            setFiles(prev => [...prev, ...selectedFiles].slice(0, allowedMax));
        }
    };

    const handleDeleteExistingImage = (publicId: string) => {
        setDeletedImageIds(prev => [...prev, publicId]);
        setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
    };

    const handleRemoveSelectedFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !price || !categoryId) return;
        
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('price', price);
            formData.append('categoryId', categoryId);
            if (description) formData.append('description', description);
            files.forEach((f) => formData.append('images', f));

            if (editingProduct) {
                deletedImageIds.forEach(id => formData.append('deletedImageIds', id));
                await editProduct(editingProduct.id, formData);
            } else {
                await addProduct(formData);
            }
            handleCloseModal();
        } catch (error) {
            alert('Hubo un error al guardar el producto.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = [
        { label: 'Ventas del Mes', value: 'L 2,500', icon: TrendingUp, trend: '+15%' },
        { label: 'Visitas', value: '345', icon: Eye, trend: '+5%' },
        { label: 'Mensajes Nuevos', value: '4', icon: MessageSquare, trend: 'Nuevo' },
    ];

    if (authLoading) {
        return <div className="p-12 text-center">Cargando sesión...</div>;
    }

    if (!user) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
                <p>Debes iniciar sesión con una cuenta de Emprendedor para administrar tus productos.</p>
                <Link href="/" className="text-primary mt-4 block hover:underline">Ir al Inicio</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="relative group/avatar cursor-pointer shrink-0">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-black p-0.5 select-none border border-primary/20 shadow-xl overflow-hidden">
                            <img src={user.avatarUrl || 'https://via.placeholder.com/150?text=Icono'} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white pointer-events-none">
                           <ImageIcon size={16} />
                        </div>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleAvatarChange} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-1">Mi Tienda</h1>
                        <p className="text-lg opacity-70 leading-tight">
                            Gestiona tu catálogo, ventas y publica nuevos artículos.
                        </p>
                    </div>
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
                        <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
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

                {productsLoading ? (
                    <div className="p-12 text-center opacity-50">Cargando catálogo...</div>
                ) : myProducts.length > 0 ? (
                    <div className="divide-y divide-primary/5 max-h-[600px] overflow-y-auto">
                        {myProducts.map(product => (
                            <div key={product.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 dark:hover:bg-black/10 transition-colors group">
                                {/* Thumbnail */}
                                <div className="w-24 h-24 rounded-2xl bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 border border-primary/10 relative">
                                    <img 
                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/150?text=Sin+Imagen'} 
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold mb-1">{product.title}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm opacity-70">
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                                            {product.category?.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                                    <span className="text-xl font-black text-primary">L {typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}</span>
                                    <div className="flex gap-2 w-full md:w-auto mt-2">
                                        <Link href={`/marketplace/product/${product.id}`} className="flex-1 md:flex-none px-3 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-bold text-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                            Ver
                                        </Link>
                                        <button
                                            onClick={() => handleEditClick(product)}
                                            className="flex-1 md:flex-none px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(product)}
                                            className="flex-1 md:flex-none px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors"
                                            title="Dar de baja producto"
                                        >
                                            <Trash2 size={18} className="mx-auto" />
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
                            Sube tus primeros artículos agregando imágenes atractivas y fijando un precio en Lempiras.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 mx-auto"
                        >
                            Crear Producto
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for Creating/Editing a Product */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-primary/20 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 mt-10 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-primary/10 shrink-0">
                            <h2 className="text-2xl font-bold">
                                {editingProduct ? 'Editar Publicación' : 'Nueva Publicación'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6">
                            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2 opacity-80">Título del Producto / Servicio</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Ej. iPhone 13 Pro Max - 256GB"
                                        className="w-full bg-white dark:bg-black/50 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 opacity-80">Precio (HNL)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-white dark:bg-black/50 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 opacity-80">Categoría</label>
                                        <select
                                            value={categoryId}
                                            onChange={e => setCategoryId(e.target.value)}
                                            required
                                            className="w-full bg-white dark:bg-black/50 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                        >
                                            <option value="" disabled>Seleccione una categoría</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id.toString()} className="bg-neutral-50 dark:bg-neutral-900">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold mb-2 opacity-80">Descripción Corta (Opcional)</label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Agrega algunos detalles sobre tu producto..."
                                        className="w-full bg-white dark:bg-black/50 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 opacity-80">
                                        Imágenes (Max 4 permitidas) 
                                        {existingImages.length > 0 && ` - Ya hay ${existingImages.length} previas`}
                                    </label>
                                    
                                    {/* Preview Current DB Images */}
                                    {existingImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3 mt-1">
                                            {existingImages.map((img) => (
                                                <div key={img.publicId} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-primary/20 relative group/dbimg">
                                                    <img src={img.url} alt="db_img" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleDeleteExistingImage(img.publicId)} 
                                                        className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover/dbimg:opacity-100 transition-opacity"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload box if slots >= 1 */}
                                    {(existingImages.length + files.length) < 4 && (
                                        <div className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center bg-primary/5 hover:bg-primary/10 transition-colors relative cursor-pointer">
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*" 
                                                onChange={handleFileChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                required={!editingProduct && files.length === 0} 
                                            />
                                            <ImageIcon size={32} className="mx-auto text-primary mb-2" />
                                            <p className="text-sm font-semibold opacity-80">
                                                Toca o arrastra para añadir fotos nuevas ({4 - (existingImages.length + files.length)} slots)
                                            </p>
                                        </div>
                                    )}

                                    {/* File Previews Thumbnails Mini */}
                                    {files.length > 0 && (
                                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                            {files.map((file, i) => (
                                                <div key={i} className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-primary/20 relative group/fileimg">
                                                    <img 
                                                        src={URL.createObjectURL(file)} 
                                                        alt={`Preview ${i}`} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveSelectedFile(i)} 
                                                        className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover/fileimg:opacity-100 transition-opacity"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-primary/10 flex gap-4 bg-neutral-100 dark:bg-neutral-800 shrink-0">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 rounded-xl font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="product-form"
                                disabled={isSubmitting}
                                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:-translate-y-1 transition-transform disabled:opacity-75 flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                     <span className="animate-pulse">Guardando...</span>
                                ) : editingProduct ? 'Actualizar' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
