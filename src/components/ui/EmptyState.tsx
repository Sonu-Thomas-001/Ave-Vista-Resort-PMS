'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    className?: string;
}

export default function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    className
}: EmptyStateProps) {
    return (
        <div className={`${styles.container} ${className || ''}`}>
            <div className={styles.iconCircle}>
                <Icon size={26} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.desc}>{description}</p>
            {(actionLabel || secondaryActionLabel) && (
                <div className={styles.actions}>
                    {actionLabel && onAction && (
                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={onAction}
                        >
                            {actionLabel}
                        </button>
                    )}
                    {secondaryActionLabel && onSecondaryAction && (
                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={onSecondaryAction}
                        >
                            {secondaryActionLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
