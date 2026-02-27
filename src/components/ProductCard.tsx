import Link from 'next/link';
import { Heart, User } from 'lucide-react';

export type Product = {
    id: string;
    title: string;
    price: string;
    image: string;
    seller: {
        id: string;
        name: string;
    };
    category: string;
};

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group bg-white/5 dark:bg-black/5 backdrop-blur-lg border border-primary/10 rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col h-full">
            {/* Image Placeholder */}
            <Link href={`/marketplace/product/${product.id}`} className="relative h-48 w-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden block">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 mix-blend-overlay group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center text-neutral-400 font-medium">
                    {/* Fallback image representation */}
                    {product.image}
                </div>
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.category}
                </div>
            </Link>

            {/* Content info */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <Link href={`/marketplace/product/${product.id}`} className="flex-1">
                        <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                            {product.title}
                        </h3>
                    </Link>
                    <span className="text-lg font-extrabold text-primary ml-4">
                        {product.price}
                    </span>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-primary/10">
                    <Link href={`/marketplace/store/${product.seller.id}`} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <User size={16} />
                        </div>
                        <span className="text-sm font-medium opacity-80 line-clamp-1">{product.seller.name}</span>
                    </Link>

                    <button className="p-2 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors group/btn">
                        <Heart size={20} className="group-active/btn:scale-90 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
