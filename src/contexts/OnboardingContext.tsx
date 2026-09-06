'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { hasAccess, UserRole } from '@/lib/permissions';

export const CURRENT_ONBOARDING_VERSION = '1.0';

export interface OnboardingStep {
    id: string;
    title: string;
    explain: string;
    bullets: string[];
    target: string; // matches data-onboarding="{target}"
    href: string;
    badgeLabel?: string;
}

export interface OnboardingContextType {
    isOpen: boolean;
    isWelcomeOpen: boolean;
    isCompletionOpen: boolean;
    isSkipConfirmOpen: boolean;
    stepIndex: number;
    currentStep: OnboardingStep | null;
    steps: OnboardingStep[];
    totalSteps: number;
    startTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    promptSkip: () => void;
    cancelSkip: () => void;
    confirmSkip: () => void;
    finishTour: () => void;
    restartTour: () => void;
    userRole: UserRole;
    isLoadingStatus: boolean;
}

const ALL_TOUR_STEPS: OnboardingStep[] = [
    {
        id: 'dashboard',
        title: 'Your Resort at a Glance',
        explain: 'The dashboard gives you a real-time overview of your resort operations.',
        bullets: [
            "Today's check-ins & check-outs",
            'Live occupancy & room availability',
            'Revenue & collection metrics',
            'Quick operational actions & recent activity'
        ],
        target: 'nav-dashboard',
        href: '/',
        badgeLabel: 'Overview'
    },
    {
        id: 'bookings',
        title: 'Manage Your Bookings',
        explain: 'Create, view, update and manage reservations from one place.',
        bullets: [
            'New booking creation & room assignment',
            'Interactive availability calendar',
            'Guest contact & stay details',
            'Advance payment tracking & cancellations'
        ],
        target: 'nav-bookings',
        href: '/bookings',
        badgeLabel: 'Operations'
    },
    {
        id: 'rooms',
        title: 'Know Your Room Status',
        explain: 'See room availability and housekeeping readiness instantly.',
        bullets: [
            'Live statuses: Clean, Dirty, Occupied, Maintenance',
            'Room category & pricing overview',
            'Housekeeping service tracking',
            'Fast room status updates & turnarounds'
        ],
        target: 'nav-rooms',
        href: '/rooms',
        badgeLabel: 'Housekeeping & Rooms'
    },
    {
        id: 'front-desk',
        title: 'Fast Check-in & Check-out',
        explain: 'Complete guest arrival and departure procedures quickly from the front desk.',
        bullets: [
            'Expedited ID proof & Aadhaar capture',
            'Instant room assignment & keycard issue',
            'Folio charges & payment settlements',
            'Fast guest checkout & room turnover'
        ],
        target: 'nav-front-desk',
        href: '/front-desk',
        badgeLabel: 'Front Desk'
    },
    {
        id: 'guests',
        title: 'Keep Guest Information Organized',
        explain: 'Maintain guest profiles and access their booking and stay history.',
        bullets: [
            'Centralized guest directory & lookup',
            'Contact numbers & verified email addresses',
            'Full past reservation & stay history',
            'VIP guest recognition & personalized notes'
        ],
        target: 'nav-guests',
        href: '/guests',
        badgeLabel: 'Hospitality'
    },
    {
        id: 'billing',
        title: 'Simple & Accurate Billing',
        explain: 'Manage room charges, taxes, and professional resort invoices from one place.',
        bullets: [
            'Automated GST tax breakdown',
            'Advance deposits & outstanding balance tracking',
            'Multi-mode settlements (Cash, Card, UPI)',
            'Official GST-compliant PDF invoice generation'
        ],
        target: 'nav-billing',
        href: '/billing',
        badgeLabel: 'Billing & Invoices'
    },
    {
        id: 'expenses',
        title: 'Track Resort Expenses',
        explain: "Record operational expenses and keep your resort's financial activity organized.",
        bullets: [
            'Quick expense logging by category',
            'Payment mode & vendor tracking',
            'Daily expense ledger & audit records',
            'Real-time resort expense analytics'
        ],
        target: 'nav-expenses',
        href: '/expenses',
        badgeLabel: 'Finance'
    },
    {
        id: 'restaurant-bill',
        title: 'Restaurant & Dining POS',
        explain: 'Process table dining orders and transfer food & beverage charges seamlessly.',
        bullets: [
            'Table orders & Kitchen Order Tickets (KOT)',
            'Direct-to-room dining charge folio transfer',
            'Menu items, custom discounts & tax splits',
            'Instant dining receipt generation'
        ],
        target: 'nav-restaurant-bill',
        href: '/restaurant-bill',
        badgeLabel: 'Dining POS'
    },
    {
        id: 'reports',
        title: 'Understand Your Resort Performance',
        explain: 'Use reports and analytics to understand occupancy, revenue, payments and expenses.',
        bullets: [
            'Occupancy trends & ADR/RevPAR performance',
            'Revenue, tax & collection summaries',
            'Daily closing reports for night audits',
            'Exportable financial ledgers & CSV reports'
        ],
        target: 'nav-reports',
        href: '/reports',
        badgeLabel: 'Intelligence'
    },
    {
        id: 'settings',
        title: 'Manage Your PMS',
        explain: 'Configure resort settings and manage staff access based on their responsibilities.',
        bullets: [
            'Resort information & company GST details',
            'Room configuration & pricing tiers',
            'Tax rates & invoice numbering',
            'Staff accounts & role permissions'
        ],
        target: 'nav-settings',
        href: '/settings',
        badgeLabel: 'System'
    }
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const userRole = (user?.role || 'Reception') as UserRole;

    const [isOpen, setIsOpen] = useState(false);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [isCompletionOpen, setIsCompletionOpen] = useState(false);
    const [isSkipConfirmOpen, setIsSkipConfirmOpen] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Filter steps strictly based on current role permissions
    const steps = useMemo(() => {
        if (!user) return [];
        return ALL_TOUR_STEPS.filter(step => hasAccess(user.role, step.href));
    }, [user]);

    const currentStep = useMemo(() => {
        if (steps.length === 0 || stepIndex < 0 || stepIndex >= steps.length) return null;
        return steps[stepIndex];
    }, [steps, stepIndex]);

    const storageKey = useMemo(() => {
        return user ? `ave_vista_onboarding_${user.id}` : null;
    }, [user]);

    // Check onboarding status on load
    useEffect(() => {
        if (authLoading || !user || !storageKey) {
            if (!authLoading && !user) {
                const timer = setTimeout(() => setIsLoadingStatus(false), 0);
                return () => clearTimeout(timer);
            }
            return;
        }

        let isMounted = true;

        async function checkOnboardingStatus() {
            try {
                // 1. Fast local cache check
                const localDataStr = localStorage.getItem(storageKey!);
                if (localDataStr) {
                    try {
                        const localData = JSON.parse(localDataStr);
                        if (
                            (localData.completed || localData.skipped) &&
                            localData.version === CURRENT_ONBOARDING_VERSION
                        ) {
                            if (isMounted) setIsLoadingStatus(false);
                            return;
                        }
                    } catch {
                        // invalid JSON, proceed to DB check
                    }
                }

                // 2. Query profiles table
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('onboarding_completed, onboarding_skipped, onboarding_version')
                    .eq('id', user!.id)
                    .single();

                if (!error && profile) {
                    const isDone = profile.onboarding_completed || profile.onboarding_skipped;
                    const isVersionMatch = profile.onboarding_version === CURRENT_ONBOARDING_VERSION;

                    if (isDone && isVersionMatch) {
                        // Sync to localStorage
                        localStorage.setItem(
                            storageKey!,
                            JSON.stringify({
                                completed: !!profile.onboarding_completed,
                                skipped: !!profile.onboarding_skipped,
                                version: profile.onboarding_version
                            })
                        );
                        if (isMounted) setIsLoadingStatus(false);
                        return;
                    }
                }

                // 3. Check user_metadata as fallback
                const { data: authData } = await supabase.auth.getUser();
                const metadata = authData.user?.user_metadata;
                if (
                    metadata &&
                    (metadata.onboarding_completed || metadata.onboarding_skipped) &&
                    metadata.onboarding_version === CURRENT_ONBOARDING_VERSION
                ) {
                    localStorage.setItem(
                        storageKey!,
                        JSON.stringify({
                            completed: !!metadata.onboarding_completed,
                            skipped: !!metadata.onboarding_skipped,
                            version: metadata.onboarding_version
                        })
                    );
                    if (isMounted) setIsLoadingStatus(false);
                    return;
                }

                // If not completed or skipped, trigger welcome experience after workspace renders cleanly
                if (isMounted) {
                    setIsLoadingStatus(false);
                    const timer = setTimeout(() => {
                        if (isMounted) {
                            setIsWelcomeOpen(true);
                        }
                    }, 700);
                    return () => clearTimeout(timer);
                }
            } catch (err) {
                console.warn('Non-critical: could not verify onboarding status from database:', err);
                if (isMounted) setIsLoadingStatus(false);
            }
        }

        checkOnboardingStatus();

        return () => {
            isMounted = false;
        };
    }, [authLoading, user, storageKey]);

    // Persist onboarding status to DB, user_metadata, and localStorage
    const saveStatus = useCallback(
        async (completed: boolean, skipped: boolean) => {
            if (!user || !storageKey) return;

            const payload = {
                onboarding_completed: completed,
                onboarding_skipped: skipped,
                onboarding_version: CURRENT_ONBOARDING_VERSION,
                onboarding_completed_at: new Date().toISOString()
            };

            // 1. Immediately cache in localStorage
            try {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify({
                        completed,
                        skipped,
                        version: CURRENT_ONBOARDING_VERSION,
                        completed_at: payload.onboarding_completed_at
                    })
                );
            } catch (e) {
                console.warn('Could not save onboarding status to localStorage:', e);
            }

            // 2. Persist in Supabase Auth user_metadata
            try {
                await supabase.auth.updateUser({
                    data: {
                        onboarding_completed: completed,
                        onboarding_skipped: skipped,
                        onboarding_version: CURRENT_ONBOARDING_VERSION,
                        onboarding_completed_at: payload.onboarding_completed_at
                    }
                });
            } catch (err) {
                console.warn('Could not update user metadata with onboarding status:', err);
            }

            // 3. Persist in public.profiles table
            try {
                await supabase
                    .from('profiles')
                    .update(payload)
                    .eq('id', user.id);
            } catch (err) {
                console.warn('Could not update profiles table with onboarding status:', err);
            }
        },
        [user, storageKey]
    );

    // Tour navigation actions
    const startTour = useCallback(() => {
        setIsWelcomeOpen(false);
        setIsCompletionOpen(false);
        setIsSkipConfirmOpen(false);
        setStepIndex(0);
        setIsOpen(true);
    }, []);

    const nextStep = useCallback(() => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            // Reached end of tour
            setIsOpen(false);
            setIsCompletionOpen(true);
        }
    }, [stepIndex, steps.length]);

    const prevStep = useCallback(() => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
        } else {
            // Back from first step returns to welcome
            setIsOpen(false);
            setIsWelcomeOpen(true);
        }
    }, [stepIndex]);

    const promptSkip = useCallback(() => {
        setIsSkipConfirmOpen(true);
    }, []);

    const cancelSkip = useCallback(() => {
        setIsSkipConfirmOpen(false);
    }, []);

    const confirmSkip = useCallback(() => {
        setIsSkipConfirmOpen(false);
        setIsWelcomeOpen(false);
        setIsOpen(false);
        setIsCompletionOpen(false);
        saveStatus(false, true);
    }, [saveStatus]);

    const finishTour = useCallback(() => {
        setIsCompletionOpen(false);
        setIsOpen(false);
        setIsWelcomeOpen(false);
        saveStatus(true, false);
    }, [saveStatus]);

    const restartTour = useCallback(() => {
        setStepIndex(0);
        setIsCompletionOpen(false);
        setIsSkipConfirmOpen(false);
        setIsWelcomeOpen(true);
        setIsOpen(false);
    }, []);

    return (
        <OnboardingContext.Provider
            value={{
                isOpen,
                isWelcomeOpen,
                isCompletionOpen,
                isSkipConfirmOpen,
                stepIndex,
                currentStep,
                steps,
                totalSteps: steps.length,
                startTour,
                nextStep,
                prevStep,
                promptSkip,
                cancelSkip,
                confirmSkip,
                finishTour,
                restartTour,
                userRole,
                isLoadingStatus
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

const defaultOnboardingState: OnboardingContextType = {
    isOpen: false,
    isWelcomeOpen: false,
    isCompletionOpen: false,
    isSkipConfirmOpen: false,
    stepIndex: 0,
    currentStep: null,
    steps: [],
    totalSteps: 0,
    startTour: () => {},
    nextStep: () => {},
    prevStep: () => {},
    promptSkip: () => {},
    cancelSkip: () => {},
    confirmSkip: () => {},
    finishTour: () => {},
    restartTour: () => {},
    userRole: 'Reception',
    isLoadingStatus: false
};

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    return context || defaultOnboardingState;
}
