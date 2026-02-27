'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/components/ProductCard';
import { MOCK_PRODUCTS as INITIAL_PRODUCTS } from '@/lib/mockData';

type ProductContextType = {
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    editProduct: (id: string, updatedProduct: Omit<Product, 'id'>) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

    const addProduct = (newProduct: Omit<Product, 'id'>) => {
        const product: Product = {
            ...newProduct,
            id: `p${Date.now()}` // Generate temporary ID
        };
        // Add to beginning of array so it shows up first
        setProducts(prev => [product, ...prev]);
    };

    const editProduct = (id: string, updatedProduct: Omit<Product, 'id'>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...updatedProduct, id } : p));
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, editProduct }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}
