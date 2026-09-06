'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { OnboardingStep } from '@/contexts/OnboardingContext';
import styles from './onboarding.module.css';

interface TargetRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface TourTooltipProps {
    step: OnboardingStep;
    stepIndex: number;
    totalSteps: number;
    targetRect: TargetRect | null;
    isMobile: boolean;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
}

export default function TourTooltip({
    step,
    stepIndex,
    totalSteps,
    targetRect,
    isMobile,
    onNext,
    onPrev,
    onSkip
}: TourTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const nextBtnRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 100, left: 100 });

    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === totalSteps - 1;
    const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);

    // Calculate optimal position on desktop
    useEffect(() => {
        if (isMobile || !tooltipRef.current) return;

        const frameId = requestAnimationFrame(() => {
            if (!tooltipRef.current) return;
            const tooltipEl = tooltipRef.current;
            const tooltipWidth = tooltipEl.offsetWidth || 370;
            const tooltipHeight = tooltipEl.offsetHeight || 380;
            const margin = 16;

            if (!targetRect) {
                // Fallback: center in screen
                setCoords({
                    top: Math.max(margin, (window.innerHeight - tooltipHeight) / 2),
                    left: Math.max(margin, (window.innerWidth - tooltipWidth) / 2)
                });
                return;
            }

            let left = targetRect.left + targetRect.width + margin;
            // If placing on right goes outside window, place on left of target
            if (left + tooltipWidth > window.innerWidth - margin) {
                left = Math.max(margin, targetRect.left - tooltipWidth - margin);
            }

            // Align top with target top, clamping to viewport boundaries
            let top = targetRect.top - 8;
            if (top + tooltipHeight > window.innerHeight - margin) {
                top = Math.max(margin, window.innerHeight - tooltipHeight - margin);
            }
            if (top < margin) {
                top = margin;
            }

            setCoords({ top, left });
        });

        return () => cancelAnimationFrame(frameId);
    }, [targetRect, isMobile, step]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || (e.key === 'Enter' && document.activeElement !== tooltipRef.current)) {
                // Advance
                e.preventDefault();
                onNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                onPrev();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onSkip();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNext, onPrev, onSkip]);

    // Auto-focus the next button on step change for effortless keyboard flow
    useEffect(() => {
        const timer = setTimeout(() => {
            nextBtnRef.current?.focus();
        }, 80);
        return () => clearTimeout(timer);
    }, [stepIndex]);

    const inlineStyle: React.CSSProperties = isMobile
        ? {}
        : {
              top: `${coords.top}px`,
              left: `${coords.left}px`
          };

    return (
        <div
            ref={tooltipRef}
            className={styles.tooltipCard}
            style={inlineStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-step-title"
            aria-describedby="tour-step-desc"
        >
            {/* Mobile Drag/Indicator Handle */}
            {isMobile && <div className={styles.mobileHandle} aria-hidden="true" />}

            {/* Header: Step counter, badge & close button */}
            <div className={styles.tooltipHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={styles.stepBadge}>
                        Step {stepIndex + 1} of {totalSteps}
                    </span>
                    {step.badgeLabel && (
                        <span
                            style={{
                                fontSize: '0.74rem',
                                color: 'var(--text-secondary)',
                                fontWeight: 500
                            }}
                        >
                            • {step.badgeLabel}
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    className={styles.closeIconBtn}
                    onClick={onSkip}
                    title="Skip tour"
                    aria-label="Skip tour"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Animated Progress Bar */}
            <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
            </div>

            {/* Body: Title, Explain, Bullets */}
            <div className={styles.tooltipBody}>
                <h3 id="tour-step-title" className={styles.tooltipTitle}>
                    {step.title}
                </h3>
                <p id="tour-step-desc" className={styles.tooltipExplain}>
                    {step.explain}
                </p>

                {step.bullets && step.bullets.length > 0 && (
                    <div className={styles.bulletList}>
                        {step.bullets.map((bullet, idx) => (
                            <div key={idx} className={styles.bulletItem}>
                                <span className={styles.bulletDot} aria-hidden="true" />
                                <span>{bullet}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            <div className={styles.tooltipFooter}>
                <button
                    type="button"
                    className={styles.skipTourLink}
                    onClick={onSkip}
                >
                    Skip tour
                </button>

                <div className={styles.navButtonsGroup}>
                    <button
                        type="button"
                        className={styles.btnBack}
                        onClick={onPrev}
                        aria-label={isFirstStep ? 'Return to Welcome' : 'Previous step'}
                    >
                        <ChevronLeft size={15} />
                        <span>{isFirstStep ? 'Intro' : 'Back'}</span>
                    </button>

                    <button
                        ref={nextBtnRef}
                        type="button"
                        className={styles.btnNext}
                        onClick={onNext}
                        aria-label={isLastStep ? 'Finish tour' : 'Next step'}
                    >
                        <span>{isLastStep ? 'Finish' : 'Next'}</span>
                        {isLastStep ? <Check size={15} /> : <ChevronRight size={15} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
