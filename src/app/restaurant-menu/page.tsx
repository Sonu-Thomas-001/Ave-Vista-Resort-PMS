'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import {
    Plus, X, Pencil, Trash2, Search,
    UtensilsCrossed, CheckCircle2, XCircle,
    LayoutGrid, List, Download, Sparkles, AlertCircle,
    Flame, Croissant, CookingPot, Coffee, CakeSlice, Sandwich, ArrowUpDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import CustomSelect, { CustomSelectOption } from '@/components/ui/CustomSelect';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string | null;
    is_available: boolean;
    created_at: string;
}

const CATEGORIES = [
    'All',
    'Starters',
    'Main Course',
    'Breads',
    'Rice & Biryani',
    'Beverages',
    'Desserts',
    'Snacks',
    'Other'
];

const CATEGORY_OPTIONS: CustomSelectOption[] = [
    { label: 'Starters', value: 'Starters', icon: <Flame size={16} color="#F97316" /> },
    { label: 'Main Course', value: 'Main Course', icon: <UtensilsCrossed size={16} color="#EA580C" /> },
    { label: 'Breads', value: 'Breads', icon: <Croissant size={16} color="#D97706" /> },
    { label: 'Rice & Biryani', value: 'Rice & Biryani', icon: <CookingPot size={16} color="#DC2626" /> },
    { label: 'Beverages', value: 'Beverages', icon: <Coffee size={16} color="#059669" /> },
    { label: 'Desserts', value: 'Desserts', icon: <CakeSlice size={16} color="#DB2777" /> },
    { label: 'Snacks', value: 'Snacks', icon: <Sandwich size={16} color="#2563EB" /> },
    { label: 'Other', value: 'Other', icon: <Sparkles size={16} color="#7C3AED" /> }
];

