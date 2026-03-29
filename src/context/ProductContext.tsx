'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/components/ProductCard';
import { apiFetch } from '@/lib/api';

type ProductContextType = {
    products: Product[];
    loading: boolean;
    refreshProducts: () => Promise<void>;
    addProduct: (formData: FormData) => Promise<void>;
    editProduct: (id: number, formData: FormData) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshProducts = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<Product[]>('/products');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (formData: FormData) => {
        await apiFetch('/products', {
            method: 'POST',
            body: formData,
        });
        await refreshProducts(); // Refresh state entirely
    };

    const editProduct = async (id: number, formData: FormData) => {
        await apiFetch(`/products/${id}`, {
            method: 'PUT',
            body: formData,
        });
        await refreshProducts();
    };

    const deleteProduct = async (id: number) => {
        await apiFetch(`/products/${id}`, {
            method: 'DELETE',
        });
        await refreshProducts();
    };

    useEffect(() => {
        refreshProducts();
    }, []);

    return (
        <ProductContext.Provider
            value={{
                products,
                loading,
                refreshProducts,
                addProduct,
                editProduct,
                deleteProduct,
            }}
        >
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
