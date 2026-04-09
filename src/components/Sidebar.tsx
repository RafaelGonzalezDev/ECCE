'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home, User, Settings, Menu, X, ChevronLeft, ChevronRight,
    Store, ShoppingBag, MessageSquare, LogIn, LogOut, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const AUTH_PAGES = ['/login', '/register'];

/**
 * Maps a nav item to which permission grants read access.
 * null = always visible (no permission required).
 */
const NAV_ITEMS = [
    { name: 'Inicio',      href: '/',           icon: Home,          readPerm: null,              protected: false },
    { name: 'Marketplace', href: '/marketplace', icon: Store,         readPerm: 'marketplace:read', protected: false },
    { name: 'Mi Tienda',   href: '/store',       icon: ShoppingBag,   readPerm: 'store:read',       protected: true },
    { name: 'Mensajes',    href: '/messages',    icon: MessageSquare, readPerm: 'messages:read',    protected: true },
    { name: 'Perfil',      href: '/profile',     icon: User,          readPerm: 'profile:read',     protected: true },
    { name: 'Ajustes',     href: '/settings',    icon: Settings,      readPerm: 'settings:read',    protected: true },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { currentUser, logout } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    // Don't render sidebar on auth pages OR landing page when not logged in
    if (AUTH_PAGES.some(p => pathname?.startsWith(p))) return null;
    if (pathname === '/' && !currentUser) return null;
    // Admin module has its own dedicated layout with its own sidebar
    if (pathname?.startsWith('/admin')) return null;

    const userPermissions = currentUser?.permissions ?? [];
    const isAdmin = currentUser?.roles?.includes('admin') ?? false;

    /** True if the user has the given permission key, or is admin (always full access) */
    const hasPerm = (perm: string | null) => {
        if (!perm) return true;          // no restriction
        if (isAdmin) return true;         // admin always has access
        return userPermissions.includes(perm);
    };

    const handleLogout = () => {
        logout();
        addToast('Has cerrado sesión.', 'info');
        router.push('/login');
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-white/10 dark:bg-black/10 backdrop-blur-md border border-primary/20 text-primary shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-primary/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                {/* Logo */}
                <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--primary-color), #9333ea)' }}>
                            ECCE
                        </h2>
                    )}
                    {isCollapsed && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">E</div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        const isLocked = item.protected && !currentUser;
                        const noAccess = item.protected && currentUser && !hasPerm(item.readPerm);

                        if (isLocked) {
                            return (
                                <Link
                                    key={item.href}
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    title={isCollapsed ? `${item.name} — Inicia sesión` : 'Inicia sesión para acceder'}
                                    className={`flex items-center p-3 rounded-xl opacity-40 transition-all hover:opacity-60 hover:bg-primary/5
                                        ${isCollapsed ? 'justify-center' : 'space-x-3'} text-neutral-500`}
                                >
                                    <Icon size={20} />
                                    {!isCollapsed && (
                                        <span className="flex items-center gap-1.5 font-medium">
                                            {item.name}
                                            <AlertCircle size={12} className="opacity-70" />
                                        </span>
                                    )}
                                </Link>
                            );
                        }

                        // User is logged in but lacks the read permission for this module
                        if (noAccess) {
                            return (
                                <button
                                    key={item.href}
                                    type="button"
                                    title={`No tienes permiso para acceder a ${item.name}`}
                                    onClick={() => addToast(`No tienes acceso a "${item.name}". Contacta al administrador si crees que esto es un error.`, 'warning')}
                                    className={`w-full flex items-center p-3 rounded-xl opacity-30 cursor-not-allowed transition-all hover:opacity-50
                                        ${isCollapsed ? 'justify-center' : 'space-x-3'} text-neutral-500`}
                                >
                                    <Icon size={20} />
                                    {!isCollapsed && (
                                        <span className="flex items-center gap-1.5 font-medium">
                                            {item.name}
                                            <AlertCircle size={12} className="opacity-70" />
                                        </span>
                                    )}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center p-3 rounded-xl transition-all duration-200 group
                                    ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/10 text-neutral-600 dark:text-neutral-300 hover:text-primary'}
                                    ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon size={20} className={isActive ? 'text-white' : 'text-current'} />
                                {!isCollapsed && <span className="font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}

                    {/* Admin link — only for users with admin role */}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center p-3 rounded-xl transition-all duration-200
                                ${pathname.startsWith('/admin') ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/10 text-neutral-600 dark:text-neutral-300 hover:text-primary'}
                                ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                            title={isCollapsed ? 'Admin' : undefined}
                        >
                            <ShieldCheck size={20} className={pathname.startsWith('/admin') ? 'text-white' : 'text-current'} />
                            {!isCollapsed && <span className="font-medium">Admin</span>}
                        </Link>
                    )}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-primary/10">
                    {currentUser ? (
                        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {currentUser.firstName[0]}{currentUser.lastName[0]}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{currentUser.firstName} {currentUser.lastName}</p>
                                    <p className="text-xs opacity-50 truncate">{currentUser.email}</p>
                                </div>
                            )}
                            {!isCollapsed && (
                                <button onClick={handleLogout} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors" title="Cerrar sesión">
                                    <LogOut size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl text-primary hover:bg-primary/10 transition-colors font-medium text-sm ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? 'Iniciar sesión' : undefined}
                        >
                            <LogIn size={18} />
                            {!isCollapsed && 'Iniciar sesión'}
                        </Link>
                    )}
                </div>

                {/* Desktop collapse toggle */}
                <div className="hidden md:flex p-4 border-t border-primary/10">
                    <button onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl text-neutral-500 hover:text-primary hover:bg-primary/10 transition-colors">
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </aside>
        </>
    );
}