const SORT_OPTIONS: CustomSelectOption[] = [
    { label: 'Name: A to Z', value: 'name-asc' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' }
];

export default function RestaurantMenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');
    const [sortBy, setSortBy] = useState<'name-asc' | 'price-asc' | 'price-desc'>('name-asc');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Main Course');
    const [description, setDescription] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    const activeCategoryOptions = useMemo(() => {
        if (category && !CATEGORY_OPTIONS.some(opt => opt.value === category)) {
            return [
                ...CATEGORY_OPTIONS,
                { label: category, value: category, icon: <Sparkles size={16} color="#7C3AED" /> }
            ];
        }
        return CATEGORY_OPTIONS;
    }, [category]);

    useEffect(() => {
        fetchItems();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

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

    // 1-Click Fast In-Stock / Out-of-Stock Toggle
    const handleToggleAvailability = async (item: MenuItem) => {
        const newStatus = !item.is_available;
        // Optimistic UI Update
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: newStatus } : i));

        const { error } = await supabase
            .from('restaurant_menu_items')
            .update({ is_available: newStatus })
            .eq('id', item.id);

        if (error) {
            console.error('Error toggling availability:', error);
            // Revert on error
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !newStatus } : i));
            alert('Failed to update item availability');
        } else {
            showToast(`${item.name} marked as ${newStatus ? 'In Stock' : 'Out of Stock'}`);
        }
    };

    const handleSaveItem = async () => {
        if (!name.trim()) {
            alert('Please enter dish / item name');
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
            const { error } = await supabase
                .from('restaurant_menu_items')
                .update(itemData)
                .eq('id', editingItem.id);

            if (error) {
                console.error('Error updating item:', error);
                alert('Failed to update item');
            } else {
                showToast(`"${name.trim()}" updated successfully!`);
                closeModal();
                fetchItems();
            }
        } else {
            const { error } = await supabase
                .from('restaurant_menu_items')
                .insert(itemData);

            if (error) {
                console.error('Error creating item:', error);
                alert('Failed to add menu item');
            } else {
                showToast(`"${name.trim()}" added to menu!`);
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
            setItems(prev => prev.filter(i => i.id !== deletingItem.id));
            showToast(`"${deletingItem.name}" deleted from menu.`);
            setDeletingItem(null);
        }
    };

    // Export Menu Catalog to CSV
    const exportMenuCsv = () => {
        if (filteredItems.length === 0) {
            alert('No items to export');
            return;
        }
        const headers = ['Item Name', 'Category', 'Price (INR)', 'Availability', 'Description'];
        const rows = filteredItems.map(item => [
            `"${item.name.replace(/"/g, '""')}"`,
            `"${item.category}"`,
            `"${item.price}"`,
            `"${item.is_available ? 'In Stock' : 'Out of Stock'}"`,
            `"${(item.description || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `AveVista_Restaurant_Menu_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Menu catalog exported to CSV!');
    };

    // Filter and Sort Items
    const filteredItems = useMemo(() => {
        let result = items.filter(item => {
            // Search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesName = item.name.toLowerCase().includes(q);
                const matchesCat = item.category.toLowerCase().includes(q);
                const matchesDesc = item.description ? item.description.toLowerCase().includes(q) : false;
                if (!matchesName && !matchesCat && !matchesDesc) return false;
            }

            // Category
            if (selectedCategory !== 'All' && item.category !== selectedCategory) {
                return false;
            }

            // Availability
            if (availabilityFilter === 'AVAILABLE' && !item.is_available) return false;
            if (availabilityFilter === 'UNAVAILABLE' && item.is_available) return false;

            return true;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'name-asc') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'price-asc') {
                return a.price - b.price;
            } else if (sortBy === 'price-desc') {
                return b.price - a.price;
            }
            return 0;
        });

        return result;
    }, [items, searchQuery, selectedCategory, availabilityFilter, sortBy]);

    // KPI Metrics
    const metrics = useMemo(() => {
        const total = items.length;
        const inStock = items.filter(i => i.is_available).length;
        const outOfStock = total - inStock;
        const avgPrice = total > 0 ? Math.round(items.reduce((s, i) => s + i.price, 0) / total) : 0;
        const highestPrice = total > 0 ? Math.max(...items.map(i => i.price)) : 0;
        const uniqueCategories = new Set(items.map(i => i.category)).size;

        return {
            total,
            inStock,
            outOfStock,
            avgPrice,
            highestPrice,
            uniqueCategories,
            inStockPct: total > 0 ? Math.round((inStock / total) * 100) : 0
        };
    }, [items]);

    return (
        <>
            <Header title="Restaurant Menu Catalog" />

            <div className={styles.container}>
                {/* ─── Hero Banner ─── */}
                <div className={styles.heroBanner}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBadge}>
                            <span className={styles.pulseDot} />
                            Culinary Catalog & Engineering
                        </div>
                        <h1 className={styles.heroTitle}>Restaurant Menu Management</h1>
                        <p className={styles.heroSubtitle}>
                            <span>Ave Vista Fine Dining</span>
                            <span>•</span>
                            <span>{items.length} Total Dishes</span>
                            <span>•</span>
                            <span>{metrics.uniqueCategories} Active Categories</span>
                        </p>
                    </div>

                    <div className={styles.heroActions}>
                        {/* View Switcher */}
                        <div className={styles.viewModeSwitch}>
                            <button
                                className={`${styles.viewModeBtn} ${viewMode === 'grid' ? styles.viewModeBtnActive : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Card Grid View"
                            >
                                <LayoutGrid size={15} />
                                Grid
                            </button>
                            <button
                                className={`${styles.viewModeBtn} ${viewMode === 'table' ? styles.viewModeBtnActive : ''}`}
                                onClick={() => setViewMode('table')}
                                title="Data Table View"
                            >
                                <List size={15} />
                                Table
                            </button>
                        </div>

                        <button className={styles.exportBtn} onClick={exportMenuCsv}>
                            <Download size={16} />
                            Export CSV
                        </button>

                        <button className={styles.primaryAddBtn} onClick={openCreateModal}>
                            <Plus size={18} />
                            + Add Menu Item
                        </button>
                    </div>
                </div>

                {/* ─── KPI Intelligence Cards (4-Grid) ─── */}
                <div className={styles.kpiGrid}>
                    {/* Total Items */}
                    <div className={`${styles.kpiCard} ${styles.kpiCardPrimary}`}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>Total Dishes</span>
                            <div className={styles.kpiIconBox}>
                                <UtensilsCrossed size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValue}>{metrics.total}</div>
                        <div className={styles.kpiMeta}>
                            Across <span className={styles.kpiHighlight}>{metrics.uniqueCategories} categories</span>
                        </div>
                    </div>

                    {/* In Stock */}
                    <div className={`${styles.kpiCard} ${styles.kpiCardSuccess}`}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>In Stock</span>
                            <div className={styles.kpiIconBox}>
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValue}>{metrics.inStock}</div>
                        <div className={styles.kpiMeta}>
                            <span className={styles.kpiHighlight}>{metrics.inStockPct}% of menu</span> available
                        </div>
                    </div>

                    {/* Out of Stock (Clickable to Filter) */}
                    <div
                        className={`${styles.kpiCard} ${styles.kpiCardWarning}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setAvailabilityFilter(availabilityFilter === 'UNAVAILABLE' ? 'ALL' : 'UNAVAILABLE')}
                        title="Click to toggle filter unavailable items"
                    >
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>Unavailable (86&apos;d)</span>
                            <div className={styles.kpiIconBox}>
                                <AlertCircle size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValue}>{metrics.outOfStock}</div>
                        <div className={styles.kpiMeta}>
                            <span className={styles.kpiHighlight}>{metrics.outOfStock} dishes</span> out of stock
                        </div>
                    </div>

                    {/* Average Price */}
                    <div className={`${styles.kpiCard} ${styles.kpiCardInfo}`}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>Average Dish Price</span>
                            <div className={styles.kpiIconBox}>
                                <Sparkles size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValue}>₹{metrics.avgPrice}</div>
                        <div className={styles.kpiMeta}>
                            Max dish: <span className={styles.kpiHighlight}>₹{metrics.highestPrice}</span>
                        </div>
                    </div>
                </div>

                {/* ─── Controls & Filter Toolbar ─── */}
                <div className={styles.toolbarCard}>
                    <div className={styles.toolbarTopRow}>
                        {/* Search Bar */}
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search dishes, categories, ingredients..."
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

                        {/* Category Pills Bar (Hidden Native Scrollbar) */}
                        <div className={styles.categoryPills}>
                            {CATEGORIES.map(cat => {
                                const count = cat === 'All'
                                    ? items.length
                                    : items.filter(i => i.category === cat).length;

                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`${styles.catPill} ${selectedCategory === cat ? styles.catPillActive : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                        <span className={styles.catPillCount}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sub-Filters Row */}
                    <div className={styles.toolbarSubRow}>
                        <div className={styles.subFiltersGroup}>
                            {/* Stock Filter Pills */}
                            <div className={styles.pillGroup}>
                                <button
                                    className={`${styles.pillBtn} ${availabilityFilter === 'ALL' ? styles.pillBtnActive : ''}`}
                                    onClick={() => setAvailabilityFilter('ALL')}
                                >
                                    All ({items.length})
                                </button>
                                <button
                                    className={`${styles.pillBtn} ${availabilityFilter === 'AVAILABLE' ? styles.pillBtnActive : ''}`}
                                    onClick={() => setAvailabilityFilter('AVAILABLE')}
                                >
                                    In Stock ({metrics.inStock})
                                </button>
                                <button
                                    className={`${styles.pillBtn} ${availabilityFilter === 'UNAVAILABLE' ? styles.pillBtnActive : ''}`}
                                    onClick={() => setAvailabilityFilter('UNAVAILABLE')}
                                >
                                    Out of Stock ({metrics.outOfStock})
                                </button>
                            </div>

                            {/* Sort Selector */}
                            <div className={styles.sortGroup}>
                                <span>Sort:</span>
                                <div style={{ minWidth: '170px' }}>
                                    <CustomSelect
                                        options={SORT_OPTIONS}
                                        value={sortBy}
                                        onChange={(val) => setSortBy(val as any)}
                                        size="sm"
                                        fullWidth
                                        icon={<ArrowUpDown size={13} />}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.resultsCount}>
                            Showing <strong>{filteredItems.length}</strong> of {items.length} items
                        </div>
                    </div>
                </div>

                {/* ─── Content Area: Grid vs Table ─── */}
                {loading ? (
                    <div className={styles.loadingBox}>
                        <div className={styles.spinner} />
                        <p>Loading restaurant menu catalog...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className={styles.emptyState}>
                        <UtensilsCrossed size={48} />
                        <h3 className={styles.emptyTitle}>No menu items found</h3>
                        <p className={styles.emptyDesc}>
                            {searchQuery || selectedCategory !== 'All' || availabilityFilter !== 'ALL'
                                ? 'Try adjusting your search criteria or category filter'
                                : 'Click "+ Add Menu Item" to create your first dish'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* ─── Mode 1: Luxury Culinary Card Grid ─── */
                    <div className={styles.cardGrid}>
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={`${styles.dishCard} ${!item.is_available ? styles.dishCardUnavailable : ''}`}
                            >
                                <div>
                                    <div className={styles.dishCardHeader}>
                                        <div>
                                            <h3 className={styles.dishTitle}>{item.name}</h3>
                                            <span className={styles.dishCategoryBadge}>{item.category}</span>
                                        </div>
                                        <div className={styles.dishPrice}>₹{item.price.toLocaleString('en-IN')}</div>
                                    </div>
                                    <p className={styles.dishDescription}>
                                        {item.description || 'Delicately prepared by Ave Vista culinary chefs.'}
                                    </p>
                                </div>

                                <div className={styles.dishCardFooter}>
                                    {/* 1-Click Availability Toggle */}
                                    <button
                                        type="button"
                                        className={`${styles.stockSwitchBtn} ${item.is_available ? styles.stockIn : styles.stockOut}`}
                                        onClick={() => handleToggleAvailability(item)}
                                        title="Click to toggle availability status"
                                    >
                                        {item.is_available ? (
                                            <>
                                                <CheckCircle2 size={13} />
                                                In Stock
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={13} />
                                                Out of Stock
                                            </>
                                        )}
                                    </button>

                                    <div className={styles.cardActionGroup}>
                                        <button
                                            className={styles.iconBtn}
                                            title="Edit Item"
                                            onClick={() => openEditModal(item)}
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            title="Delete Item"
                                            onClick={() => setDeletingItem(item)}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ─── Mode 2: Executive Data Table ─── */
                    <div className={styles.tableCard}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Dish Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock Status</th>
                                        <th>Description</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</td>
                                            <td>
                                                <span className={styles.dishCategoryBadge}>{item.category}</span>
                                            </td>
                                            <td>
                                                <span className={styles.tableAmount}>₹{item.price.toLocaleString('en-IN')}</span>
                                            </td>
                                            <td>
                                                {/* 1-Click Stock Toggle in Table */}
                                                <button
                                                    type="button"
                                                    className={`${styles.stockSwitchBtn} ${item.is_available ? styles.stockIn : styles.stockOut}`}
                                                    onClick={() => handleToggleAvailability(item)}
                                                    title="Click to toggle availability status"
                                                >
                                                    {item.is_available ? (
                                                        <>
                                                            <CheckCircle2 size={13} />
                                                            In Stock
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={13} />
                                                            Out of Stock
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td style={{ color: '#64748B', fontSize: '0.84rem', maxWidth: '320px' }}>
                                                {item.description || '—'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className={styles.iconBtn}
                                                        title="Edit Item"
                                                        onClick={() => openEditModal(item)}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        title="Delete Item"
                                                        onClick={() => setDeletingItem(item)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Add / Edit Item Modal ─── */}
            {showModal && (
                <div className={styles.modalBackdrop} onClick={closeModal}>
                    <div className={styles.itemModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleBox}>
                                <div className={styles.modalIconBox}>
                                    <UtensilsCrossed size={20} />
                                </div>
                                <div>
                                    <h3 className={styles.modalTitle}>
                                        {editingItem ? `Edit "${editingItem.name}"` : 'New Menu Item'}
                                    </h3>
                                    <p className={styles.modalSubtitle}>
                                        Manage dish pricing, culinary category, and stock status
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className={styles.modalCloseBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Dish / Item Name *</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    placeholder="e.g. Malabar Chicken Biryani"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Price (INR) *</label>
                                    <div className={styles.priceInputWrapper}>
                                        <span className={styles.currencyAdornment}>₹</span>
                                        <input
                                            type="number"
                                            className={`${styles.formInput} ${styles.priceInput}`}
                                            placeholder="0"
                                            min="0"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Category</label>
                                    <CustomSelect
                                        options={activeCategoryOptions}
                                        value={category}
                                        onChange={(val) => setCategory(val)}
                                        placeholder="Select category..."
                                        size="md"
                                        fullWidth
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Description / Ingredients (Optional)</label>
                                <textarea
                                    className={styles.formTextarea}
                                    placeholder="Brief description of the dish, flavors, allergens, or preparation..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Stock Availability Toggle Switch */}
                            <div
                                className={styles.modalStockSwitchBox}
                                onClick={() => setIsAvailable(!isAvailable)}
                            >
                                <div className={styles.switchText}>
                                    <span className={styles.switchTitle}>
                                        {isAvailable ? (
                                            <>
                                                <CheckCircle2 size={16} color="#16A34A" />
                                                Currently Available in Kitchen
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={16} color="#DC2626" />
                                                Marked as Out of Stock (86&apos;d)
                                            </>
                                        )}
                                    </span>
                                    <span className={styles.switchDesc}>
                                        {isAvailable ? 'This item will appear in restaurant billing and POS tickets' : 'Staff will see this item as unavailable on POS'}
                                    </span>
                                </div>
                                <div className={`${styles.toggleSwitch} ${isAvailable ? styles.toggleSwitchActive : ''}`}>
                                    <div className={styles.toggleKnob} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.submitBtn}
                                onClick={handleSaveItem}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : editingItem ? 'Update Dish' : 'Add to Menu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirmation Modal ─── */}
            {deletingItem && (
                <div className={styles.modalBackdrop} onClick={() => setDeletingItem(null)}>
                    <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.confirmIconBox}>
                            <Trash2 size={26} />
                        </div>
                        <h3 className={styles.confirmTitle}>Delete Menu Dish?</h3>
                        <p className={styles.confirmText}>
                            Are you sure you want to permanently remove <strong>{deletingItem.name}</strong> from the restaurant menu? This action cannot be undone.
                        </p>
                        <div className={styles.confirmActions}>
                            <button className={styles.cancelBtn} onClick={() => setDeletingItem(null)}>
                                Cancel
                            </button>
                            <button className={styles.confirmDeleteBtn} onClick={handleDeleteItem}>
                                Delete Dish
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
