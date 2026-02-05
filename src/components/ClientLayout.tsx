'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { hasAccess } from '@/lib/permissions';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Menu } from 'lucide-react';
import sidebarStyles from './Sidebar.module.css'; // Find where to import styles for button, or inline styles

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Mobile State
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const publicPages = ['/help', '/privacy', '/terms'];

    const isAuthPage = authPages.some(page => pathname.startsWith(page));
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));

    // Sync with sidebar collapse state (Desktop)
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
        // Kept from original code, though strictly passing props makes this less critical within the same app session
        const interval = setInterval(handleStorage, 500);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    const toggleDesktop = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    useEffect(() => {
        // 1. Redirect to login if not logged in and not on a public/auth page
        if (!loading && !user && !isAuthPage && !isPublicPage) {
            router.push('/login');
            return;
        }

        // 2. Redirect to home if logged in and trying to access auth pages
        if (!loading && user && isAuthPage) {
            router.push('/');
            return;
        }

        // 3. RBAC Check
        if (!loading && user && !isPublicPage && pathname !== '/') {
            if (!hasAccess(user.role, pathname)) {
                router.push('/');
            }
        }

    }, [user, loading, isAuthPage, isPublicPage, router, pathname]);

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
    if (!user) {
        return <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>{children}</main>;
    }

    // Calculate Main Content style
    const mainStyle = isMobile ? {
        flex: 1,
        marginLeft: 0,
        width: '100%',
        backgroundColor: 'var(--background)',
        transition: 'none',
        paddingTop: '0px' // Removed padding to align header with toggle
    } : {
        flex: 1,
        marginLeft: isCollapsed ? '80px' : '260px',
        width: isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)',
        backgroundColor: 'var(--background)',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar
                isMobile={isMobile}
                isOpen={isMobileOpen}
                isCollapsed={isCollapsed}
                onToggle={toggleDesktop}
                onCloseMobile={() => setIsMobileOpen(false)}
            />

            {/* Mobile Toggle Button (Visible when sidebar is closed) */}
            {isMobile && !isMobileOpen && (
                <button
                    className={sidebarStyles.mobileToggleBtn}
                    onClick={() => setIsMobileOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
            )}

            <main style={mainStyle}>
                {children}
            </main>
        </div>
    );
}
