'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { hasAccess } from '@/lib/permissions';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const publicPages = ['/help', '/privacy', '/terms'];

    const isAuthPage = authPages.some(page => pathname.startsWith(page));
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));

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
        // 1. Redirect to login if not logged in and not on a public/auth page
        if (!loading && !user && !isAuthPage && !isPublicPage) {
            router.push('/login');
            return;
        }

        // 2. Redirect to home if logged in and trying to access auth pages
        if (!loading && user && isAuthPage) {
            router.push('/');
            return; // Add return to prevent further checks
        }

        // 3. RBAC Check: If logged in, check if user has access to current path
        // We skip this check for public pages or the home page to avoid loops
        if (!loading && user && !isPublicPage && pathname !== '/') {
            if (!hasAccess(user.role, pathname)) {
                // If unauthorized, send back to Dashboard (or 403 page)
                // Using alert for clarity in this demo, usually show a toast
                // alert(`Access Denied: ${user.role} role cannot access ${pathname}`);
                router.push('/');
            }
        }

    }, [user, loading, isAuthPage, isPublicPage, router, pathname]);

    // ... rest of component

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

    // Render logic:
    // If not logged in, show full screen (Auth pages + Public pages)
    // If logged in but on a full-screen page (none currently defined, but logically valid)
    if (!user) {
        return <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>{children}</main>;
    }

    // If User is logged in, show Sidebar layout (even for public pages like Help)
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
