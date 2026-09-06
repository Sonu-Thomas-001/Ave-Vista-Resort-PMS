'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { hasAccess } from '@/lib/permissions';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import OfflineBanner from './ui/OfflineBanner';
import CookieConsentBanner from './ui/CookieConsentBanner';
import LuxuryPreloader from './ui/LuxuryPreloader';
import TopProgressBar from './ui/TopProgressBar';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { MobileNavProvider, useMobileNav } from '@/contexts/MobileNavContext';
import OnboardingTour from './onboarding/OnboardingTour';

function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isMobileNavOpen, closeMobileNav } = useMobileNav();

    // Responsive Media Queries
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1023px)');

    const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const publicPages = ['/help', '/privacy', '/terms', '/cancellation-policy', '/cookie-policy', '/maintenance', '/forbidden'];

    const isAuthPage = authPages.some(page => pathname.startsWith(page));
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));

    // Sync with sidebar collapse state (Desktop & Tablet)
    useEffect(() => {
        const handleStorage = () => {
            const saved = localStorage.getItem('sidebarCollapsed');
            if (saved !== null) {
                setIsCollapsed(JSON.parse(saved));
            } else if (isTablet) {
                // Default to compact sidebar on tablet to maximize canvas width
                setIsCollapsed(true);
            }
        };

        handleStorage();
        window.addEventListener('storage', handleStorage);
        const interval = setInterval(handleStorage, 500);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, [isTablet]);

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

    if (!user && !isAuthPage && !isPublicPage) {
        return null;
    }

    if (user && isAuthPage) {
        return null;
    }

    if (!user) {
        if (isAuthPage) {
            return (
                <>
                    <TopProgressBar />
                    <OfflineBanner />
                    <main style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'clip', backgroundColor: 'var(--background)' }}>
                        {children}
                    </main>
                    <CookieConsentBanner />
                </>
            );
        }
        return (
            <>
                <TopProgressBar />
                <OfflineBanner />
                <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100vw', overflowX: 'clip' }}>
                    <div style={{ flex: 1 }}>{children}</div>
                    <Footer />
                </main>
                <CookieConsentBanner />
            </>
        );
    }

    // Main Content Responsive style
    const mainStyle: React.CSSProperties = isMobile ? {
        flex: 1,
        marginLeft: 0,
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        backgroundColor: 'var(--background)',
        transition: 'none',
        paddingTop: '0px'
    } : {
        flex: 1,
        marginLeft: isCollapsed ? '80px' : '260px',
        width: isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)',
        maxWidth: isCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 260px)',
        overflowX: 'clip',
        backgroundColor: 'var(--background)',
        transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'clip' }}>
            <TopProgressBar />
            <OfflineBanner />
            <Sidebar
                isMobile={isMobile}
                isOpen={isMobileNavOpen}
                isCollapsed={isCollapsed}
                onToggle={toggleDesktop}
                onCloseMobile={closeMobileNav}
            />

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
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <OnboardingProvider>
            <MobileNavProvider>
                <LayoutContent>{children}</LayoutContent>
            </MobileNavProvider>
        </OnboardingProvider>
    );
}
