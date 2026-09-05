import React from 'react';

const AuthFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div style={{
            fontSize: '0.82rem',
            color: '#64748b',
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingBottom: '0.5rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            lineHeight: 1.5
        }}>
            <span>&copy; {currentYear} <strong style={{ color: '#0f172a' }}>Ave Vista Resorts PMS</strong>.</span>
            <span style={{ color: '#cbd5e1' }}>&bull;</span>
            <span>A product of <strong style={{ color: '#0f172a' }}>MidCell Studios</strong>.</span>
            <span style={{ color: '#cbd5e1' }}>&bull;</span>
            <span>Proprietary Software. All Rights Reserved</span>
        </div>
    );
};

export default AuthFooter;
