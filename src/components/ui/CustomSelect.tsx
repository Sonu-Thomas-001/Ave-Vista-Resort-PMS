'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CustomSelect.module.css';

interface Option {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
}

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...', icon }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.container} ref={containerRef}>
            <button
                type="button"
                className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.value}>
                    {icon && <span className={styles.iconWrapper}>{icon}</span>}
                    {selectedOption ? selectedOption.label : <span className={styles.placeholder}>{placeholder}</span>}
                </div>
                <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.dropdown}
                        initial={{ opacity: 0, y: -5, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -5, scaleY: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`${styles.option} ${option.value === value ? styles.selected : ''}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                <span className={styles.optionLabel}>
                                    {option.icon} {option.label}
                                </span>
                                {option.value === value && <Check size={14} className={styles.checkIcon} />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
