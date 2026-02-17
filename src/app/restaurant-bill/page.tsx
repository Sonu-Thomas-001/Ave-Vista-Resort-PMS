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
    const [menuItems, setMenuItems] = useState<{ name: string; price: number }[]>([]);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [status, setStatus] = useState('Paid');
    const [notes, setNotes] = useState('');

    const billRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchBills();
        fetchMenuItems();
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

    const fetchMenuItems = async () => {
        const { data, error } = await supabase
            .from('restaurant_menu_items')
            .select('name, price')
            .eq('is_available', true);

        if (!error && data) {
            setMenuItems(data);
        }
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
            // Auto-fill price from menu if matches
            const menuItem = menuItems.find(m => m.name.toLowerCase() === (value as string).toLowerCase());
            if (menuItem) {
                updated[index].price = menuItem.price;
            }
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

    const handlePrintBill = (bill: RestaurantBill) => {
        const billDate = new Date(bill.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
        const billTime = new Date(bill.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit',
        });

        const halfTax = (bill.tax_amount / 2).toFixed(2);

        const itemsHtml = bill.items.map((item, i) => `
            <div style="display:grid;grid-template-columns:50px 2fr 80px 1fr 1fr;padding:14px 20px;font-size:14px;border-bottom:1px solid #f3f4f6">
                <div style="color:#9ca3af;font-weight:600">${String(i + 1).padStart(2, '0')}</div>
                <div style="color:#1f2937;font-weight:500">${item.name}</div>
                <div style="text-align:center;color:#4b5563;font-weight:600">${item.qty}</div>
                <div style="text-align:right;color:#4b5563;font-family:'Courier New',monospace">₹${item.price.toLocaleString('en-IN')}</div>
                <div style="text-align:right;font-weight:600;color:#1f2937;font-family:'Courier New',monospace">₹${(item.qty * item.price).toLocaleString('en-IN')}</div>
            </div>
        `).join('');

        const statusBg = bill.status === 'Paid' ? '#DEF7EC' : bill.status === 'Partial' ? '#FEF3C7' : '#FDE8E8';
        const statusColor = bill.status === 'Paid' ? '#03543F' : bill.status === 'Partial' ? '#92400E' : '#9B1C1C';

        const printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Restaurant Bill - ${bill.bill_number}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', -apple-system, sans-serif; color: #1f2937; padding: 48px; max-width: 800px; margin: 0 auto; }
                    @media print { body { padding: 10mm; zoom: 0.92; } }
                </style>
            </head>
            <body>
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:32px;margin-bottom:32px;border-bottom:1px solid #e5e7eb;position:relative">
                    <div style="flex:1">
                        <h1 style="font-size:26px;font-weight:700;color:#00a0d2;margin:0 0 6px;letter-spacing:-0.5px">Ave Vista Resorts & Hotels</h1>
                        <p style="font-size:13px;color:#6b7280;margin:0 0 12px">Balapuram, Vayattuparamba, Kannur, Kerala – 670582</p>
                        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:12px;color:#4b5563">
                            <span>📞 +91 90615 54545</span>
                            <span style="color:#d1d5db">|</span>
                            <span>✉ avevistaresort@gmail.com</span>
                            <span style="color:#d1d5db">|</span>
                            <span>🌐 www.avevistaresorts.com</span>
                        </div>
                    </div>
                    <div style="text-align:right">
                        <div style="display:inline-block;padding:8px 22px;background:linear-gradient(135deg,#00a0d2,#0088b8);color:white;border-radius:24px;font-size:13px;font-weight:600;letter-spacing:0.5px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,160,210,0.25)">🍽️ RESTAURANT BILL</div>
                        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
                            <div>
                                <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Bill No.</div>
                                <div style="font-size:14px;font-weight:600;color:#1f2937">${bill.bill_number}</div>
                            </div>
                            <div>
                                <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Date</div>
                                <div style="font-size:14px;font-weight:600;color:#1f2937">${billDate}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Cards -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px">
                    <!-- Bill Details -->
                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e5e7eb">
                            <span style="color:#00a0d2;font-size:16px">📋</span>
                            <h3 style="margin:0;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.5px">Bill Details</h3>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:10px">
                            <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#6b7280">Bill Number</span><span style="font-weight:600">${bill.bill_number}</span></div>
                            <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#6b7280">Date</span><span style="font-weight:600">${billDate}</span></div>
                            <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#6b7280">Time</span><span style="font-weight:600">${billTime}</span></div>
                            <div style="display:flex;justify-content:space-between;font-size:13px;align-items:center"><span style="color:#6b7280">Payment</span><span style="padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600;background:#E6F7FB;color:#0088B8">${bill.payment_mode}</span></div>
                            <div style="display:flex;justify-content:space-between;font-size:13px;align-items:center"><span style="color:#6b7280">Status</span><span style="padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${statusBg};color:${statusColor}">${bill.status}</span></div>
                        </div>
                    </div>
                    <!-- Guest Details -->
                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e5e7eb">
                            <span style="color:#00a0d2;font-size:16px">👤</span>
                            <h3 style="margin:0;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.5px">Guest Details</h3>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:10px">
                            <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#6b7280">Guest Name</span><span style="font-weight:600">${bill.guest_name}</span></div>
                            ${bill.room_number ? `<div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#6b7280">Room</span><span style="font-weight:600">${bill.room_number}</span></div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
                <div style="margin-bottom:32px">
                    <h3 style="font-size:15px;font-weight:600;color:#1f2937;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #00a0d2">🍽️ Order Items</h3>
                    <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
                        <div style="display:grid;grid-template-columns:50px 2fr 80px 1fr 1fr;background:#f9fafb;padding:14px 20px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">
                            <div>#</div>
                            <div>Description</div>
                            <div style="text-align:center">Qty</div>
                            <div style="text-align:right">Rate</div>
                            <div style="text-align:right">Amount</div>
                        </div>
                        <div>${itemsHtml}</div>
                    </div>
                </div>

                <!-- Summary Card -->
                <div style="width:50%;margin-left:auto;margin-bottom:32px;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px">
                    <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;color:#4b5563;border-bottom:1px solid #e5e7eb">
                        <span>Subtotal</span><span style="font-family:'Courier New',monospace;font-weight:600;color:#1f2937">₹${bill.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;color:#4b5563;border-bottom:1px solid #e5e7eb">
                        <span>CGST (2.5%)</span><span style="font-family:'Courier New',monospace;font-weight:600;color:#1f2937">₹${halfTax}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;color:#4b5563;border-bottom:2px solid #d1d5db">
                        <span>SGST (2.5%)</span><span style="font-family:'Courier New',monospace;font-weight:600;color:#1f2937">₹${halfTax}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:16px 0 0;font-size:20px;font-weight:700;color:#00a0d2;margin-top:8px">
                        <span>Grand Total</span><span style="font-family:'Courier New',monospace">₹${bill.total_amount.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                ${bill.notes ? `<div style="margin-bottom:24px;padding:16px 20px;background:#e6f7fb;border-left:4px solid #00a0d2;border-radius:0 8px 8px 0;font-size:13px;color:#006b8f"><strong style="color:#005577">Note:</strong> ${bill.notes}</div>` : ''}

                <!-- Footer -->
                <div style="height:3px;background:linear-gradient(90deg,transparent,#00a0d2,transparent);border-radius:2px;margin:32px 0 0"></div>
                <div style="padding:32px 20px;text-align:center;background:#fafbfc;border-radius:12px;margin-top:24px">
                    <h2 style="margin:0 0 8px;font-size:17px;font-weight:600;color:#1f2937;letter-spacing:-0.2px">Thank you for dining with us!</h2>
                    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;font-style:italic">We hope you enjoyed your meal at Ave Vista</p>
                    <div style="display:flex;justify-content:center;gap:20px;font-size:12px;color:#9ca3af;margin-bottom:12px">
                        <span>📞 +91 90615 54545</span>
                        <span>✉ avevistaresort@gmail.com</span>
                        <span>🌐 www.avevistaresorts.com</span>
                    </div>
                    <p style="font-size:11px;color:#d1d5db;margin:0">This is a computer-generated bill and does not require a signature.</p>
                </div>
            </body>
            </html>
        `;

        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(printHtml);
            iframeDoc.close();

            // Wait for content to load then print
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                // Remove iframe after printing (give it a moment to initialize the print dialog)
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        }
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
                        <button className={`${styles.tabBtn} ${styles.active} `}>
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
                                            <span className={`${styles.status} ${styles[bill.status.toLowerCase()]} `}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="View"
                                                    aria-label={`View bill ${bill.bill_number} `}
                                                    onClick={() => setViewingBill(bill)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Edit"
                                                    aria-label={`Edit bill ${bill.bill_number} `}
                                                    onClick={() => openEditModal(bill)}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Print"
                                                    aria-label={`Print bill ${bill.bill_number} `}
                                                    onClick={() => handlePrintBill(bill)}
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    title="Delete"
                                                    aria-label={`Delete bill ${bill.bill_number} `}
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
                                {editingBill ? `Edit Bill #${editingBill.bill_number} ` : 'Create New Restaurant Bill'}
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
                                            list="menu-items"
                                        />
                                        <datalist id="menu-items">
                                            {menuItems.map((menuItem, i) => (
                                                <option key={i} value={menuItem.name} />
                                            ))}
                                        </datalist>
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
