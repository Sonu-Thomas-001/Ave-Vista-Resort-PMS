import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import styles from './StatCard.module.css';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    href?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp, href }: StatCardProps) {
    const Content = (
        <div className={styles.card}>
            <div className={styles.iconWrapper}>
                <Icon size={24} />
            </div>
            <div className={styles.content}>
                <div className={styles.title}>{title}</div>
                <div className={styles.value}>{value}</div>
                {trend && (
                    <div className={`${styles.trend} ${trendUp ? styles.positive : styles.negative}`}>
                        <span>{trendUp ? '↑' : '↓'}</span>
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} style={{ textDecoration: 'none' }}>{Content}</Link>;
    }

    return Content;
}
