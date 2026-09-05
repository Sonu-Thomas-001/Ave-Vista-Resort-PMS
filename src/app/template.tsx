'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Normalize auth pages to prevent full-screen unmount/reload animations when toggling between login and signup
    const transitionKey = pathname === '/login' || pathname === '/signup' ? '/auth' : pathname;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={transitionKey}
                initial={{ opacity: 0, y: 8, scale: 0.997 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.998 }}
                transition={{
                    duration: 0.26,
                    ease: [0.22, 1, 0.36, 1]
                }}
                style={{ width: '100%', height: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
