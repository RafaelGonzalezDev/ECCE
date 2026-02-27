'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isChurchMember: boolean;
    churchName: string;
    isEntrepreneur: boolean;
    businessName: string;
    departamento: string;
    municipio: string;
    memberSince: string;
    avatar: string | null;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    isChurchMember: boolean;
    churchName?: string;
    isEntrepreneur: boolean;
    businessName?: string;
    departamento: string;
    municipio: string;
}

interface AuthContextType {
    currentUser: UserProfile | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
    register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
    logout: () => void;
    updateProfile: (data: Partial<UserProfile>) => void;
}

// ─── Mock Users DB ────────────────────────────────────────────────────────────

const MOCK_CREDENTIALS: { email: string; password: string; userId: string }[] = [
    { email: 'maria@ecce.app', password: 'password123', userId: 'u1' },
    { email: 'juan@ecce.app', password: 'password123', userId: 'u2' },
];

const MOCK_USERS_DB: UserProfile[] = [
    {
        id: 'u1',
        firstName: 'María',
        lastName: 'González',
        email: 'maria@ecce.app',
        phone: '+504 9888-1234',
        isChurchMember: true,
        churchName: 'Iglesia de Dios - Tegucigalpa Central',
        isEntrepreneur: true,
        businessName: 'Diseños MG Studio',
        departamento: 'Francisco Morazán',
        municipio: 'Tegucigalpa',
        memberSince: 'Octubre 2023',
        avatar: null,
    },
    {
        id: 'u2',
        firstName: 'Juan',
        lastName: 'Martínez',
        email: 'juan@ecce.app',
        phone: '+504 9777-5678',
        isChurchMember: false,
        churchName: '',
        isEntrepreneur: true,
        businessName: 'TechStart HN',
        departamento: 'Cortés',
        municipio: 'San Pedro Sula',
        memberSince: 'Enero 2024',
        avatar: null,
    },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));

        const cred = MOCK_CREDENTIALS.find(
            c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
        );

        if (!cred) {
            setIsLoading(false);
            return { ok: false, error: 'Correo electrónico o contraseña incorrectos.' };
        }

        const user = MOCK_USERS_DB.find(u => u.id === cred.userId) ?? null;
        setCurrentUser(user);
        setIsLoading(false);
        return { ok: true };
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 800));

        // Check duplicate email
        const exists = MOCK_USERS_DB.find(u => u.email.toLowerCase() === data.email.toLowerCase());
        if (exists) {
            setIsLoading(false);
            return { ok: false, error: 'Ya existe una cuenta con ese correo electrónico.' };
        }

        const newUser: UserProfile = {
            id: `u${Date.now()}`,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone ?? '',
            isChurchMember: data.isChurchMember,
            churchName: data.churchName ?? '',
            isEntrepreneur: data.isEntrepreneur,
            businessName: data.businessName ?? '',
            departamento: data.departamento,
            municipio: data.municipio,
            memberSince: new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(new Date()),
            avatar: null,
        };

        // In real app: API call. Here we just set as current user.
        MOCK_USERS_DB.push(newUser);
        setCurrentUser(newUser);
        setIsLoading(false);
        return { ok: true };
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
    }, []);

    const updateProfile = useCallback((data: Partial<UserProfile>) => {
        setCurrentUser(prev => prev ? { ...prev, ...data } : prev);
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
