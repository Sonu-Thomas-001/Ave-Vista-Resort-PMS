'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '@/components/Header';
import {
    Plus, X, Eye, Pencil, Trash2, Printer, Search,
    UtensilsCrossed, FileText, CheckCircle2,
    DollarSign, Clock, Download,
    ShoppingBag, Bed, Coffee
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

interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string | null;
    is_available: boolean;
}

interface OccupiedRoom {
    room_number: string;
    guest_name: string;
}

const emptyItem: BillItem = { name: '', qty: 1, price: 0 };
const MENU_CATEGORIES = ['All', 'Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Beverages', 'Desserts', 'Snacks'];

export default function RestaurantBillPage() {
    const [bills, setBills] = useState<RestaurantBill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'Paid' | 'Pending' | 'Partial'>('ALL');
    const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
    const [datePreset, setDatePreset] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBill, setEditingBill] = useState<RestaurantBill | null>(null);
    const [viewingBill, setViewingBill] = useState<RestaurantBill | null>(null);
    const [viewFormat, setViewFormat] = useState<'a4' | 'thermal'>('a4');
    const [deletingBill, setDeletingBill] = useState<RestaurantBill | null>(null);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Form & POS Workspace State
    const [guestName, setGuestName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [items, setItems] = useState<BillItem[]>([{ ...emptyItem }]);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [status, setStatus] = useState('Paid');
    const [notes, setNotes] = useState('');

    // Menu Catalog & In-House Rooms
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [catalogCategory, setCatalogCategory] = useState('All');
    const [catalogSearch, setCatalogSearch] = useState('');
    const [occupiedRooms, setOccupiedRooms] = useState<OccupiedRoom[]>([]);
    const [customItemName, setCustomItemName] = useState('');
    const [customItemPrice, setCustomItemPrice] = useState('');
    const [isCustomRoom, setIsCustomRoom] = useState(false);
    const [showCustomItemRow, setShowCustomItemRow] = useState(false);

    const billRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchBills();
        fetchMenuItems();
        fetchOccupiedRooms();
        const interval = setInterval(fetchBills, 20000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3200);
    };

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
            .select('*')
            .eq('is_available', true)
            .order('name', { ascending: true });

        if (!error && data) {
            setMenuItems(data);
        }
    };

    const fetchOccupiedRooms = async () => {
        try {
            // Fetch rooms and active bookings
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select(`
                    id,
                    room_number,
                    guest_name,
                    status
                `)
                .or('status.eq.checked_in,status.eq.confirmed')
                .limit(40);

            if (bookingsData && bookingsData.length > 0) {
                const mapped = bookingsData
                    .filter(b => b.room_number && b.guest_name)
                    .map(b => ({
                        room_number: String(b.room_number),
                        guest_name: b.guest_name
                    }));
                setOccupiedRooms(mapped);
            } else {
                // Fallback to rooms table
                const { data: rooms } = await supabase.from('rooms').select('room_number').order('room_number');
                if (rooms) {
                    setOccupiedRooms(rooms.map(r => ({ room_number: String(r.room_number), guest_name: '' })));
                }
            }
        } catch (e) {
            console.error('Error fetching occupied rooms:', e);
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
        const tax_amount = 0;
        const total_amount = subtotal;
        return { subtotal, tax_amount, total_amount };
    };

    const resetForm = () => {
        setGuestName('');
        setRoomNumber('');
        setItems([{ ...emptyItem }]);
        setPaymentMode('Cash');
        setStatus('Paid');
        setNotes('');
        setCatalogCategory('All');
        setCatalogSearch('');
        setCustomItemName('');
        setCustomItemPrice('');
        setIsCustomRoom(false);
        setShowCustomItemRow(false);
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
        if (bill.room_number) {
            const isKnown = occupiedRooms.some(r => r.room_number === bill.room_number);
            setIsCustomRoom(!isKnown);
        } else {
            setIsCustomRoom(false);
        }
        setShowCustomItemRow(false);
        setEditingBill(bill);
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingBill(null);
        resetForm();
    };

    // POS Cart Operations
    const addItemFromCatalog = (menuItem: MenuItem) => {
        setItems(prev => {
            const clean = prev.filter(i => i.name.trim() !== '');
            const existingIdx = clean.findIndex(i => i.name.toLowerCase() === menuItem.name.toLowerCase());
            if (existingIdx >= 0) {
                const updated = [...clean];
                updated[existingIdx].qty += 1;
                return updated;
            } else {
                return [...clean, { name: menuItem.name, qty: 1, price: menuItem.price }];
            }
        });
    };

    const addCustomItem = () => {
        if (!customItemName.trim() || !customItemPrice || Number(customItemPrice) <= 0) {
            alert('Please enter a valid item name and price');
            return;
        }
        setItems(prev => {
            const clean = prev.filter(i => i.name.trim() !== '');
            return [...clean, { name: customItemName.trim(), qty: 1, price: Number(customItemPrice) }];
        });
        setCustomItemName('');
        setCustomItemPrice('');
    };

    const incrementItemQty = (index: number) => {
        setItems(prev => {
            const updated = [...prev];
            updated[index].qty += 1;
            return updated;
        });
    };

    const decrementItemQty = (index: number) => {
        setItems(prev => {
            const updated = [...prev];
            if (updated[index].qty > 1) {
                updated[index].qty -= 1;
                return updated;
            } else {
                return prev.filter((_, i) => i !== index);
            }
        });
    };

    const removeCartItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleRoomSelect = (selectedRoom: string) => {
        setRoomNumber(selectedRoom);
        if (selectedRoom) {
            const match = occupiedRooms.find(r => r.room_number === selectedRoom);
            if (match && match.guest_name && !guestName) {
                setGuestName(match.guest_name);
            }
        }
    };

    const handleSaveBill = async (andPrint = false) => {
        if (!guestName.trim()) {
            alert('Please enter guest name');
            return;
        }
        const validItems = items.filter(i => i.name.trim() && i.price > 0);
        if (validItems.length === 0) {
            alert('Please add at least one item to the order');
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
            const { error } = await supabase
                .from('restaurant_bills')
                .update(billData)
                .eq('id', editingBill.id);

            if (error) {
                console.error('Error updating bill:', error);
                alert('Failed to update bill');
            } else {
                showToast(`Bill #${editingBill.bill_number} updated successfully!`);
                const savedObj = { ...editingBill, ...billData };
                closeModal();
                fetchBills();
                if (andPrint) {
                    handlePrintBill(savedObj);
                }
            }
        } else {
            const billNum = generateBillNumber();
            const { data, error } = await supabase
                .from('restaurant_bills')
                .insert({
                    ...billData,
                    bill_number: billNum,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating bill:', error);
                alert('Failed to create bill');
            } else {
                showToast(`New Bill #${billNum} created!`);
                closeModal();
                fetchBills();
                if (andPrint && data) {
                    handlePrintBill(data);
                }
            }
        }
        setSaving(false);
    };

    const handleMarkAsPaid = async (bill: RestaurantBill) => {
        const { error } = await supabase
            .from('restaurant_bills')
            .update({ status: 'Paid' })
            .eq('id', bill.id);

        if (error) {
            console.error('Error updating status:', error);
            alert('Failed to mark as paid');
        } else {
            setBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: 'Paid' } : b));
            showToast(`Bill #${bill.bill_number} settled as Paid!`);
        }
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
            setBills(prev => prev.filter(b => b.id !== deletingBill.id));
            showToast(`Bill #${deletingBill.bill_number} deleted.`);
            setDeletingBill(null);
        }
    };

    // Print Generator
    const handlePrintBill = (bill: RestaurantBill, format: 'a4' | 'thermal' = viewFormat) => {
        const billDate = new Date(bill.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
        const billTime = new Date(bill.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit',
        });

        let printHtml = '';

        if (format === 'thermal') {
            // 80mm compact slip
            const itemsRows = bill.items.map(item => `
                <div style="display:grid;grid-template-columns:1.8fr 35px 55px 60px;font-size:11px;margin-bottom:4px">
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name}</span>
                    <span style="text-align:center">${item.qty}</span>
                    <span style="text-align:right">₹${item.price}</span>
                    <span style="text-align:right;font-weight:bold">₹${item.qty * item.price}</span>
                </div>
            `).join('');

            printHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Thermal Receipt - ${bill.bill_number}</title>
                    <style>
                        @page { size: 80mm auto; margin: 0; }
                        * { margin:0; padding:0; box-sizing:border-box; }
                        body { font-family: 'Courier New', monospace; font-size:11px; color:#000; width:76mm; padding:6mm; margin:0 auto; }
                        .center { text-align:center; }
                        .dashed { border-top:1px dashed #000; margin:8px 0; }
                        .solid { border-top:1px solid #000; margin:8px 0; }
                        .meta-row { display:flex; justify-content:space-between; margin-bottom:3px; }
                        @media print { body { width:100%; padding:2mm; } }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <h2 style="font-size:16px;margin-bottom:2px">AVE VISTA RESORT</h2>
                        <p style="font-size:10px">Dining & Restaurant POS</p>
                        <p style="font-size:9px">Kannur, Kerala | +91 90615 54545</p>
                        <div class="dashed"></div>
                        <p style="font-weight:bold;letter-spacing:1px">** DINING RECEIPT **</p>
                        <div class="dashed"></div>
                    </div>
                    <div class="meta-row"><span>Bill No:</span><strong>${bill.bill_number}</strong></div>
                    <div class="meta-row"><span>Date:</span><span>${billDate} ${billTime}</span></div>
                    <div class="meta-row"><span>Guest:</span><span>${bill.guest_name}</span></div>
                    ${bill.room_number ? `<div class="meta-row"><span>Room:</span><strong>${bill.room_number}</strong></div>` : ''}
                    <div class="meta-row"><span>Pay / Status:</span><span>${bill.payment_mode} (${bill.status})</span></div>
                    <div class="solid"></div>
                    <div style="display:grid;grid-template-columns:1.8fr 35px 55px 60px;font-weight:bold;font-size:10px;margin-bottom:5px">
                        <span>Item</span><span style="text-align:center">Qty</span><span style="text-align:right">Rate</span><span style="text-align:right">Total</span>
                    </div>
                    ${itemsRows}
                    <div class="dashed"></div>
                    <div class="meta-row"><span>Subtotal:</span><span>₹${bill.subtotal.toLocaleString('en-IN')}</span></div>
                    <div class="meta-row" style="font-size:13px;font-weight:bold;padding-top:4px;border-top:1px solid #000">
                        <span>TOTAL:</span><span>₹${bill.total_amount.toLocaleString('en-IN')}</span>
                    </div>
                    ${bill.notes ? `<div style="margin-top:6px;font-size:9px">Note: ${bill.notes}</div>` : ''}
                    <div class="dashed"></div>
                    <div class="center" style="margin-top:10px;font-size:10px">
                        <p>Thank You For Dining With Us!</p>
                        <p style="font-size:9px">www.avevistaresorts.com</p>
                    </div>
                </body>
                </html>
            `;
        } else {
            // A4 Tax Invoice
            const itemsHtml = bill.items.map((item, i) => `
                <div style="display:grid;grid-template-columns:40px 2fr 70px 90px 100px;padding:12px 16px;font-size:13px;border-bottom:1px solid #f3f4f6">
                    <div style="color:#9ca3af;font-weight:600">${String(i + 1).padStart(2, '0')}</div>
                    <div style="color:#1f2937;font-weight:600">${item.name}</div>
                    <div style="text-align:center;color:#4b5563;font-weight:700">${item.qty}</div>
                    <div style="text-align:right;color:#4b5563;font-family:'Courier New',monospace">₹${item.price.toLocaleString('en-IN')}</div>
                    <div style="text-align:right;font-weight:700;color:#1f2937;font-family:'Courier New',monospace">₹${(item.qty * item.price).toLocaleString('en-IN')}</div>
                </div>
            `).join('');

            const statusBg = bill.status === 'Paid' ? '#DEF7EC' : bill.status === 'Partial' ? '#FEF3C7' : '#FDE8E8';
            const statusColor = bill.status === 'Paid' ? '#03543F' : bill.status === 'Partial' ? '#92400E' : '#9B1C1C';

            printHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Restaurant Invoice - ${bill.bill_number}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Inter', -apple-system, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
                        @media print { body { padding: 10mm; zoom: 0.94; } }
                    </style>
                </head>
                <body>
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;margin-bottom:24px;border-bottom:1px solid #e5e7eb">
                        <div>
                            <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 4px">Ave Vista <span style="color:#FF6B35">Resorts & Hotels</span></h1>
                            <p style="font-size:12px;color:#64748b;margin:0 0 8px">Balapuram, Vayattuparamba, Kannur, Kerala – 670582</p>
                            <p style="font-size:11px;color:#475569">📞 +91 90615 54545 &nbsp;|&nbsp; ✉ avevistaresort@gmail.com &nbsp;|&nbsp; 🌐 www.avevistaresorts.com</p>
                        </div>
                        <div style="text-align:right">
                            <div style="display:inline-block;padding:6px 18px;background:linear-gradient(135deg,#FF6B35,#E65100);color:white;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;margin-bottom:10px">RESTAURANT BILL</div>
                            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase">Bill Number</div>
                            <div style="font-size:13px;font-weight:700;font-family:'Courier New',monospace">${bill.bill_number}</div>
                            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;margin-top:4px">Date & Time</div>
                            <div style="font-size:12px;font-weight:600">${billDate}, ${billTime}</div>
                        </div>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
                            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:10px">Bill Information</div>
                            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:#64748b">Bill No:</span><strong>${bill.bill_number}</strong></div>
                            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:#64748b">Payment:</span><span>${bill.payment_mode}</span></div>
                            <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:#64748b">Status:</span><span style="padding:2px 8px;border-radius:12px;background:${statusBg};color:${statusColor};font-weight:700;font-size:11px">${bill.status}</span></div>
                        </div>
                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
                            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:10px">Guest Information</div>
                            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:#64748b">Guest Name:</span><strong>${bill.guest_name}</strong></div>
                            <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:#64748b">Location:</span><strong>${bill.room_number ? `Room ${bill.room_number} (Room Service)` : 'Restaurant Dine-In'}</strong></div>
                        </div>
                    </div>

                    <div style="margin-bottom:28px">
                        <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid #FF6B35;padding-bottom:6px">Order Items</div>
                        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
                            <div style="display:grid;grid-template-columns:40px 2fr 70px 90px 100px;background:#f8fafc;padding:10px 16px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0">
                                <div>#</div><div>Description</div><div style="text-align:center">Qty</div><div style="text-align:right">Rate</div><div style="text-align:right">Amount</div>
                            </div>
                            ${itemsHtml}
                        </div>
                    </div>

                    <div style="width:50%;margin-left:auto;margin-bottom:28px;padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
                        <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid #e2e8f0"><span>Subtotal</span><strong style="font-family:'Courier New',monospace">₹${bill.subtotal.toLocaleString('en-IN')}</strong></div>
                        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:#E65100;padding-top:10px"><span>Total Amount</span><span style="font-family:'Courier New',monospace">₹${bill.total_amount.toLocaleString('en-IN')}</span></div>
                    </div>

                    ${bill.notes ? `<div style="margin-bottom:20px;padding:12px 16px;background:#fff7ed;border-left:4px solid #FF6B35;font-size:12px;color:#9a3412"><strong>Note:</strong> ${bill.notes}</div>` : ''}

                    <div style="text-align:center;padding:20px;background:#f8fafc;border-radius:8px;margin-top:20px">
                        <h3 style="font-size:15px;margin:0 0 4px">Thank you for dining with us!</h3>
                        <p style="font-size:11px;color:#64748b;margin:0">We hope you enjoyed your culinary experience at Ave Vista</p>
                    </div>
                </body>
                </html>
            `;
        }

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

            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 400);
        }
    };

    // Export to CSV
    const exportToCsv = () => {
        if (filteredBills.length === 0) {
            alert('No bills to export');
            return;
        }
        const headers = ['Bill Number', 'Date', 'Guest Name', 'Room', 'Items Count', 'Payment Mode', 'Status', 'Total Amount'];
        const csvRows = [
            headers.join(','),
            ...filteredBills.map(b => [
                `"${b.bill_number}"`,
                `"${new Date(b.created_at).toLocaleDateString('en-IN')}"`,
                `"${b.guest_name.replace(/"/g, '""')}"`,
                `"${b.room_number || 'Dine-In'}"`,
                `"${b.items.reduce((s, i) => s + i.qty, 0)}"`,
                `"${b.payment_mode}"`,
                `"${b.status}"`,
                `"${b.total_amount}"`
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `AveVista_Restaurant_Bills_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Dining ledger exported to CSV!');
    };

    // Filter Logic
    const todayStr = new Date().toISOString().split('T')[0];

    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            // Search Query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesNum = bill.bill_number.toLowerCase().includes(q);
                const matchesGuest = bill.guest_name.toLowerCase().includes(q);
                const matchesRoom = bill.room_number ? bill.room_number.toLowerCase().includes(q) : false;
                const matchesItems = bill.items.some(i => i.name.toLowerCase().includes(q));
                if (!matchesNum && !matchesGuest && !matchesRoom && !matchesItems) return false;
            }

            // Status Filter
            if (statusFilter !== 'ALL' && bill.status !== statusFilter) {
                return false;
            }

            // Payment Filter
            if (paymentFilter !== 'ALL' && bill.payment_mode !== paymentFilter) {
                return false;
            }

            // Date Preset
            if (datePreset !== 'ALL') {
                const billDate = bill.created_at.split('T')[0];
                if (datePreset === 'TODAY') {
                    if (billDate !== todayStr) return false;
                } else if (datePreset === 'YESTERDAY') {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yDateStr = yesterday.toISOString().split('T')[0];
                    if (billDate !== yDateStr) return false;
                } else if (datePreset === 'WEEK') {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    if (new Date(bill.created_at) < weekAgo) return false;
                } else if (datePreset === 'MONTH') {
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    if (new Date(bill.created_at) < monthAgo) return false;
                }
            }

            return true;
        });
    }, [bills, searchQuery, statusFilter, paymentFilter, datePreset, todayStr]);

    // KPI Metrics
    const metrics = useMemo(() => {
        const todayBills = bills.filter(b => b.created_at.startsWith(todayStr));
        const todayRevenue = todayBills.reduce((sum, b) => sum + (b.status === 'Paid' ? b.total_amount : b.status === 'Partial' ? (b.total_amount * 0.5) : 0), 0);
        const avgTicket = todayBills.length > 0 ? Math.round(todayRevenue / todayBills.length) : 0;
        const pendingBills = bills.filter(b => b.status !== 'Paid');
        const pendingAmount = pendingBills.reduce((sum, b) => sum + b.total_amount, 0);

        // Month-to-date
        const curYearMonth = todayStr.slice(0, 7);
        const mtdBills = bills.filter(b => b.created_at.startsWith(curYearMonth));
        const mtdRevenue = mtdBills.reduce((sum, b) => sum + (b.status === 'Paid' ? b.total_amount : 0), 0);

        return {
            todayCount: todayBills.length,
            todayRevenue,
            avgTicket,
            pendingCount: pendingBills.length,
            pendingAmount,
            mtdRevenue,
            mtdCount: mtdBills.length
        };
    }, [bills, todayStr]);

    // Menu Catalog Filter
    const filteredCatalog = useMemo(() => {
        return menuItems.filter(item => {
            if (catalogCategory !== 'All' && item.category !== catalogCategory) {
                return false;
            }
            if (catalogSearch.trim()) {
                const q = catalogSearch.toLowerCase();
                return item.name.toLowerCase().includes(q) || (item.category && item.category.toLowerCase().includes(q));
            }
            return true;
        });
    }, [menuItems, catalogCategory, catalogSearch]);

    // Form Live Cart Totals
    const { subtotal: formSubtotal, total_amount: formTotal } = calculateTotals(
        items.filter(i => i.name.trim() && i.price > 0)
    );

    return (
        <>
            <Header title="Restaurant Billing & POS" />

            <div className={styles.container}>
                {/* ─── Hero Banner ─── */}
                <div className={styles.heroBanner}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBadge}>
                            <span className={styles.pulseDot} />
                            Dining & POS Terminal
                        </div>
                        <h1 className={styles.heroTitle}>Restaurant Billing Suite</h1>
                        <p className={styles.heroSubtitle}>
                            <span>Ave Vista Luxury Dining</span>
                            <span>•</span>
                            <span>{bills.length} Total Bills Generated</span>
                            <span>•</span>
                            <span>Real-time Guest Sync</span>
                        </p>
                    </div>

                    <div className={styles.heroActions}>
                        <button className={styles.exportBtn} onClick={exportToCsv}>
                            <Download size={16} />
                            Export CSV
                        </button>
                        <button className={styles.primaryPosBtn} onClick={openCreateModal}>
                            <Plus size={18} />
                            + New Restaurant Bill
                        </button>
                    </div>
                </div>

                {/* ─── KPI Intelligence Cards ─── */}
                <div className={styles.kpiGrid}>
                    {/* Today's Revenue */}
                    <div className={`${styles.kpiCard} ${styles.kpiCardPrimary}`}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>Today&apos;s Revenue</span>
                            <div className={styles.kpiIconBox}>
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValue}>₹{metrics.todayRevenue.toLocaleString('en-IN')}</div>
                        <div className={styles.kpiMeta}>
                            <span className={styles.kpiHighlight}>{metrics.todayCount} orders</span> recorded today
                        </div>
                    </div>

                    {/* Today's Orders & Average Cover */}
                    <div className={`${styles.kpiCard} ${styles.kpiCardSuccess}`}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>Covers & Orders</span>
                            <div className={styles.kpiIconBox}>
                                <UtensilsCrossed size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValue}>{metrics.todayCount}</div>
                        <div className={styles.kpiMeta}>
                            Avg ticket: <span className={styles.kpiHighlight}>₹{metrics.avgTicket.toLocaleString('en-IN')}</span> / bill
                        </div>
                    </div>

                    {/* Pending Dues / Room Charges */}
                    <div
                        className={`${styles.kpiCard} ${styles.kpiCardWarning}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'ALL' : 'Pending')}
                        title="Click to toggle filter pending bills"
                    >
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>Pending Settlements</span>
                            <div className={styles.kpiIconBox}>
                                <Clock size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValue}>₹{metrics.pendingAmount.toLocaleString('en-IN')}</div>
                        <div className={styles.kpiMeta}>
                            <span className={styles.kpiHighlight}>{metrics.pendingCount} unpaid</span> / room charges
                        </div>
                    </div>

                    {/* Monthly Volume */}
                    <div className={`${styles.kpiCard} ${styles.kpiCardInfo}`}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>This Month</span>
                            <div className={styles.kpiIconBox}>
                                <Coffee size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValue}>₹{metrics.mtdRevenue.toLocaleString('en-IN')}</div>
                        <div className={styles.kpiMeta}>
                            <span className={styles.kpiHighlight}>{metrics.mtdCount} dining bills</span> this month
                        </div>
                    </div>
                </div>

                {/* ─── Controls & Filter Toolbar ─── */}
                <div className={styles.toolbarCard}>
                    <div className={styles.toolbarRow}>
                        {/* Search */}
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search by Bill #, Guest, Room, Item..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className={styles.clearSearchBtn}
                                    onClick={() => setSearchQuery('')}
                                    title="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Status Pills */}
                        <div className={styles.pillGroup}>
                            <button
                                className={`${styles.pillBtn} ${statusFilter === 'ALL' ? styles.pillBtnActive : ''}`}
                                onClick={() => setStatusFilter('ALL')}
                            >
                                All Statuses
                                <span className={styles.pillBadge}>{bills.length}</span>
                            </button>
                            <button
                                className={`${styles.pillBtn} ${statusFilter === 'Paid' ? styles.pillBtnActive : ''}`}
                                onClick={() => setStatusFilter('Paid')}
                            >
                                Paid
                                <span className={styles.pillBadge}>{bills.filter(b => b.status === 'Paid').length}</span>
                            </button>
                            <button
                                className={`${styles.pillBtn} ${statusFilter === 'Pending' ? styles.pillBtnActive : ''}`}
                                onClick={() => setStatusFilter('Pending')}
                            >
                                Pending
                                <span className={styles.pillBadge}>{bills.filter(b => b.status === 'Pending').length}</span>
                            </button>
                            <button
                                className={`${styles.pillBtn} ${statusFilter === 'Partial' ? styles.pillBtnActive : ''}`}
                                onClick={() => setStatusFilter('Partial')}
                            >
                                Partial
                                <span className={styles.pillBadge}>{bills.filter(b => b.status === 'Partial').length}</span>
                            </button>
                        </div>
                    </div>

                    {/* Secondary Filters Row */}
                    <div className={styles.filterSubRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {/* Date Presets */}
                            <div className={styles.filterLabelGroup}>
                                <span>Period:</span>
                                <div className={styles.pillGroup}>
                                    {(['TODAY', 'YESTERDAY', 'WEEK', 'MONTH', 'ALL'] as const).map(preset => (
                                        <button
                                            key={preset}
                                            className={`${styles.pillBtn} ${datePreset === preset ? styles.pillBtnActive : ''}`}
                                            onClick={() => setDatePreset(preset)}
                                        >
                                            {preset === 'TODAY' ? 'Today' : preset === 'YESTERDAY' ? 'Yesterday' : preset === 'WEEK' ? '7 Days' : preset === 'MONTH' ? '30 Days' : 'All Time'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Mode Selector */}
                            <div className={styles.filterLabelGroup}>
                                <span>Payment:</span>
                                <select
                                    className={styles.filterSelect}
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                >
                                    <option value="ALL">All Methods</option>
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Card</option>
                                    <option value="Room Charge">Bill to Room</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.resultsCount}>
                            Showing <strong>{filteredBills.length}</strong> of {bills.length} bills
                        </div>
                    </div>
                </div>

                {/* ─── Bills Ledger Table ─── */}
                <div className={styles.tableCard}>
                    {loading ? (
                        <div className={styles.loadingBox}>
                            <div className={styles.spinner} />
                            <p>Loading restaurant bills ledger...</p>
                        </div>
                    ) : filteredBills.length === 0 ? (
                        <div className={styles.emptyState}>
                            <UtensilsCrossed size={48} />
                            <h3 className={styles.emptyTitle}>No dining bills found</h3>
                            <p className={styles.emptyDesc}>
                                {searchQuery || statusFilter !== 'ALL' || datePreset !== 'ALL'
                                    ? 'Try adjusting your search criteria or filter options'
                                    : 'Click "+ New Restaurant Bill" to create your first order'}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Bill Number</th>
                                        <th>Date / Time</th>
                                        <th>Guest & Location</th>
                                        <th>Ordered Items</th>
                                        <th>Total Amount</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBills.map((bill) => {
                                        const billDate = new Date(bill.created_at).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short',
                                        });
                                        const billTime = new Date(bill.created_at).toLocaleTimeString('en-IN', {
                                            hour: '2-digit', minute: '2-digit',
                                        });

                                        const payClass = bill.payment_mode === 'Cash'
                                            ? styles.payCash
                                            : bill.payment_mode === 'UPI'
                                                ? styles.payUpi
                                                : bill.payment_mode === 'Card'
                                                    ? styles.payCard
                                                    : styles.payRoom;

                                        const statusClass = bill.status === 'Paid'
                                            ? styles.statusPaid
                                            : bill.status === 'Partial'
                                                ? styles.statusPartial
                                                : styles.statusPending;

                                        return (
                                            <tr key={bill.id}>
                                                <td>
                                                    <span
                                                        className={styles.billRefBox}
                                                        onClick={() => setViewingBill(bill)}
                                                        title="Click to view bill"
                                                    >
                                                        <FileText size={13} style={{ color: '#FF6B35' }} />
                                                        {bill.bill_number}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                                                        {billDate}
                                                    </div>
                                                    <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                                                        {billTime}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.guestInfo}>
                                                        <span className={styles.guestName}>{bill.guest_name}</span>
                                                        <span className={styles.guestSub}>
                                                            {bill.room_number ? (
                                                                <span className={styles.roomBadge}>
                                                                    <Bed size={11} /> Room {bill.room_number}
                                                                </span>
                                                            ) : (
                                                                <span className={styles.walkInBadge}>
                                                                    Dine-In
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.itemsPreview}>
                                                        {bill.items.slice(0, 2).map((item, i) => (
                                                            <span key={i} className={styles.itemChip}>
                                                                {item.qty}× {item.name}
                                                            </span>
                                                        ))}
                                                        {bill.items.length > 2 && (
                                                            <span className={styles.moreItemsChip}>
                                                                +{bill.items.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.amountMono}>
                                                        ₹{bill.total_amount.toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.payChip} ${payClass}`}>
                                                        {bill.payment_mode}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${statusClass}`}>
                                                        <span className={styles.statusDot} />
                                                        {bill.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionGroup}>
                                                        {bill.status !== 'Paid' && (
                                                            <button
                                                                className={styles.settleBtn}
                                                                title="Mark as Paid"
                                                                onClick={() => handleMarkAsPaid(bill)}
                                                            >
                                                                <CheckCircle2 size={15} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className={styles.iconBtn}
                                                            title="Preview Bill"
                                                            onClick={() => setViewingBill(bill)}
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                        <button
                                                            className={styles.iconBtn}
                                                            title="Print Thermal Slip"
                                                            onClick={() => handlePrintBill(bill, 'thermal')}
                                                        >
                                                            <Printer size={15} />
                                                        </button>
                                                        <button
                                                            className={styles.iconBtn}
                                                            title="Edit Bill"
                                                            onClick={() => openEditModal(bill)}
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            className={styles.deleteBtn}
                                                            title="Delete Bill"
                                                            onClick={() => setDeletingBill(bill)}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── POS Order Creation / Edit Modal (Split Layout) ─── */}
            {showCreateModal && (
                <div className={styles.modalBackdrop} onClick={closeModal}>
                    <div className={styles.posModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleBox}>
                                <div className={styles.modalIconBox}>
                                    <UtensilsCrossed size={20} />
                                </div>
                                <div>
                                    <h3 className={styles.modalTitle}>
                                        {editingBill ? `Edit Dining Order #${editingBill.bill_number}` : 'New Restaurant Order & POS Ticket'}
                                    </h3>
                                    <p className={styles.modalSubtitle}>
                                        Fast menu item quick-catalog and in-house guest room charging
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className={styles.modalCloseBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.posBody}>
                            {/* ── LEFT PANE: Guest Lookup & Menu Catalog ── */}
                            <div className={styles.catalogPane}>
                                <div className={styles.paneHeader}>
                                    {/* Guest & Room */}
                                    <div className={styles.guestInputsGrid}>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Guest Name / Table *</label>
                                            <input
                                                type="text"
                                                className={styles.posInput}
                                                placeholder="e.g. Table 4 or Guest Name"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                            />
                                        </div>

                                        <div className={styles.fieldGroup}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label className={styles.fieldLabel}>Room / Dining Location</label>
                                                {isCustomRoom && (
                                                    <button
                                                        type="button"
                                                        className={styles.customRoomBtn}
                                                        onClick={() => { setIsCustomRoom(false); setRoomNumber(''); }}
                                                    >
                                                        ← In-House List
                                                    </button>
                                                )}
                                            </div>

                                            {isCustomRoom ? (
                                                <input
                                                    type="text"
                                                    className={styles.posInput}
                                                    placeholder="Enter room number (e.g. 204)"
                                                    value={roomNumber}
                                                    onChange={(e) => setRoomNumber(e.target.value)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <select
                                                    className={styles.posInput}
                                                    value={roomNumber}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '__custom__') {
                                                            setIsCustomRoom(true);
                                                            setRoomNumber('');
                                                        } else {
                                                            handleRoomSelect(val);
                                                        }
                                                    }}
                                                >
                                                    <option value="">🍽️ Dine-In / Walk-In Table</option>
                                                    {occupiedRooms.length > 0 && (
                                                        <optgroup label="🏨 In-House Guests (Bill to Room)">
                                                            {occupiedRooms.map((r, i) => (
                                                                <option key={i} value={r.room_number}>
                                                                    Room {r.room_number} {r.guest_name ? `— ${r.guest_name}` : ''}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                    <option value="__custom__">✏️ Custom / Other Room Number...</option>
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    {/* Catalog Search & Category Filter */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input
                                                type="text"
                                                className={styles.posInput}
                                                style={{ paddingLeft: '32px', width: '100%' }}
                                                placeholder="Search menu items..."
                                                value={catalogSearch}
                                                onChange={(e) => setCatalogSearch(e.target.value)}
                                            />
                                        </div>

                                        <div className={styles.categoryPills}>
                                            {MENU_CATEGORIES.map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    className={`${styles.catPill} ${catalogCategory === cat ? styles.catPillActive : ''}`}
                                                    onClick={() => setCatalogCategory(cat)}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Food Cards Grid */}
                                <div className={styles.catalogGrid}>
                                    {filteredCatalog.map(item => (
                                        <div
                                            key={item.id}
                                            className={styles.menuFoodCard}
                                            onClick={() => addItemFromCatalog(item)}
                                        >
                                            <div className={styles.foodCardName}>{item.name}</div>
                                            <div className={styles.foodCardBottom}>
                                                <span className={styles.foodCardPrice}>₹{item.price}</span>
                                                <span className={styles.foodCardCategory}>{item.category}</span>
                                                <div className={styles.addFoodBadge}>+</div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredCatalog.length === 0 && (
                                        <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                                            <UtensilsCrossed size={32} style={{ margin: '0 auto 8px' }} />
                                            <p style={{ margin: 0, fontSize: '0.88rem' }}>No menu items found in this category</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── RIGHT PANE: Live Order Ticket / Cart ── */}
                            <div className={styles.ticketPane}>
                                <div className={styles.ticketHeader}>
                                    <h4 className={styles.ticketTitle}>
                                        <ShoppingBag size={16} />
                                        Order Ticket ({items.filter(i => i.name.trim()).reduce((s, i) => s + i.qty, 0)} Items)
                                    </h4>
                                    {items.length > 0 && items[0].name && (
                                        <button
                                            type="button"
                                            className={styles.clearCartBtn}
                                            onClick={() => setItems([{ ...emptyItem }])}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {/* Cart Items */}
                                <div className={styles.cartItemsList}>
                                    {items.filter(i => i.name.trim()).length === 0 ? (
                                        <div className={styles.cartEmpty}>
                                            <UtensilsCrossed size={36} />
                                            <p style={{ margin: 0, fontWeight: 600 }}>Order ticket is empty</p>
                                            <p style={{ margin: 0, fontSize: '0.78rem' }}>
                                                Click any item from the left catalog to add
                                            </p>
                                        </div>
                                    ) : (
                                        items.filter(i => i.name.trim()).map((item, idx) => (
                                            <div key={idx} className={styles.cartItemRow}>
                                                <div className={styles.cartItemDetails}>
                                                    <span className={styles.cartItemName}>{item.name}</span>
                                                    <span className={styles.cartItemRate}>₹{item.price} each</span>
                                                </div>

                                                <div className={styles.stepper}>
                                                    <button
                                                        type="button"
                                                        className={styles.stepBtn}
                                                        onClick={() => decrementItemQty(idx)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className={styles.stepQty}>{item.qty}</span>
                                                    <button
                                                        type="button"
                                                        className={styles.stepBtn}
                                                        onClick={() => incrementItemQty(idx)}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <div className={styles.cartItemTotal}>
                                                    ₹{item.qty * item.price}
                                                </div>

                                                <button
                                                    type="button"
                                                    className={styles.removeCartItemBtn}
                                                    onClick={() => removeCartItem(idx)}
                                                    title="Remove"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}

                                    {/* Unlisted Custom Item Quick Add */}
                                    {showCustomItemRow ? (
                                        <div className={styles.customItemRow}>
                                            <input
                                                type="text"
                                                className={styles.posInput}
                                                style={{ flex: 2 }}
                                                placeholder="Custom item name"
                                                value={customItemName}
                                                onChange={(e) => setCustomItemName(e.target.value)}
                                                autoFocus
                                            />
                                            <input
                                                type="number"
                                                className={styles.posInput}
                                                style={{ width: '85px' }}
                                                placeholder="Price ₹"
                                                value={customItemPrice}
                                                onChange={(e) => setCustomItemPrice(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className={styles.savePrimaryBtn}
                                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                onClick={() => {
                                                    addCustomItem();
                                                    setShowCustomItemRow(false);
                                                }}
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.cancelModalBtn}
                                                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                onClick={() => setShowCustomItemRow(false)}
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.customItemToggleBtn}
                                            onClick={() => setShowCustomItemRow(true)}
                                        >
                                            <Plus size={14} /> Add Off-Menu Custom Item
                                        </button>
                                    )}
                                </div>

                                {/* Ticket Bottom Controls */}
                                <div className={styles.ticketBottom}>
                                    {/* Payment Modes */}
                                    <div className={styles.paymentGrid}>
                                        {['Cash', 'UPI', 'Card', 'Room Charge'].map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                className={`${styles.payChoiceBtn} ${paymentMode === mode ? styles.payChoiceSelected : ''}`}
                                                onClick={() => setPaymentMode(mode)}
                                            >
                                                {mode === 'Room Charge' ? 'Room Folio' : mode}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Status */}
                                    <div className={styles.statusChoices}>
                                        <button
                                            type="button"
                                            className={`${styles.statusChoiceBtn} ${status === 'Paid' ? styles.statusChoiceSelectedPaid : ''}`}
                                            onClick={() => setStatus('Paid')}
                                        >
                                            ✓ Paid Immediately
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.statusChoiceBtn} ${status === 'Pending' ? styles.statusChoiceSelectedPending : ''}`}
                                            onClick={() => setStatus('Pending')}
                                        >
                                            ⏳ Pending Settlement
                                        </button>
                                    </div>

                                    {/* Notes */}
                                    <input
                                        type="text"
                                        className={styles.posInput}
                                        placeholder="Special notes / instructions (optional)..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Full-Width Modal Footer Bar ── */}
                        <div className={styles.modalFooterBar}>
                            <div className={styles.footerSummaryInfo}>
                                <span>
                                    {items.filter(i => i.name.trim()).reduce((s, i) => s + i.qty, 0)} Items Selected
                                </span>
                                <span style={{ color: '#CBD5E1' }}>|</span>
                                <span>
                                    Total Amount: <strong className={styles.footerSummaryTotal}>₹{formTotal.toLocaleString('en-IN')}</strong>
                                </span>
                            </div>

                            <div className={styles.footerActions}>
                                <button type="button" className={styles.cancelModalBtn} onClick={closeModal}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={styles.saveSecondaryBtn}
                                    onClick={() => handleSaveBill(false)}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : editingBill ? 'Update Bill' : 'Save Bill'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.savePrimaryBtn}
                                    onClick={() => handleSaveBill(true)}
                                    disabled={saving}
                                >
                                    <Printer size={15} />
                                    Save & Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── View Bill Lightbox Modal (Dual-Mode A4 & Thermal) ─── */}
            {viewingBill && (
                <div className={styles.modalBackdrop} onClick={() => setViewingBill(null)}>
                    <div className={styles.viewModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.viewModalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FileText size={18} style={{ color: '#FF6B35' }} />
                                <span style={{ fontWeight: 800 }}>{viewingBill.bill_number}</span>
                                <div className={styles.viewFormatToggle}>
                                    <button
                                        className={`${styles.formatBtn} ${viewFormat === 'a4' ? styles.formatBtnActive : ''}`}
                                        onClick={() => setViewFormat('a4')}
                                    >
                                        A4 Resort Tax Invoice
                                    </button>
                                    <button
                                        className={`${styles.formatBtn} ${viewFormat === 'thermal' ? styles.formatBtnActive : ''}`}
                                        onClick={() => setViewFormat('thermal')}
                                    >
                                        80mm Thermal Receipt
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setViewingBill(null)} className={styles.modalCloseBtn}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.viewContent}>
                            <div ref={billRef}>
                                <RestaurantBillTemplate bill={viewingBill} format={viewFormat} />
                            </div>
                        </div>

                        <div className={styles.viewModalFooter}>
                            <button className={styles.cancelModalBtn} onClick={() => setViewingBill(null)}>
                                Close
                            </button>
                            <button
                                className={styles.saveOrderBtn}
                                onClick={() => handlePrintBill(viewingBill, viewFormat)}
                            >
                                <Printer size={16} />
                                Print {viewFormat === 'a4' ? 'A4 Invoice' : 'Thermal Slip'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirmation Modal ─── */}
            {deletingBill && (
                <div className={styles.modalBackdrop} onClick={() => setDeletingBill(null)}>
                    <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.confirmIconBox}>
                            <Trash2 size={26} />
                        </div>
                        <h3 className={styles.confirmTitle}>Delete Dining Bill?</h3>
                        <p className={styles.confirmText}>
                            Are you sure you want to permanently delete bill <strong>{deletingBill.bill_number}</strong> ({deletingBill.guest_name})? This action cannot be reversed.
                        </p>
                        <div className={styles.confirmActions}>
                            <button className={styles.cancelModalBtn} onClick={() => setDeletingBill(null)}>
                                Cancel
                            </button>
                            <button className={styles.confirmDeleteBtn} onClick={handleDeleteBill}>
                                Delete Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className={styles.toast}>
                    <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                    <span>{toastMessage}</span>
                </div>
            )}
        </>
    );
}
