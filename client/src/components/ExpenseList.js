import React, { useContext, useState } from 'react';
import { FaEdit, FaTrash, FaTimes, FaSearchPlus } from 'react-icons/fa';
import CurrencyContext from '../context/CurrencyContext';

const ExpenseList = ({
    expenses,
    onDelete,
    onEdit,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterType,
    setFilterType,
    clearFilter,
    sortConfig,
    setSortConfig
}) => {
    const { formatCurrency } = useContext(CurrencyContext);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Categories for filter dropdown
    const categories = ['food', 'grocery', 'travel', 'shopping', 'rent', 'bills', 'salary', 'entertainment', 'health', 'education', 'investment', 'tax', 'insurance', 'other'];

    // Handle Escape key to close modal
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && previewUrl) {
                setPreviewUrl(null);
            }
        };

        if (previewUrl) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [previewUrl]);

    const categoryIcons = {
        food: '🍔',
        grocery: '🛒',
        travel: '🚗',
        shopping: '🛍️',
        rent: '🏠',
        bills: '🧾',
        salary: '💰',
        entertainment: '🎬',
        health: '🏥',
        education: '📚',
        investment: '📈',
        tax: '🏛️',
        insurance: '🛡️',
        other: '📦'
    };

    const getIcon = (category) => {
        const cat = (category || 'other').toLowerCase();
        return categoryIcons[cat] || categoryIcons.other;
    };

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span style={{ opacity: 0.3, marginLeft: '5px' }}>↕</span>;
        return sortConfig.direction === 'asc' ? <span style={{ marginLeft: '5px' }}>↑</span> : <span style={{ marginLeft: '5px' }}>↓</span>;
    };

    const renderPreviewModal = () => {
        if (!previewUrl) return null;

        return (
            <div
                className="fade-in"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                onClick={() => setPreviewUrl(null)}
            >
                {/* Floating Close Button - Always Visible in Viewport */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(null);
                    }}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10001,
                        boxShadow: '0 8px 30px rgba(239, 68, 68, 0.6)',
                        fontWeight: '900',
                        fontSize: '24px',
                        transition: 'all 0.3s',
                        animation: 'pulse 2s infinite'
                    }}
                    title="Close (or press ESC)"
                >
                    ✕
                </button>

                <div
                    style={{
                        position: 'relative',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        border: '1px solid var(--primary)',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                        animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Image Container */}
                    <div style={{
                        padding: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <img
                            src={previewUrl}
                            alt="Receipt"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '16px',
                                objectFit: 'contain',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="card glass-table-container" style={{ padding: 0, border: 'none', position: 'relative' }}>
            {renderPreviewModal()}
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Monthly Transactions</h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {expenses.length} records found
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`btn-glow-primary ${showFilters ? 'active' : ''}`}
                                style={{
                                    padding: '10px 18px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: (filterType !== 'all' || filterCategory) ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.05)',
                                    borderColor: (filterType !== 'all' || filterCategory) ? 'var(--primary)' : 'var(--border)'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>🔍</span>
                                Filters {(filterType !== 'all' || filterCategory) && <span className="filter-dot"></span>}
                            </button>

                            {showFilters && (
                                <>
                                    <div
                                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 998 }}
                                        onClick={() => setShowFilters(false)}
                                    />
                                    <div className="filter-dropdown glass-effect slide-up" style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 12px)',
                                        right: 0,
                                        width: '280px',
                                        zIndex: 999,
                                        padding: '20px',
                                        borderRadius: '20px',
                                        border: '1px solid var(--primary)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '20px'
                                    }}>
                                        <div className="filter-group">
                                            <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>Transaction Type</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                                {['all', 'income', 'expense'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setFilterType(t)}
                                                        style={{
                                                            padding: '8px 0',
                                                            borderRadius: '10px',
                                                            border: '1px solid',
                                                            borderColor: filterType === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                            background: filterType === t ? 'var(--primary-bg)' : 'rgba(255,255,255,0.02)',
                                                            color: filterType === t ? 'var(--primary)' : 'var(--text-muted)',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            textTransform: 'capitalize',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="filter-group">
                                            <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>Category</label>
                                            <select
                                                className="form-control"
                                                value={filterCategory}
                                                onChange={(e) => setFilterCategory(e.target.value)}
                                                style={{
                                                    padding: '8px 12px',
                                                    fontSize: '13px',
                                                    height: 'auto',
                                                    lineHeight: '1.2',
                                                    appearance: 'none',
                                                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 12px center',
                                                    backgroundSize: '16px'
                                                }}
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat} style={{ background: 'var(--bg-card)', color: 'white' }}>
                                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={() => { clearFilter(); setShowFilters(false); }}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '10px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: 'var(--danger)',
                                                border: '1px solid var(--danger)',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Reset All Filters
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-control"
                                style={{ width: '200px', padding: '10px 16px 10px 40px', fontSize: '13px', borderRadius: '12px' }}
                            />
                        </div>
                    </div>
                </div>

                {(filterType !== 'all' || filterCategory) && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {filterType !== 'all' && (
                            <div className="filter-badge">
                                Type: {filterType} <span onClick={() => setFilterType('all')}>✕</span>
                            </div>
                        )}
                        {filterCategory && (
                            <div className="filter-badge">
                                Category: {filterCategory} <span onClick={() => setFilterCategory('')}>✕</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('date')} style={{ cursor: 'pointer', padding: '16px 12px', textAlign: 'left', minWidth: '100px' }}>
                                Date <SortIcon column="date" />
                            </th>
                            <th style={{ padding: '16px 12px', textAlign: 'left' }}>Description</th>
                            <th style={{ padding: '16px 12px', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '16px 12px', textAlign: 'left' }}>Type</th>
                            <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer', padding: '16px 12px', textAlign: 'left' }}>
                                Amount <SortIcon column="amount" />
                            </th>
                            <th style={{ textAlign: 'right', padding: '16px 12px', width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <tr key={expense._id} className="row-hover" style={{ animationDelay: `${0.1 * (expenses.indexOf(expense) % 10)}s` }}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '11px', padding: '12px 12px' }}>
                                        {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td style={{ fontWeight: '600', color: 'var(--text-main)', padding: '12px 12px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '16px' }}>{getIcon(expense.category)}</span>
                                                <span style={{ fontSize: '13px' }}>{expense.title}</span>
                                                {expense.user?.name && (
                                                    <span style={{
                                                        fontSize: '9px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        padding: '2px 6px',
                                                        borderRadius: '6px',
                                                        color: 'var(--text-muted)',
                                                        fontWeight: '400',
                                                        marginLeft: '4px'
                                                    }}>
                                                        {expense.user.name.split(' ')[0]}
                                                    </span>
                                                )}
                                            </div>
                                            {expense.note && (
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '400', marginTop: '2px', fontStyle: 'italic', maxWidth: '300px' }}>
                                                    "{expense.note}"
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 12px' }}>
                                        <span style={{ background: 'var(--bg-body)', padding: '4px 8px', borderRadius: '20px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize', border: '1px solid var(--border)' }}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 12px' }}>
                                        <span style={{
                                            background: expense.type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)',
                                            color: expense.type === 'income' ? 'var(--success)' : 'var(--danger)',
                                            padding: '4px 8px',
                                            borderRadius: '20px',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase'
                                        }}>
                                            {expense.type}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '800', color: 'var(--text-main)', padding: '12px 12px', fontSize: '14px' }}>
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '12px 12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                                            {expense.billUrl && (
                                                <button
                                                    onClick={() => setPreviewUrl(expense.billUrl)}
                                                    style={{
                                                        fontSize: '10px',
                                                        color: 'var(--primary)',
                                                        background: 'var(--primary-bg)',
                                                        padding: '4px 10px',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--primary)',
                                                        cursor: 'pointer',
                                                        fontWeight: '800',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    className="receipt-btn"
                                                    title="View Receipt"
                                                >
                                                    📎 Receipt
                                                </button>
                                            )}
                                            <button onClick={() => onEdit(expense)} className="btn-icon" style={{ padding: '4px' }}>
                                                <FaEdit size={14} color="var(--primary)" />
                                            </button>
                                            <button onClick={() => onDelete(expense._id)} className="btn-icon" style={{ padding: '4px' }}>
                                                <FaTrash size={12} color="var(--danger)" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📉</div>
                                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>No records for this period</h4>
                                    <p style={{ fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                                        {searchTerm || filterCategory
                                            ? 'No matches found for your filter criteria.'
                                            : 'Add your first transaction for this month to generate analytical insights!'}
                                    </p>
                                    {(searchTerm || filterCategory) && (
                                        <button className="btn btn-primary" onClick={() => { setSearchTerm(''); clearFilter(); }} style={{ marginTop: '20px', padding: '8px 20px', fontSize: '12px' }}>
                                            Clear all filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenseList;
