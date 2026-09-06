'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface MobileNavContextType {
    isMobileNavOpen: boolean;
    openMobileNav: () => void;
    closeMobileNav: () => void;
    toggleMobileNav: () => void;
    isNotificationsOpen: boolean;
    openNotifications: () => void;
    closeNotifications: () => void;
    toggleNotifications: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const pathname = usePathname();

    // Auto-close drawers when navigating between pages
    useEffect(() => {
        setIsMobileNavOpen(false);
        setIsNotificationsOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileNavOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileNavOpen]);

    const openMobileNav = () => {
        setIsNotificationsOpen(false);
        setIsMobileNavOpen(true);
    };
    const closeMobileNav = () => setIsMobileNavOpen(false);
    const toggleMobileNav = () => {
        setIsNotificationsOpen(false);
        setIsMobileNavOpen((prev) => !prev);
    };

    const openNotifications = () => {
        setIsMobileNavOpen(false);
        setIsNotificationsOpen(true);
    };
    const closeNotifications = () => setIsNotificationsOpen(false);
    const toggleNotifications = () => {
        setIsMobileNavOpen(false);
        setIsNotificationsOpen((prev) => !prev);
    };

    return (
        <MobileNavContext.Provider
            value={{
                isMobileNavOpen,
                openMobileNav,
                closeMobileNav,
                toggleMobileNav,
                isNotificationsOpen,
                openNotifications,
                closeNotifications,
                toggleNotifications,
            }}
        >
            {children}
        </MobileNavContext.Provider>
    );
}

export function useMobileNav() {
    const context = useContext(MobileNavContext);
    if (!context) {
        // Safe fallback if used outside provider
        return {
            isMobileNavOpen: false,
            openMobileNav: () => {},
            closeMobileNav: () => {},
            toggleMobileNav: () => {},
            isNotificationsOpen: false,
            openNotifications: () => {},
            closeNotifications: () => {},
            toggleNotifications: () => {},
        };
    }
    return context;
}
