'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
    Plus, X, Pencil, Trash2, Search,
    UtensilsCrossed, CheckCircle2, XCircle, BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string | null;
    is_available: boolean;
    created_at: string;
}

const CATEGORIES = ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Beverages', 'Desserts', 'Snacks', 'Other'];

export default function RestaurantMenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Main Course');
    const [description, setDescription] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('restaurant_menu_items')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching menu items:', error);
        }
        if (data) setItems(data);
        setLoading(false);
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setCategory('Main Course');
        setDescription('');
        setIsAvailable(true);
    };

    const openCreateModal = () => {
        resetForm();
        setEditingItem(null);
        setShowModal(true);
    };

    const openEditModal = (item: MenuItem) => {
        setName(item.name);
        setPrice(String(item.price));
        setCategory(item.category);
        setDescription(item.description || '');
        setIsAvailable(item.is_available);
        setEditingItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        resetForm();
    };

    const handleSaveItem = async () => {
        if (!name.trim()) {
            alert('Please enter item name');
            return;
        }
        if (!price || Number(price) < 0) {
            alert('Please enter a valid price');
            return;
        }

        setSaving(true);
        const itemData = {
            name: name.trim(),
            price: Number(price),
            category,
            description: description.trim() || null,
            is_available: isAvailable,
        };

        if (editingItem) {
            // Update
            const { error } = await supabase
                .from('restaurant_menu_items')
                .update(itemData)
                .eq('id', editingItem.id);

            if (error) {
                console.error('Error updating item:', error);
                alert('Failed to update item');
            } else {
                closeModal();
                fetchItems();
            }
        } else {
            // Create
            const { error } = await supabase
                .from('restaurant_menu_items')
                .insert(itemData);

            if (error) {
                console.error('Error creating item:', error);
                alert('Failed to create item');
            } else {
                closeModal();
                fetchItems();
            }
        }
        setSaving(false);
    };

    const handleDeleteItem = async () => {
        if (!deletingItem) return;
        const { error } = await supabase
            .from('restaurant_menu_items')
            .delete()
            .eq('id', deletingItem.id);

        if (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item');
        } else {
            setDeletingItem(null);
            fetchItems();
        }
    };

    // Filter items by search
    const filteredItems = items.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        );
    });

    // Stats
    const totalItems = items.length;
    const availableItems = items.filter(i => i.is_available).length;
    const averagePrice = totalItems > 0
        ? Math.round(items.reduce((sum, i) => sum + i.price, 0) / totalItems)
        : 0;

    return (
        <>
            <Header title="Restaurant Menu" />

            <div className={styles.container}>
                {/* Stats Row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Items</span>
                        <span className={styles.statValue}>{totalItems}</span>
                        <span className={styles.statSub}>Menu items listed</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Available</span>
                        <span className={styles.statValue}>{availableItems}</span>
                        <span className={styles.statSub}>Active on menu</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Avg Price</span>
                        <span className={styles.statValue}>₹{averagePrice}</span>
                        <span className={styles.statSub}>Per item</span>
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <div className={styles.tabs}>
                        <button className={`${styles.tabBtn} ${styles.active}`}>
                            All Items
                        </button>
                    </div>

                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by name, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button className={styles.primaryBtn} onClick={openCreateModal}>
                        <Plus size={18} />
                        Add Item
                    </button>
                </div>

                {/* Items Table */}
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <p>Loading menu...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className={styles.emptyState}>
                        <BookOpen size={48} />
                        <p>{searchQuery ? 'No items match your search' : 'No menu items yet'}</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                                        <td>
                                            <span className={styles.badge}>{item.category}</span>
                                        </td>
                                        <td className={styles.amount}>₹{item.price.toLocaleString()}</td>
                                        <td>
                                            <span className={`${styles.status} ${item.is_available ? styles.available : styles.unavailable}`}>
                                                {item.is_available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '300px' }}>
                                            {item.description || '—'}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Edit"
                                                    onClick={() => openEditModal(item)}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    title="Delete"
                                                    onClick={() => setDeletingItem(item)}
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
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>
                                <UtensilsCrossed size={20} style={{ color: '#00a0d2' }} />
                                {editingItem ? 'Edit Item' : 'New Menu Item'}
                            </h3>
                            <button onClick={closeModal} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Item Name *</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. Butter Chicken"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className={styles.row} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className={styles.formGroup}>
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        placeholder="0.00"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select
                                        className={styles.select}
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description (Optional)</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Brief description of the item..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label style={{ marginBottom: '12px' }}>Availability</label>
                                <div className={styles.checkboxGroup}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                        <input
                                            type="checkbox"
                                            checked={isAvailable}
                                            onChange={(e) => setIsAvailable(e.target.checked)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Available for ordering
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button
                                className={styles.submitBtn}
                                onClick={handleSaveItem}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingItem && (
                <div className={styles.modalOverlay} onClick={() => setDeletingItem(null)}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 12px', color: '#1E293B' }}>Delete Item?</h3>
                        <p style={{ color: '#64748B', marginBottom: '24px' }}>
                            Are you sure you want to delete <strong>{deletingItem.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className={styles.cancelBtn} onClick={() => setDeletingItem(null)}>Cancel</button>
                            <button
                                className={styles.deleteBtn}
                                style={{ background: '#EF5350', color: 'white', fontWeight: 'bold', padding: '12px 24px' }}
                                onClick={handleDeleteItem}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
