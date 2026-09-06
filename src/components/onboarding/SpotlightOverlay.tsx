'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './onboarding.module.css';

interface TargetRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface SpotlightOverlayProps {
    targetSelector: string;
    onClickBackdrop?: () => void;
    onTargetRectUpdate?: (rect: TargetRect | null) => void;
}

export default function SpotlightOverlay({
    targetSelector,
    onClickBackdrop,
    onTargetRectUpdate
}: SpotlightOverlayProps) {
    const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const updateRect = useCallback(() => {
        if (typeof window === 'undefined') return;

        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
        });

        if (!targetSelector) {
            setTargetRect(null);
            onTargetRectUpdate?.(null);
            return;
        }

        const el = document.querySelector(targetSelector);
        if (el) {
            const rect = el.getBoundingClientRect();
            // Scroll target into view gently if outside viewport
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            const padding = 6;
            const computedRect: TargetRect = {
                top: Math.max(0, rect.top - padding),
                left: Math.max(0, rect.left - padding),
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            };

            setTargetRect(computedRect);
            onTargetRectUpdate?.(computedRect);
        } else {
            setTargetRect(null);
            onTargetRectUpdate?.(null);
        }
    }, [targetSelector, onTargetRectUpdate]);

    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            updateRect();
        });

        const handleResize = () => updateRect();
        const handleScroll = () => updateRect();

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Small delay in case sidebar animations or dom transitions occur
        const timer = setTimeout(updateRect, 150);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [updateRect]);

    const { width, height } = windowSize;
    const hasTarget = targetRect !== null && targetRect.width > 0 && targetRect.height > 0;

    return (
        <>
            {/* SVG Mask Backdrop */}
            <svg
                className={styles.spotlightSvgOverlay}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                aria-hidden="true"
            >
                <defs>
                    <mask id="spotlight-mask">
                        {/* White exposes the dark backdrop */}
                        <rect x="0" y="0" width={width} height={height} fill="#FFFFFF" />
                        {/* Black cuts out a window over the target */}
                        {hasTarget && (
                            <rect
                                x={targetRect.left}
                                y={targetRect.top}
                                width={targetRect.width}
                                height={targetRect.height}
                                rx="10"
                                ry="10"
                                fill="#000000"
                            />
                        )}
                    </mask>
                </defs>

                {/* Dark semi-transparent layer with cutout */}
                <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    fill="rgba(15, 23, 42, 0.65)"
                    mask="url(#spotlight-mask)"
                    onClick={onClickBackdrop}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                />
            </svg>

            {/* Glowing Accent Ring on Target */}
            {hasTarget && (
                <div
                    className={styles.spotlightTargetBox}
                    style={{
                        top: `${targetRect.top}px`,
                        left: `${targetRect.left}px`,
                        width: `${targetRect.width}px`,
                        height: `${targetRect.height}px`
                    }}
                >
                    <div className={styles.spotlightGlowRing} />
                </div>
            )}
        </>
    );
}
