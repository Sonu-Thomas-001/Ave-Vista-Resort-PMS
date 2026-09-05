'use client';

import { useState } from 'react';
import { Bed, Users, IndianRupee, Ban, CheckCircle2, Brush, Wrench, Eye, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import styles from './RoomCard.module.css';

interface RoomCardProps {
    number: string;
    type: string;
    status: 'Clean' | 'Dirty' | 'Occupied' | 'Maintenance' | 'Free';
    price: string;
    occupancy: number;
    guest?: string;
    checkOutDate?: string;
    imageUrl?: string;
    onBlock?: () => void;
    onClean?: () => void;
    onDetails?: () => void;
}

export default function RoomCard({
    number,
    type,
    status,
    price,
    occupancy,
    guest,
    checkOutDate,
    imageUrl,
    onBlock,
    onClean,
    onDetails
}: RoomCardProps) {
    const [imgSrc, setImgSrc] = useState<string | undefined>(imageUrl);
    const [imgFailed, setImgFailed] = useState(false);

    const getStatusLabel = () => {
        switch (status) {
            case 'Free':
            case 'Clean':
                return 'Ready / Vacant';
            case 'Occupied':
                return 'In-House Guest';
            case 'Dirty':
                return 'Needs Cleaning';
            case 'Maintenance':
                return 'Out of Order';
            default:
                return status;
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'Free':
            case 'Clean':
                return <CheckCircle2 size={13} />;
            case 'Occupied':
                return <Users size={13} />;
            case 'Dirty':
                return <Brush size={13} />;
            case 'Maintenance':
                return <Wrench size={13} />;
            default:
                return <AlertCircle size={13} />;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {!imgFailed && imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={`Room ${number}`}
                        className={styles.roomImage}
                        onError={() => {
                            setImgFailed(true);
                        }}
                    />
                ) : (
                    <div className={styles.placeholderImage}>
                        <Bed size={32} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ave Vista Resort</span>
                    </div>
                )}

                <div className={styles.imageOverlayGradient} />

                {/* Live Status Pill */}
                <div className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
                    <span className={styles.statusDot} />
                    {getStatusIcon()}
                    <span>{getStatusLabel()}</span>
                </div>

                {/* Floating Price Pill */}
                <div className={styles.rateBadge}>
                    <span>{price}</span>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.roomTitleGroup}>
                        <span className={styles.number}>Room {number}</span>
                        <span className={styles.type}>{type}</span>
                    </div>
                </div>

                {/* Active Guest display if occupied */}
                {status === 'Occupied' && guest && (
                    <div className={styles.guestBanner}>
                        <div className={styles.guestAvatar}>
                            {guest.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.guestInfo}>
                            <span className={styles.guestName}>{guest}</span>
                            {checkOutDate && (
                                <span className={styles.guestStay}>
                                    Departs: {new Date(checkOutDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.specsRow}>
                    <div className={styles.specItem}>
                        <Users size={14} />
                        <span>Up to {occupancy} Guests</span>
                    </div>
                    <div className={styles.specItem}>
                        <Bed size={14} />
                        <span>Comfort Suite</span>
                    </div>
                </div>
            </div>

            {/* Smart Action Footer */}
            <div className={styles.actions}>
                {status === 'Dirty' ? (
                    <>
                        <button onClick={onClean} className={`${styles.actionBtn} ${styles.cleanAction}`}>
                            <Sparkles size={14} /> Mark Clean
                        </button>
                        <button onClick={onDetails} className={styles.actionBtn}>
                            <Eye size={14} /> Details
                        </button>
                    </>
                ) : status === 'Maintenance' ? (
                    <>
                        <button onClick={onBlock} className={`${styles.actionBtn} ${styles.restoreAction}`}>
                            <CheckCircle2 size={14} /> Restore
                        </button>
                        <button onClick={onDetails} className={styles.actionBtn}>
                            <Eye size={14} /> Details
                        </button>
                    </>
                ) : status === 'Occupied' ? (
                    <>
                        <button onClick={onDetails} className={`${styles.actionBtn} ${styles.primaryAction}`}>
                            <Eye size={14} /> View Stay
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={onBlock} className={styles.actionBtn} title="Mark for Maintenance">
                            <Ban size={13} /> Block
                        </button>
                        <button onClick={onDetails} className={`${styles.actionBtn} ${styles.primaryAction}`}>
                            <Eye size={14} /> Details
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
