import styles from './OccupancyChart.module.css';

const data = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 38 },
    { day: 'Thu', value: 65 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 92 },
    { day: 'Sun', value: 60 },
];

export default function OccupancyChart() {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Weekly Occupancy</h3>
            <div className={styles.chart}>
                {data.map((item) => (
                    <div key={item.day} className={styles.barGroup}>
                        <div
                            className={styles.bar}
                            style={{ height: `${item.value}%` }}
                        >
                            <div className={styles.tooltip}>{item.value}%</div>
                        </div>
                        <span className={styles.label}>{item.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
