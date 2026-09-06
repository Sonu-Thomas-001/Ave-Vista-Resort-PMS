'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import LogoutConfirmModal from '@/components/ui/LogoutConfirmModal';

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
    forceLogout: () => Promise<void>;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();

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
        // 1. Check if self-registration is paused in local cache
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem('ave_vista_app_settings');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.allow_registration === false) {
                        return 'Staff self-registration is currently paused by property administration.';
                    }
                }
            } catch (e) {
                // Ignore local read error
            }
        }

        // 2. Double-check live status from app_settings
        try {
            const { data } = await supabase.from('app_settings').select('allow_registration').limit(1);
            if (data && data.length > 0 && data[0].allow_registration === false) {
                return 'Staff self-registration is currently paused by property administration.';
            }
        } catch (e) {
            // Proceed if settings table cannot be queried
        }

        const redirectTo = typeof window !== 'undefined'
            ? `${window.location.origin}/login`
            : undefined;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectTo,
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

    const forceLogout = async () => {
        setShowLogoutModal(false);
        await supabase.auth.signOut();
        setUser(null);
        router.push('/login');
    };

    const logout = () => {
        setShowLogoutModal(true);
    };

    const isAdmin = user?.role === 'Admin';

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, forceLogout, loading, isAdmin }}>
            {children}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                userName={user?.name || user?.email}
                userRole={user?.role}
                onConfirm={forceLogout}
                onCancel={() => setShowLogoutModal(false)}
            />
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
