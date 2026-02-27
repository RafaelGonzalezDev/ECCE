'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Inicio', href: '/' },
        { name: 'Ajustes', href: '/settings' },
    ];

    return (
        <nav className="border-b border-primary/20 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600" style={{ backgroundImage: `linear-gradient(to right, var(--primary-color), #9333ea)` }}>
                                Themer
                            </span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent hover:border-primary/50 text-[var(--text-color)]/70 hover:text-[var(--text-color)]'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
