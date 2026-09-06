'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { hasAccess } from '@/lib/permissions';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Menu } from 'lucide-react';
import sidebarStyles from './Sidebar.module.css'; // Find where to import styles for button, or inline styles
import OfflineBanner from './ui/OfflineBanner';
import CookieConsentBanner from './ui/CookieConsentBanner';
import LuxuryPreloader from './ui/LuxuryPreloader';
import TopProgressBar from './ui/TopProgressBar';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingTour from './onboarding/OnboardingTour';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Mobile State
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const publicPages = ['/help', '/privacy', '/terms', '/cancellation-policy', '/cookie-policy', '/maintenance', '/forbidden'];

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
        if (!loading && user && !isPublicPage && pathname !== '/' && pathname !== '/forbidden') {
            if (!hasAccess(user.role, pathname)) {
                router.push('/forbidden');
            }
        }

    }, [user, loading, isAuthPage, isPublicPage, router, pathname]);

    if (loading) {
        return <LuxuryPreloader statusText="Loading Ave Vista PMS Workspace..." />;
    }

    // Render logic:
    if (!user && !isAuthPage && !isPublicPage) {
        return null; // Or a loading spinner, but null is fine for a quick redirect
    }

    if (user && isAuthPage) {
        return null; // Prevent login page flash if already logged in
    }

    if (!user) {
        if (isAuthPage) {
            return (
                <>
                    <TopProgressBar />
                    <OfflineBanner />
                    <main style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', backgroundColor: 'var(--background)' }}>{children}</main>
                    <CookieConsentBanner />
                </>
            );
        }
        return (
            <>
                <TopProgressBar />
                <OfflineBanner />
                <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>{children}</div>
                    <Footer />
                </main>
                <CookieConsentBanner />
            </>
        );
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
        <OnboardingProvider>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <TopProgressBar />
                <OfflineBanner />
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
                    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                            {children}
                        </div>
                        <Footer />
                    </div>
                </main>
                <CookieConsentBanner />
                <OnboardingTour />
            </div>
        </OnboardingProvider>
    );
}
