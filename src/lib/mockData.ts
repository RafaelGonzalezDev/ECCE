import { Product } from '@/components/ProductCard';

export const MOCK_USERS = [
    { id: 'u1', name: 'Ana García', storeName: 'Diseño Creativo Ana', joined: 'Ene 2024', rating: 4.8, type: 'Servicios' },
    { id: 'u2', name: 'Carlos Mendoza', storeName: 'Tech Solutions CM', joined: 'Mar 2023', rating: 4.9, type: 'Tecnología' },
    { id: 'u3', name: 'Elena Rojas', storeName: 'Postres y Especialidades', joined: 'Feb 2024', rating: 4.7, type: 'Alimentos' }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        title: 'Diseño de Logotipo Profesional e Identidad de Marca',
        price: '150.00',
        category: { id: 1, name: 'Diseño' },
        images: [{ url: '📐', publicId: '1' }],
        seller: { id: 1, name: 'Ana García' }
    },
    {
        id: 2,
        title: 'Desarrollo de Landing Page Receptiva con React',
        price: '300.00',
        category: { id: 2, name: 'Desarrollo Web' },
        images: [{ url: '💻', publicId: '2' }],
        seller: { id: 2, name: 'Carlos Mendoza' }
    },
    {
        id: 3,
        title: 'Mantenimiento y Reparación de Equipos de Cómputo',
        price: '50.00',
        category: { id: 3, name: 'Soporte' },
        images: [{ url: '🔧', publicId: '3' }],
        seller: { id: 2, name: 'Carlos Mendoza' }
    },
    {
        id: 4,
        title: 'Caja de 12 Macarons Franceses Artesanales',
        price: '25.00',
        category: { id: 4, name: 'Repostería' },
        images: [{ url: '🧁', publicId: '4' }],
        seller: { id: 3, name: 'Elena Rojas' }
    },
    {
        id: 5,
        title: 'Pastel de Cumpleaños Personalizado (Fondant)',
        price: '60.00',
        category: { id: 4, name: 'Repostería' },
        images: [{ url: '🎂', publicId: '5' }],
        seller: { id: 3, name: 'Elena Rojas' }
    },
    {
        id: 6,
        title: 'Sesión de Fotografía Comercial para Productos',
        price: '120.00',
        category: { id: 5, name: 'Fotografía' },
        images: [{ url: '📸', publicId: '6' }],
        seller: { id: 1, name: 'Ana García' }
    }
];

export const getProductsByUser = (userId: number) => MOCK_PRODUCTS.filter(p => p.seller.id === userId);
export const getProductById = (productId: number) => MOCK_PRODUCTS.find(p => p.id === productId);
export const getUserById = (userId: string) => MOCK_USERS.find(u => u.id === userId);
