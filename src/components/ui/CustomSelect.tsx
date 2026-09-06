'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CustomSelect.module.css';

export interface CustomSelectOption {
    label: string;
    value: string;
    icon?: React.ReactNode;
    badge?: string;
    sublabel?: string;
    color?: string; // status dot color
}

export interface CustomSelectProps {
    options: CustomSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    clearable?: boolean;
    onClear?: () => void;
    className?: string;
    style?: React.CSSProperties;
    ariaLabel?: string;
}

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    icon,
    fullWidth = true,
    size = 'md',
    disabled = false,
    clearable = false,
    onClear,
    className = '',
    style,
    ariaLabel
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Open/toggle dropdown and initialize highlight
    const toggleOpen = () => {
        if (disabled) return;
        setIsOpen(prev => {
            const next = !prev;
            if (next) {
                const idx = options.findIndex(opt => opt.value === value);
                setHighlightedIndex(idx >= 0 ? idx : 0);
            } else {
                setHighlightedIndex(-1);
            }
            return next;
        });
    };

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (disabled) return;

            if (!isOpen) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsOpen(true);
                    const idx = options.findIndex(opt => opt.value === value);
                    setHighlightedIndex(idx >= 0 ? idx : 0);
                }
                return;
            }

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                        onChange(options[highlightedIndex].value);
                        setIsOpen(false);
                        triggerRef.current?.focus();
                    }
                    break;
                case 'Escape':
                case 'Tab':
                    setIsOpen(false);
                    break;
            }
        },
        [disabled, isOpen, options, highlightedIndex, onChange, value]
    );

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClear) {
            onClear();
        } else {
            onChange('');
        }
    };

    const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${fullWidth ? styles.fullWidth : styles.inline} ${className}`}
            style={style}
            onKeyDown={handleKeyDown}
        >
            <button
                ref={triggerRef}
                type="button"
                className={`${styles.trigger} ${sizeClass} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''}`}
                onClick={toggleOpen}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel || placeholder}
                disabled={disabled}
            >
                <div className={styles.valueWrapper}>
                    {icon && <span className={styles.iconWrapper}>{icon}</span>}
                    {selectedOption?.color && (
                        <span className={styles.statusDot} style={{ backgroundColor: selectedOption.color }} />
                    )}
                    {selectedOption ? (
                        <span className={styles.selectedText}>
                            {selectedOption.icon} {selectedOption.label}
                        </span>
                    ) : (
                        <span className={styles.placeholder}>{placeholder}</span>
                    )}
                </div>

                <div className={styles.controlsWrapper}>
                    {clearable && value && !disabled && (
                        <span
                            role="button"
                            tabIndex={-1}
                            className={styles.clearBtn}
                            onClick={handleClear}
                            title="Clear selection"
                            aria-label="Clear selection"
                        >
                            <X size={14} />
                        </span>
                    )}
                    <ChevronDown size={15} className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.dropdown}
                        role="listbox"
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                        {options.length === 0 ? (
                            <div className={styles.noOptions}>No options available</div>
                        ) : (
                            options.map((option, idx) => {
                                const isSelected = option.value === value;
                                const isHighlighted = idx === highlightedIndex;

                                return (
                                    <div
                                        key={option.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        className={`${styles.option} ${isSelected ? styles.selected : ''} ${
                                            isHighlighted ? styles.highlighted : ''
                                        }`}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            triggerRef.current?.focus();
                                        }}
                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                    >
                                        <div className={styles.optionContent}>
                                            {option.color && (
                                                <span
                                                    className={styles.statusDot}
                                                    style={{ backgroundColor: option.color }}
                                                />
                                            )}
                                            {option.icon}
                                            <span>{option.label}</span>
                                            {option.badge && (
                                                <span className={styles.badgePill}>{option.badge}</span>
                                            )}
                                        </div>
                                        {isSelected && <Check size={14} className={styles.checkIcon} />}
                                    </div>
                                );
                            })
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
