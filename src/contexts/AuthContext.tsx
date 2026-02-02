'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Reception';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<string | null>;
    signup: (email: string, password: string, fullName: string, role: string) => Promise<string | null>;
    logout: () => void;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                mapSupabaseUser(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                mapSupabaseUser(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapSupabaseUser = (sbUser: SupabaseUser) => {
        // Determine role from metadata or fallback
        const role = (sbUser.user_metadata?.role as User['role']) || 'Manager';
        const name = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User';

        setUser({
            id: sbUser.id,
            name,
            email: sbUser.email!,
            role
        });
        setLoading(false);
    };

    const login = async (email: string, password: string) => {
        // Don't set global loading here to avoid unmounting the login form
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error.message);
            return error.message;
        }

        // Auth state change listener will handle setting user
        return null;
    };

    const signup = async (email: string, password: string, fullName: string, role: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        });

        if (error) {
            return error.message;
        }
        return null;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/login');
    };

    const isAdmin = user?.role === 'Admin';

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, isAdmin }}>
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
