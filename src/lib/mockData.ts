import { Product } from '@/components/ProductCard';

export const MOCK_USERS = [
    { id: 'u1', name: 'Ana García', storeName: 'Diseño Creativo Ana', joined: 'Ene 2024', rating: 4.8, type: 'Servicios' },
    { id: 'u2', name: 'Carlos Mendoza', storeName: 'Tech Solutions CM', joined: 'Mar 2023', rating: 4.9, type: 'Tecnología' },
    { id: 'u3', name: 'Elena Rojas', storeName: 'Postres y Especialidades', joined: 'Feb 2024', rating: 4.7, type: 'Alimentos' }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'p1',
        title: 'Diseño de Logotipo Profesional e Identidad de Marca',
        price: '$150.00',
        category: 'Diseño',
        image: '📐 Logo Design',
        seller: { id: 'u1', name: 'Ana García' }
    },
    {
        id: 'p2',
        title: 'Desarrollo de Landing Page Receptiva con React',
        price: '$300.00',
        category: 'Desarrollo Web',
        image: '💻 Landing Page',
        seller: { id: 'u2', name: 'Carlos Mendoza' }
    },
    {
        id: 'p3',
        title: 'Mantenimiento y Reparación de Equipos de Cómputo',
        price: '$50.00',
        category: 'Soporte',
        image: '🔧 PC Repair',
        seller: { id: 'u2', name: 'Carlos Mendoza' }
    },
    {
        id: 'p4',
        title: 'Caja de 12 Macarons Franceses Artesanales',
        price: '$25.00',
        category: 'Repostería',
        image: '🧁 Macarons',
        seller: { id: 'u3', name: 'Elena Rojas' }
    },
    {
        id: 'p5',
        title: 'Pastel de Cumpleaños Personalizado (Fondant)',
        price: '$60.00',
        category: 'Repostería',
        image: '🎂 Custom Cake',
        seller: { id: 'u3', name: 'Elena Rojas' }
    },
    {
        id: 'p6',
        title: 'Sesión de Fotografía Comercial para Productos',
        price: '$120.00',
        category: 'Fotografía',
        image: '📸 Photo Session',
        seller: { id: 'u1', name: 'Ana García' }
    }
];

export const getProductsByUser = (userId: string) => MOCK_PRODUCTS.filter(p => p.seller.id === userId);
export const getProductById = (productId: string) => MOCK_PRODUCTS.find(p => p.id === productId);
export const getUserById = (userId: string) => MOCK_USERS.find(u => u.id === userId);
