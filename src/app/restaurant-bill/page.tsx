'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import {
    Plus, X, Eye, Pencil, Trash2, Printer, Search,
    UtensilsCrossed, FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import { RestaurantBillTemplate } from '@/components/RestaurantBillTemplate';

interface BillItem {
    name: string;
    qty: number;
    price: number;
}

interface RestaurantBill {
    id: string;
    bill_number: string;
    guest_name: string;
    room_number: string | null;
    items: BillItem[];
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    payment_mode: string;
    status: string;
    notes: string | null;
    created_by: string | null;
    created_at: string;
}

const emptyItem: BillItem = { name: '', qty: 1, price: 0 };

const GST_RATE = 5; // 5% GST for restaurant

export default function RestaurantBillPage() {
    const [bills, setBills] = useState<RestaurantBill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBill, setEditingBill] = useState<RestaurantBill | null>(null);
    const [viewingBill, setViewingBill] = useState<RestaurantBill | null>(null);
    const [deletingBill, setDeletingBill] = useState<RestaurantBill | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [guestName, setGuestName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [items, setItems] = useState<BillItem[]>([{ ...emptyItem }]);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [status, setStatus] = useState('Paid');
    const [notes, setNotes] = useState('');

    const billRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchBills();
        const interval = setInterval(fetchBills, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchBills = async () => {
        const { data, error } = await supabase
            .from('restaurant_bills')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching restaurant bills:', error);
        }
        if (data) setBills(data);
        setLoading(false);
    };

    const generateBillNumber = () => {
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        return `RB-${dateStr}-${timeStr}`;
    };

    const calculateTotals = (billItems: BillItem[]) => {
        const subtotal = billItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
        const tax_amount = Math.round((subtotal * GST_RATE) / 100);
        const total_amount = subtotal + tax_amount;
        return { subtotal, tax_amount, total_amount };
    };

    const resetForm = () => {
        setGuestName('');
        setRoomNumber('');
        setItems([{ ...emptyItem }]);
        setPaymentMode('Cash');
        setStatus('Paid');
        setNotes('');
    };

    const openCreateModal = () => {
        resetForm();
        setEditingBill(null);
        setShowCreateModal(true);
    };

    const openEditModal = (bill: RestaurantBill) => {
        setGuestName(bill.guest_name);
        setRoomNumber(bill.room_number || '');
        setItems(bill.items.length > 0 ? [...bill.items] : [{ ...emptyItem }]);
        setPaymentMode(bill.payment_mode);
        setStatus(bill.status);
        setNotes(bill.notes || '');
        setEditingBill(bill);
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingBill(null);
        resetForm();
    };

    const addItem = () => {
        setItems([...items, { ...emptyItem }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
        const updated = [...items];
        if (field === 'name') {
            updated[index].name = value as string;
        } else if (field === 'qty') {
            updated[index].qty = Math.max(1, Number(value));
        } else if (field === 'price') {
            updated[index].price = Math.max(0, Number(value));
        }
        setItems(updated);
    };

    const handleSaveBill = async () => {
        if (!guestName.trim()) {
            alert('Please enter guest name');
            return;
        }
        const validItems = items.filter(i => i.name.trim() && i.price > 0);
        if (validItems.length === 0) {
            alert('Please add at least one item with a name and price');
            return;
        }

        setSaving(true);
        const { subtotal, tax_amount, total_amount } = calculateTotals(validItems);

        const billData = {
            guest_name: guestName.trim(),
            room_number: roomNumber.trim() || null,
            items: validItems,
            subtotal,
            tax_amount,
            total_amount,
            payment_mode: paymentMode,
            status,
            notes: notes.trim() || null,
        };

        if (editingBill) {
            // Update
            const { error } = await supabase
                .from('restaurant_bills')
                .update(billData)
                .eq('id', editingBill.id);

            if (error) {
                console.error('Error updating bill:', error);
                alert('Failed to update bill');
            } else {
                closeModal();
                fetchBills();
            }
        } else {
            // Create
            const { error } = await supabase
                .from('restaurant_bills')
                .insert({
                    ...billData,
                    bill_number: generateBillNumber(),
                });

            if (error) {
                console.error('Error creating bill:', error);
                alert('Failed to create bill');
            } else {
                closeModal();
                fetchBills();
            }
        }
        setSaving(false);
    };

    const handleDeleteBill = async () => {
        if (!deletingBill) return;
        const { error } = await supabase
            .from('restaurant_bills')
            .delete()
            .eq('id', deletingBill.id);

        if (error) {
            console.error('Error deleting bill:', error);
            alert('Failed to delete bill');
        } else {
            setDeletingBill(null);
            fetchBills();
        }
    };

    const handlePrintBill = async (bill: RestaurantBill) => {
        const printContainer = document.createElement('div');
        printContainer.style.position = 'fixed';
        printContainer.style.top = '0';
        printContainer.style.left = '-9999px';
        printContainer.style.width = '210mm';
        printContainer.style.zIndex = '9999';
        printContainer.style.background = 'white';
        document.body.appendChild(printContainer);

        const { createRoot } = await import('react-dom/client');
        const root = createRoot(printContainer);
        const { RestaurantBillTemplate } = await import('@/components/RestaurantBillTemplate');

        root.render(<RestaurantBillTemplate bill={bill} />);

        setTimeout(() => {
            window.print();
            setTimeout(() => {
                root.unmount();
                document.body.removeChild(printContainer);
            }, 100);
        }, 500);
    };

    // Filter bills by search
    const filteredBills = bills.filter(bill => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            bill.bill_number.toLowerCase().includes(q) ||
            bill.guest_name.toLowerCase().includes(q) ||
            (bill.room_number && bill.room_number.toLowerCase().includes(q))
        );
    });

    // Stats
    const today = new Date().toISOString().split('T')[0];
    const todayBills = bills.filter(b => b.created_at.startsWith(today));
    const todayRevenue = todayBills.reduce((sum, b) => sum + (b.status === 'Paid' ? b.total_amount : b.status === 'Partial' ? (b.total_amount / 2) : 0), 0);
    const totalPending = bills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.total_amount, 0);

    const { subtotal: formSubtotal, tax_amount: formTax, total_amount: formTotal } = calculateTotals(
        items.filter(i => i.name.trim() && i.price > 0)
    );

    return (
        <>
            <Header title="Restaurant Billing" />

            <div className={styles.container}>
                {/* Stats Row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Today&apos;s Bills</span>
                        <span className={styles.statValue}>{todayBills.length}</span>
                        <span className={styles.statSub}>Bills generated today</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Today&apos;s Revenue</span>
                        <span className={styles.statValue}>₹{todayRevenue.toLocaleString()}</span>
                        <span className={styles.statSub}>From restaurant orders</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Pending Dues</span>
                        <span className={styles.statValue}>₹{totalPending.toLocaleString()}</span>
                        <span className={styles.statSub}>{bills.filter(b => b.status !== 'Paid').length} bills pending</span>
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <div className={styles.tabs}>
                        <button className={`${styles.tabBtn} ${styles.active}`}>
                            All Bills
                        </button>
                    </div>

                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by bill#, guest, room..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button className={styles.primaryBtn} onClick={openCreateModal}>
                        <Plus size={18} />
                        New Bill
                    </button>
                </div>

                {/* Bills Table */}
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <p>Loading bills...</p>
                    </div>
                ) : filteredBills.length === 0 ? (
                    <div className={styles.emptyState}>
                        <UtensilsCrossed size={48} />
                        <p>{searchQuery ? 'No bills match your search' : 'No restaurant bills yet'}</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Date</th>
                                    <th>Guest</th>
                                    <th>Room</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map((bill) => (
                                    <tr key={bill.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FileText size={16} style={{ color: '#FF6B35' }} />
                                                <span className={styles.mono}>{bill.bill_number}</span>
                                            </div>
                                        </td>
                                        <td>{new Date(bill.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                        <td style={{ fontWeight: 600 }}>{bill.guest_name}</td>
                                        <td>
                                            {bill.room_number ? (
                                                <span className={styles.badge}>{bill.room_number}</span>
                                            ) : '—'}
                                        </td>
                                        <td>{bill.items.length} items</td>
                                        <td className={styles.amount}>₹{bill.total_amount.toLocaleString()}</td>
                                        <td>{bill.payment_mode}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[bill.status.toLowerCase()]}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="View"
                                                    aria-label={`View bill ${bill.bill_number}`}
                                                    onClick={() => setViewingBill(bill)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Edit"
                                                    aria-label={`Edit bill ${bill.bill_number}`}
                                                    onClick={() => openEditModal(bill)}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Print"
                                                    aria-label={`Print bill ${bill.bill_number}`}
                                                    onClick={() => handlePrintBill(bill)}
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    title="Delete"
                                                    aria-label={`Delete bill ${bill.bill_number}`}
                                                    onClick={() => setDeletingBill(bill)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>
                                <UtensilsCrossed size={20} style={{ color: '#FF6B35' }} />
                                {editingBill ? `Edit Bill #${editingBill.bill_number}` : 'Create New Restaurant Bill'}
                            </h3>
                            <button onClick={closeModal} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* Guest & Room */}
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Guest Name *</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Enter guest name"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Room Number</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. 101 (optional)"
                                        value={roomNumber}
                                        onChange={(e) => setRoomNumber(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Items */}
                            <div className={styles.itemsSection}>
                                <div className={styles.itemsSectionHeader}>
                                    <label>Order Items *</label>
                                    <button className={styles.addItemBtn} onClick={addItem}>
                                        <Plus size={16} />
                                        Add Item
                                    </button>
                                </div>

                                {items.map((item, index) => (
                                    <div key={index} className={styles.itemRow}>
                                        <input
                                            type="text"
                                            className={styles.itemInput}
                                            placeholder="Item name"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            className={styles.itemInput}
                                            placeholder="Qty"
                                            min={1}
                                            value={item.qty}
                                            onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            className={styles.itemInput}
                                            placeholder="Price ₹"
                                            min={0}
                                            value={item.price || ''}
                                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                                        />
                                        <button
                                            className={styles.removeItemBtn}
                                            onClick={() => removeItem(index)}
                                            disabled={items.length <= 1}
                                            title="Remove item"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className={styles.totalsSection}>
                                <div className={styles.totalRow}>
                                    <span>Subtotal</span>
                                    <span>₹{formSubtotal.toLocaleString()}</span>
                                </div>
                                <div className={styles.totalRow}>
                                    <span>GST ({GST_RATE}%)</span>
                                    <span>₹{formTax.toLocaleString()}</span>
                                </div>
                                <div className={styles.totalRow}>
                                    <span>Total Amount</span>
                                    <span>₹{formTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment & Status */}
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Payment Mode</label>
                                    <select
                                        className={styles.input}
                                        value={paymentMode}
                                        onChange={(e) => setPaymentMode(e.target.value)}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Status</label>
                                    <select
                                        className={styles.input}
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Partial">Partial</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className={styles.formGroup}>
                                <label>Notes</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Optional notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button
                                className={styles.submitBtn}
                                onClick={handleSaveBill}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : editingBill ? 'Update Bill' : 'Create Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Bill Modal */}
            {viewingBill && (
                <div className={styles.modalOverlay} onClick={() => setViewingBill(null)}>
                    <div className={styles.viewBillModal} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setViewingBill(null)} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                        <div ref={billRef}>
                            <RestaurantBillTemplate bill={viewingBill} />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingBill && (
                <div className={styles.modalOverlay} onClick={() => setDeletingBill(null)}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <h3>🗑️ Delete Bill?</h3>
                        <p>
                            Are you sure you want to delete bill <strong>{deletingBill.bill_number}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className={styles.confirmActions}>
                            <button className={styles.cancelBtn} onClick={() => setDeletingBill(null)}>
                                Cancel
                            </button>
                            <button className={styles.confirmDeleteBtn} onClick={handleDeleteBill}>
                                Delete Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
