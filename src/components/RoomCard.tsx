import { Bed, Users, IndianRupee, Ban, CheckCircle, Brush } from 'lucide-react';
import Image from 'next/image';
import styles from './RoomCard.module.css';

interface RoomCardProps {
    number: string;
    type: string;
    status: 'Clean' | 'Dirty' | 'Occupied' | 'Maintenance' | 'Free';
    price: string;
    occupancy: number;
    guest?: string;
    imageUrl?: string;
    onBlock?: () => void;
    onClean?: () => void;
    onDetails?: () => void;
}

export default function RoomCard({ number, type, status, price, occupancy, guest, imageUrl, onBlock, onClean, onDetails }: RoomCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {/* In a real app, use next/image with a valid src. Using placeholder for now if no image. */
                    imageUrl ? (
                        <img src={imageUrl} alt={`Room ${number}`} className={styles.roomImage} />
                    ) : (
                        <div className={styles.placeholderImage}>
                            <Bed size={32} />
                        </div>
                    )}
                <div className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
                    {status === 'Maintenance' ? <Ban size={14} /> : <CheckCircle size={14} />}
                    <span>{status}</span>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.number}>Room {number}</span>
                </div>
                <div className={styles.type}>{type}</div>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <Users size={16} />
                        <span>Max {occupancy}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <IndianRupee size={16} />
                        <span className={styles.price}>{price}</span>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                {status === 'Maintenance' ? (
                    <button onClick={onBlock} className={`${styles.actionBtn} ${styles.primaryAction}`}>
                        Restore
                    </button>
                ) : (
                    <button onClick={onBlock} className={styles.actionBtn}>
                        <Ban size={14} style={{ marginRight: 4 }} /> Block
                    </button>
                )}

                {status === 'Dirty' ? (
                    <button onClick={onClean} className={`${styles.actionBtn} ${styles.primaryAction}`}>
                        <Brush size={14} style={{ marginRight: 4 }} /> Clean
                    </button>
                ) : (
                    <button onClick={onDetails} className={styles.actionBtn}>
                        Details
                    </button>
                )}
            </div>
        </div>
    );
}
