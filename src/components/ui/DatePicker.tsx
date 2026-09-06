'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DatePicker.module.css';

export interface DatePickerProps {
    value?: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    minDate?: string; // YYYY-MM-DD
    maxDate?: string; // YYYY-MM-DD
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    clearable?: boolean;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
    id?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function parseISODate(isoStr?: string): Date | null {
    if (!isoStr) return null;
    const parts = isoStr.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m, d);
}

function formatToISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDisplayDate(isoStr?: string): string {
    const date = parseISODate(isoStr);
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = SHORT_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export default function DatePicker({
    value,
    onChange,
    minDate,
    maxDate,
    placeholder = 'Select date',
    label,
    disabled = false,
    clearable = true,
    size = 'md',
    fullWidth = false,
    className = '',
    id,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

    // Currently viewed month/year in the calendar view
    const initialDate = useMemo(() => parseISODate(value) || new Date(), [value]);
    const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth());

    // Year range window for year selector view
    const [yearWindowStart, setYearWindowStart] = useState(() => Math.floor(initialDate.getFullYear() / 12) * 12);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Sync view when opening
    const handleOpen = useCallback(() => {
        if (disabled) return;
        const currentSelected = parseISODate(value) || new Date();
        setViewYear(currentSelected.getFullYear());
        setViewMonth(currentSelected.getMonth());
        setYearWindowStart(Math.floor(currentSelected.getFullYear() / 12) * 12);
        setViewMode('days');
        setIsOpen(true);
    }, [disabled, value]);

    // Close on click outside or Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const selectedDateISO = value || '';
    const todayISO = useMemo(() => formatToISO(new Date()), []);

    // Month Navigation
    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((prev) => prev - 1);
        } else {
            setViewMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((prev) => prev + 1);
        } else {
            setViewMonth((prev) => prev + 1);
        }
    };

    // Quick Selectors
    const handleSelectMonth = (monthIdx: number) => {
        setViewMonth(monthIdx);
        setViewMode('days');
    };

    const handleSelectYear = (year: number) => {
        setViewYear(year);
        setViewMode('months');
    };

    const handleSelectDate = (dateISO: string) => {
        onChange(dateISO);
        setIsOpen(false);
        triggerRef.current?.focus();
    };


    const handleToday = () => {
        const today = new Date();
        onChange(todayISO);
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    // Construct 42-day grid (6 rows of 7 days)
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        // Monday start: 0 = Mon, 6 = Sun
        const dayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
        const startDayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const days = [];

        // Previous month days
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
        for (let i = startDayOffset - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const prevDate = new Date(viewYear, viewMonth - 1, d);
            const iso = formatToISO(prevDate);
            days.push({
                dayNumber: d,
                iso,
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(viewYear, viewMonth, d);
            const iso = formatToISO(date);
            days.push({
                dayNumber: d,
                iso,
                isCurrentMonth: true,
            });
        }

        // Next month trailing days to complete 42 cells
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            const nextDate = new Date(viewYear, viewMonth + 1, d);
            const iso = formatToISO(nextDate);
            days.push({
                dayNumber: d,
                iso,
                isCurrentMonth: false,
            });
        }

        return days;
    }, [viewYear, viewMonth]);

    const isDateDisabled = (iso: string) => {
        if (minDate && iso < minDate) return true;
        if (maxDate && iso > maxDate) return true;
        return false;
    };

    // Dynamic classes
    const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

    return (
        <div
            ref={containerRef}
            className={`${styles.datePickerContainer} ${fullWidth ? styles.fullWidth : ''} ${className}`}
        >
            {label && <label className={styles.fieldLabel}>{label}</label>}

            <button
                ref={triggerRef}
                type="button"
                id={id}
                onClick={isOpen ? () => setIsOpen(false) : handleOpen}
                disabled={disabled}
                className={`${styles.trigger} ${sizeClass} ${isOpen ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <div className={styles.triggerContent}>
                    <CalendarIcon size={size === 'sm' ? 14 : 16} className={styles.calendarIcon} />
                    {selectedDateISO ? (
                        <span className={styles.dateText}>{formatDisplayDate(selectedDateISO)}</span>
                    ) : (
                        <span className={styles.placeholder}>{placeholder}</span>
                    )}
                </div>

                <div className={styles.triggerActions}>
                    {clearable && selectedDateISO && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            className={styles.clearBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                                setIsOpen(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onChange('');
                                    setIsOpen(false);
                                }
                            }}
                            title="Clear date"
                        >
                            <X size={14} />
                        </span>
                    )}
                    <ChevronDown size={14} style={{ color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.popover}
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            {viewMode === 'days' && (
                                <>
                                    <button
                                        type="button"
                                        className={styles.navBtn}
                                        onClick={handlePrevMonth}
                                        title="Previous month"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.titleBtn}
                                        onClick={() => setViewMode('months')}
                                        title="Jump to month or year"
                                    >
                                        {MONTHS[viewMonth]} {viewYear}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.navBtn}
                                        onClick={handleNextMonth}
                                        title="Next month"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </>
                            )}

                            {viewMode === 'months' && (
                                <>
                                    <button
                                        type="button"
                                        className={styles.navBtn}
                                        onClick={() => setViewYear((y) => y - 1)}
                                        title="Previous year"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.titleBtn}
                                        onClick={() => {
                                            setYearWindowStart(Math.floor(viewYear / 12) * 12);
                                            setViewMode('years');
                                        }}
                                        title="Jump to year range"
                                    >
                                        {viewYear}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.navBtn}
                                        onClick={() => setViewYear((y) => y + 1)}
                                        title="Next year"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </>
                            )}

                            {viewMode === 'years' && (
                                <>
                                    <button
                                        type="button"
                                        className={styles.navBtn}
                                        onClick={() => setYearWindowStart((w) => w - 12)}
                                        title="Previous 12 years"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className={styles.titleBtn} style={{ cursor: 'default' }}>
                                        {yearWindowStart} - {yearWindowStart + 11}
                                    </span>
                                    <button
                                        type="button"
                                        className={styles.navBtn}
                                        onClick={() => setYearWindowStart((w) => w + 12)}
                                        title="Next 12 years"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mode 1: Days View */}
                        {viewMode === 'days' && (
                            <>
                                <div className={styles.weekdays}>
                                    {WEEKDAYS.map((day) => (
                                        <div key={day} className={styles.weekday}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.daysGrid}>
                                    {calendarDays.map((item) => {
                                        const isSelected = item.iso === selectedDateISO;
                                        const isToday = item.iso === todayISO;
                                        const isDisabled = isDateDisabled(item.iso);

                                        let dayCls = styles.dayCell;
                                        if (!item.isCurrentMonth) dayCls += ` ${styles.dayOutside}`;
                                        if (isToday) dayCls += ` ${styles.dayToday}`;
                                        if (isSelected) dayCls += ` ${styles.daySelected}`;
                                        if (isDisabled) dayCls += ` ${styles.dayDisabled}`;

                                        return (
                                            <button
                                                key={item.iso}
                                                type="button"
                                                className={dayCls}
                                                disabled={isDisabled}
                                                onClick={() => handleSelectDate(item.iso)}
                                            >
                                                {item.dayNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Mode 2: Months Quick Selection */}
                        {viewMode === 'months' && (
                            <div className={styles.pickerGrid}>
                                {SHORT_MONTHS.map((mon, idx) => {
                                    const isSelected = idx === viewMonth;
                                    return (
                                        <button
                                            key={mon}
                                            type="button"
                                            className={`${styles.pickerItem} ${isSelected ? styles.pickerItemSelected : ''}`}
                                            onClick={() => handleSelectMonth(idx)}
                                        >
                                            {mon}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Mode 3: Years Quick Selection */}
                        {viewMode === 'years' && (
                            <div className={styles.pickerGrid}>
                                {Array.from({ length: 12 }).map((_, idx) => {
                                    const y = yearWindowStart + idx;
                                    const isSelected = y === viewYear;
                                    return (
                                        <button
                                            key={y}
                                            type="button"
                                            className={`${styles.pickerItem} ${isSelected ? styles.pickerItemSelected : ''}`}
                                            onClick={() => handleSelectYear(y)}
                                        >
                                            {y}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Footer Toolbar */}
                        <div className={styles.footer}>
                            <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.clearActionBtn}`}
                                onClick={() => {
                                    onChange('');
                                    setIsOpen(false);
                                }}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.todayActionBtn}`}
                                onClick={handleToday}
                            >
                                Today
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
