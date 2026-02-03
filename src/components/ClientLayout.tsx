'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const isAuthPage = authPages.some(page => pathname.startsWith(page));

    // Sync with sidebar collapse state
    useEffect(() => {
        const handleStorage = () => {
            const saved = localStorage.getItem('sidebarCollapsed');
            if (saved !== null) {
                setIsCollapsed(JSON.parse(saved));
            }
        };

        handleStorage();
        window.addEventListener('storage', handleStorage);

        // Poll for changes (since localStorage events don't fire in same tab)
        const interval = setInterval(handleStorage, 100);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (!loading && !user && !isAuthPage) {
            router.push('/login');
        }
        if (!loading && user && isAuthPage) {
            router.push('/');
        }
    }, [user, loading, isAuthPage, router]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--background)'
            }}>
                <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', color: 'var(--primary)' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p>Loading Ave Vista PMS...</p>
                    <style jsx>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
                </div>
            </div>
        );
    }

    if (isAuthPage) {
        return <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>{children}</main>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: isCollapsed ? '80px' : '260px',
                width: isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)',
                backgroundColor: 'var(--background)',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {children}
            </main>
        </div>
    );
}
