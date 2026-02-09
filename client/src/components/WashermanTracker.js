import { useState, useEffect, useContext } from 'react';
import { FaTrash, FaTshirt } from 'react-icons/fa';
import CurrencyContext from '../context/CurrencyContext';

const WashermanTracker = ({ allExpenses, onAddExpense, onDeleteExpense, selectedMonth, selectedYear }) => {
    const { formatCurrency, getSymbol } = useContext(CurrencyContext);
    const [washRate, setWashRate] = useState(() => Number(localStorage.getItem('zen_wash_rate')) || 10);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [loggingDay, setLoggingDay] = useState(null);
    const [logCount, setLogCount] = useState(Number(localStorage.getItem('zen_last_wash_count')) || 1);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        localStorage.setItem('zen_wash_rate', washRate);
    }, [washRate]);

    const washData = allExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && e.category === 'Laundry';
    });

    const getDailyWash = (day) => {
        const entry = washData.find(e => new Date(e.date).getDate() === day);
        return { qty: entry?.quantity || 0, amt: entry?.amount || 0 };
    };

    const totalQty = washData.reduce((a, b) => a + (b.quantity || 0), 0);
    const totalAmt = washData.reduce((a, b) => a + b.amount, 0);

    const handleLog = (day) => {
        const d = new Date(selectedYear, selectedMonth, day);
        onAddExpense({
            title: `Laundry - ${logCount} pcs (${day} ${months[selectedMonth].slice(0, 3)})`,
            amount: Math.round(logCount * washRate),
            quantity: logCount,
            category: 'Laundry',
            type: 'expense',
            date: d.toISOString()
        });
        localStorage.setItem('zen_last_wash_count', logCount);
        setLoggingDay(null);
    };

    return (
        <div className="washerman-tracker" style={{ padding: '0px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🧺</span>
                    <h3 style={{ fontSize: '14px', margin: 0, fontWeight: '800' }}>Washerman Log</h3>
                </div>
                <button onClick={() => setIsConfiguring(!isConfiguring)} className="btn-text">
                    {isConfiguring ? 'Done' : 'Rate ✎'}
                </button>
            </div>

            {isConfiguring && (
                <div className="fade-in" style={{ padding: '15px', background: 'var(--bg-body)', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                    <label style={{ fontSize: '10px', display: 'block', marginBottom: '5px' }}>Price per Piece ({getSymbol()})</label>
                    <input type="number" className="form-control" value={washRate} onChange={(e) => setWashRate(Number(e.target.value))} onWheel={(e) => e.target.blur()} />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                <div className="stat-card glass-effect" style={{ padding: '8px 12px', textAlign: 'center', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Pieces</div>
                    <div style={{ fontSize: '14px', fontWeight: '800' }}>{totalQty} Pcs</div>
                </div>
                <div className="stat-card glass-effect" style={{ padding: '8px 12px', textAlign: 'center', borderLeft: '3px solid #8b5cf6', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9px', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Monthly Cost</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#8b5cf6' }}>{formatCurrency(totalAmt)}</div>
                </div>
            </div>

            <div className="essentials-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="essentials-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Pieces</th>
                            <th>Amount</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {daysArray.map(day => {
                            const { qty, amt } = getDailyWash(day);
                            const isToday = day === new Date().getDate() && selectedMonth === new Date().getMonth();
                            return (
                                <tr key={day} style={{ background: isToday ? 'var(--primary-bg)' : 'transparent' }}>
                                    <td style={{ fontWeight: isToday ? '800' : '400' }}>{day} {months[selectedMonth].slice(0, 3)}</td>
                                    <td>{qty > 0 ? `${qty} pcs` : '—'}</td>
                                    <td>{amt > 0 ? formatCurrency(amt) : '—'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {qty === 0 && loggingDay !== day && (
                                            <button onClick={() => setLoggingDay(day)} className="btn-log-sm">+ Log</button>
                                        )}
                                        {loggingDay === day && (
                                            <div className="fade-in logs-controls">
                                                <div className="counter" style={{ marginBottom: '10px' }}>
                                                    <button onClick={() => setLogCount(Math.max(1, logCount - 1))}>−</button>
                                                    <span style={{ fontWeight: '800' }}>{logCount}</span>
                                                    <button onClick={() => setLogCount(logCount + 1)}>+</button>
                                                </div>
                                                <div className="actions">
                                                    <button onClick={() => handleLog(day)} className="btn-save">Save</button>
                                                    <button onClick={() => setLoggingDay(null)} className="btn-cancel">✕</button>
                                                </div>
                                            </div>
                                        )}
                                        {qty > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                                <button
                                                    onClick={() => {
                                                        const entry = washData.find(e => new Date(e.date).getDate() === day);
                                                        if (entry && window.confirm('Delete this laundry entry?')) {
                                                            onDeleteExpense(entry._id);
                                                        }
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WashermanTracker;
