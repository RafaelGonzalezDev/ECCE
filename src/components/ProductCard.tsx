import Link from 'next/link';
import { Heart, User } from 'lucide-react';

export type Product = {
    id: number;
    title: string;
    description?: string;
    price: string | number;
    images: { url: string; publicId: string }[];
    seller: {
        id: number;
        name: string;
        businessName?: string;
        avatarUrl?: string;
        departamento?: string;
        municipio?: string;
        createdAt?: string;
    };
    category: {
        id: number;
        name: string;
    };
};

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const mainImageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300?text=Sin+Imagen';

    return (
        <div className="group bg-white/5 dark:bg-black/5 backdrop-blur-lg border border-primary/10 rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col h-full">
            {/* Image Placeholder */}
            <Link href={`/marketplace/product/${product.id}`} className="relative h-48 w-full overflow-hidden block">
                <img 
                    src={mainImageUrl} 
                    alt={product.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.category?.name || 'Categoría'}
                </div>
            </Link>

            {/* Content info */}
            <div className="p-5 flex-1 flex flex-col relative z-10 bg-white dark:bg-neutral-900 border-t border-black/5 dark:border-white/5 mt-[-1rem] rounded-t-2xl">
                <div className="flex justify-between items-start mb-2">
                    <Link href={`/marketplace/product/${product.id}`} className="flex-1">
                        <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                            {product.title}
                        </h3>
                    </Link>
                    <span className="text-lg font-extrabold text-primary ml-4 whitespace-nowrap">
                        L {typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
                    </span>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-primary/10">
                    <Link href={`/marketplace/store/${product.seller.id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
                            {product.seller?.avatarUrl ? (
                                <img src={product.seller.avatarUrl} alt={product.seller.businessName || product.seller.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={16} />
                            )}
                        </div>
                        <span className="text-sm font-semibold opacity-70 truncate line-clamp-1">
                            {product.seller?.businessName || product.seller?.name || 'Vendedor'}
                        </span>
                    </Link>

                    <button className="p-2 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors group/btn">
                        <Heart size={20} className="group-active/btn:scale-90 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
