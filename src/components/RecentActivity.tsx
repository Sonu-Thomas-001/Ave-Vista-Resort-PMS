import { CheckCircle2, User, Home } from 'lucide-react';
import styles from './RecentActivity.module.css';

const activities = [
    { id: 1, text: 'John Doe checked in', time: '5 mins ago', icon: User, type: 'guest' },

    { id: 3, text: 'Payment received for Room 204', time: '1 hour ago', icon: CheckCircle2, type: 'payment' },
    { id: 4, text: 'New booking via Booking.com', time: '2 hours ago', icon: User, type: 'booking' },
];

export default function RecentActivity() {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Recent Activity</h3>
            <div className={styles.list}>
                {activities.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className={styles.item}>
                            <div className={`${styles.iconBase} ${styles[item.type]}`}>
                                <Icon size={16} />
                            </div>
                            <div className={styles.content}>
                                <p className={styles.text}>{item.text}</p>
                                <span className={styles.time}>{item.time}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
