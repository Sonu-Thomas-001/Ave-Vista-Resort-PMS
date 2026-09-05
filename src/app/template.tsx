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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
