'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopProgressBar() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Trigger on route change
        setLoading(true);
        setProgress(30);

        const timer1 = setTimeout(() => {
            setProgress(75);
        }, 100);

        const timer2 = setTimeout(() => {
            setProgress(100);
        }, 220);

        const timer3 = setTimeout(() => {
            setLoading(false);
            setProgress(0);
        }, 450);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [pathname]);

    if (!loading && progress === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                zIndex: 9999999,
                pointerEvents: 'none',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 70%, #bae6fd 100%)',
                    boxShadow: '0 0 10px #38bdf8, 0 0 4px #0284c7',
                    transition: progress === 100 ? 'width 0.15s ease-out, opacity 0.2s 0.1s ease-out' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: progress === 100 ? 0 : 1
                }}
            />
        </div>
    );
}
