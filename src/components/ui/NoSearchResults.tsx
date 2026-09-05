'use client';

import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import styles from './EmptyState.module.css';

interface NoSearchResultsProps {
    query?: string;
    description?: string;
    onClear?: () => void;
}

export default function NoSearchResults({
    query,
    description,
    onClear
}: NoSearchResultsProps) {
    return (
        <div className={styles.container}>
            <div className={styles.iconCircle} style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                <SearchX size={26} />
            </div>
            <h3 className={styles.title}>
                {query ? `No results found for "${query}"` : 'No matching records found'}
            </h3>
            <p className={styles.desc}>
                {description || 'We could not locate any folios, guest profiles, or room entries matching your query. Check spelling or clear your filter criteria.'}
            </p>
            {onClear && (
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={onClear}
                    >
                        <RotateCcw size={15} />
                        Clear Filter Criteria
                    </button>
                </div>
            )}
        </div>
    );
}
