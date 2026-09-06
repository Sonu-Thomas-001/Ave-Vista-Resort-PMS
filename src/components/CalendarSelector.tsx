'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import styles from './CalendarSelector.module.css';

interface CalendarSelectorProps {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (start: Date | null, end: Date | null) => void;
}

export default function CalendarSelector({ startDate, endDate, onChange }: CalendarSelectorProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Basic date helpers
    const getDaysOrYear = (year: number) => {
        return (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365;
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    // Render Grid
    const renderDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMon = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month); // Day 0-6

        // Adjust for Monday start? Let's assume standard Sunday (0) or User Preference?
        // Standard Calendar Usually Starts Sunday or Monday... Let's do Monday start for business apps often better?
        // Or stick to Standard Sunday (0). Let's stick to Sunday = 0 for simplicity or standard US/International mix.
        // Actually, the previous screenshot showed Mo Tu ... So MONDAY START.

        let startDayOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon=0, Sun=6

        const days = [];
        // Empty cells
        for (let i = 0; i < startDayOffset; i++) {
            days.push(<div key={`empty-${i}`} className={styles.emptyDay} />);
        }

        // Days
        for (let d = 1; d <= daysInMon; d++) {
            const date = new Date(year, month, d);
            const isToday = new Date().toDateString() === date.toDateString();
            const isDisabled = date < new Date(new Date().setHours(0, 0, 0, 0)); // Disable past dates

            // Selection Logic
            const isStart = startDate?.toDateString() === date.toDateString();
            const isEnd = endDate?.toDateString() === date.toDateString();
            const isInRange = startDate && endDate && date > startDate && date < endDate;

            let className = styles.day;
            if (isDisabled) className += ` ${styles.disabled}`;
            if (isToday) className += ` ${styles.today}`;
            if (isStart) className += ` ${styles.selected} ${styles.rangeStart}`;
            if (isEnd) className += ` ${styles.selected} ${styles.rangeEnd}`;
            if (isInRange) className += ` ${styles.inRange}`;

            // Adjust single day selection radius
            if (isStart && !endDate) className += ` ${styles.rangeEnd}`; // Rounded both sides if single

            days.push(
                <div
                    key={d}
                    className={className}
                    onClick={() => !isDisabled && handleDateClick(date)}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    const handleDateClick = (date: Date) => {
        if (!startDate || (startDate && endDate)) {
            // New selection start
            onChange(date, null);
        } else if (startDate && !endDate) {
            // Complete selection
            if (date < startDate) {
                // If clicked before start, strict reset to new start
                onChange(date, null);
            } else {
                onChange(startDate, date);
            }
        }
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={20} /></button>
                <div className={styles.title}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={20} /></button>
            </div>

            <div className={styles.grid} style={{ marginBottom: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                <div className={styles.weekday}>Mo</div>
                <div className={styles.weekday}>Tu</div>
                <div className={styles.weekday}>We</div>
                <div className={styles.weekday}>Th</div>
                <div className={styles.weekday}>Fr</div>
                <div className={styles.weekday}>Sa</div>
                <div className={styles.weekday}>Su</div>
            </div>

            <div className={styles.grid}>
                {renderDays()}
            </div>
        </div>
    );
}
