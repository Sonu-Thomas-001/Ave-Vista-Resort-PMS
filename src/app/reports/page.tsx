'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download } from 'lucide-react';
import styles from './page.module.css';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('Overview');
    const [dateRange, setDateRange] = useState('This Month');

    return (
        <>
            <Header title="Reports & Analytics" />

            <div className={styles.container}>
                {/* Controls */}
                <div className={styles.controls}>
                    <div className={styles.tabs}>
                        {['Overview', 'Revenue', 'Occupancy', 'Staff'].map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className={styles.actions}>
                        <select
                            className={styles.select}
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>Last 3 Months</option>
                        </select>
                        <button className={styles.exportBtn}>
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Overview Content */}
                <div className={styles.content}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                                <DollarSign size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Total Revenue</span>
                                <span className={styles.statValue}>₹4,25,000</span>
                                <span className={styles.statTrend}><TrendingUp size={12} /> +12% vs last month</span>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#E3F2FD', color: '#1565C0' }}>
                                <Users size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Occupancy Rate</span>
                                <span className={styles.statValue}>78%</span>
                                <span className={styles.statTrend}><TrendingUp size={12} /> +5% vs last month</span>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#FFF3E0', color: '#EF6C00' }}>
                                <Calendar size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>RevPAR</span>
                                <span className={styles.statValue}>₹3,200</span>
                                <span className={styles.statSub}>Rev. per Available Room</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.chartsGrid}>
                        <div className={styles.chartCard}>
                            <h3>Revenue Trend</h3>
                            <div className={styles.chartPlaceholder}>
                                {/* Mock Chart Visual */}
                                <div className={styles.barGroup}>
                                    <div className={styles.bar} style={{ height: '40%' }} title="Week 1"></div>
                                    <div className={styles.bar} style={{ height: '60%' }} title="Week 2"></div>
                                    <div className={styles.bar} style={{ height: '85%' }} title="Week 3"></div>
                                    <div className={styles.bar} style={{ height: '55%' }} title="Week 4"></div>
                                </div>
                                <div className={styles.chartLabels}>
                                    <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chartCard}>
                            <h3>Room Type Performance</h3>
                            <div className={styles.listChart}>
                                <div className={styles.listItem}>
                                    <div className={styles.listLabel}>
                                        <span>Deluxe Hill View</span>
                                        <span>85% occ.</span>
                                    </div>
                                    <div className={styles.progressBar}><div style={{ width: '85%' }}></div></div>
                                </div>
                                <div className={styles.listItem}>
                                    <div className={styles.listLabel}>
                                        <span>Standard Room</span>
                                    </div>
                                    <div className={styles.progressBar}><div style={{ width: '60%' }}></div></div>
                                </div>
                                <div className={styles.listItem}>
                                    <div className={styles.listLabel}>
                                        <span>Suite</span>
                                        <span>92% occ.</span>
                                    </div>
                                    <div className={styles.progressBar}><div style={{ width: '92%' }}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.tableCard}>
                        <h3>Recent Transactions</h3>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Source</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>02 Feb 2026</td>
                                    <td>Room 101 Checkout</td>
                                    <td>₹12,400</td>
                                    <td><span className={styles.tag}>Completed</span></td>
                                </tr>
                                <tr>
                                    <td>02 Feb 2026</td>
                                    <td>Restaurant Bill - Room 105</td>
                                    <td>₹1,200</td>
                                    <td><span className={styles.tag}>Completed</span></td>
                                </tr>
                                <tr>
                                    <td>01 Feb 2026</td>
                                    <td>Advance Booking #BK092</td>
                                    <td>₹5,000</td>
                                    <td><span className={styles.tag}>Completed</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
