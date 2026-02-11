import React from 'react';

const AuthFooter = () => {
    const year = new Date().getFullYear();

    return (
        <div style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginTop: '1rem',
            paddingBottom: '0',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            flexWrap: 'wrap'
        }}>
            <span>Copyright &copy; {year}</span>
            <span style={{
                fontWeight: 600,
                color: 'var(--text-main)'
            }}>
                Ave Vista Resort PMS
            </span>
            <span>. All Rights Reserved By</span>
            <span style={{
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.5px'
            }}>
                Qubi<span style={{ color: 'var(--primary)' }}>Q</span>ode
            </span>
        </div>
    );
};

export default AuthFooter;
