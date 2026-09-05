import React from 'react';

export default function Loading() {
    return (
        <div style={{
            padding: '24px 32px',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            animation: 'fadeIn 0.2s ease'
        }}>
            {/* Top Stat Cards Skeleton Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px'
            }}>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        style={{
                            height: '110px',
                            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                            backgroundSize: '200% 100%',
                            borderRadius: '16px',
                            animation: 'shimmer 1.8s infinite'
                        }}
                    />
                ))}
            </div>

            {/* Main Panel & Side Panel Skeleton */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '20px'
            }}>
                <div style={{
                    height: '420px',
                    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                    backgroundSize: '200% 100%',
                    borderRadius: '20px',
                    animation: 'shimmer 1.8s infinite'
                }} />
                <div style={{
                    height: '420px',
                    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                    backgroundSize: '200% 100%',
                    borderRadius: '20px',
                    animation: 'shimmer 1.8s infinite'
                }} />
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
