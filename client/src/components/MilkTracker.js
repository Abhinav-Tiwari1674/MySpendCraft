import { useState, useEffect, useContext } from 'react';
import { FaScaleBalanced, FaFileInvoiceDollar } from 'react-icons/fa6';
import { FaTrash } from 'react-icons/fa';
import CurrencyContext from '../context/CurrencyContext';

const MilkTracker = ({ allExpenses, onAddExpense, onDeleteExpense, selectedMonth, selectedYear }) => {
    const { formatCurrency, getSymbol } = useContext(CurrencyContext);
    const [milkRate, setMilkRate] = useState(() => Number(localStorage.getItem('zen_milk_rate')) || 60);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [loggingDay, setLoggingDay] = useState(null);
    const [logQty, setLogQty] = useState(Number(localStorage.getItem('zen_last_qty')) || 1.0);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        localStorage.setItem('zen_milk_rate', milkRate);
    }, [milkRate]);

    const milkData = allExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && e.category === 'Milk';
    });

    const getDailyMilk = (day) => {
        const entry = milkData.find(e => new Date(e.date).getDate() === day);
        return { qty: entry?.quantity || 0, amt: entry?.amount || 0 };
    };

    const totalQty = milkData.reduce((a, b) => a + (b.quantity || 0), 0);
    const totalAmt = milkData.reduce((a, b) => a + b.amount, 0);

    const handleLog = (day) => {
        const d = new Date(selectedYear, selectedMonth, day);
        onAddExpense({
            title: `Milk - ${logQty}L (${day} ${months[selectedMonth].slice(0, 3)})`,
            amount: Math.round(logQty * milkRate),
            quantity: logQty,
            category: 'Milk',
            type: 'expense',
            date: d.toISOString()
        });
        localStorage.setItem('zen_last_qty', logQty);
        setLoggingDay(null);
    };

    return (
        <div className="card glass-effect" style={{ padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🥛</span>
                    <h3 style={{ fontSize: '16px', margin: 0 }}>Milk Command Center</h3>
                </div>
                <button onClick={() => setIsConfiguring(!isConfiguring)} className="btn-text">
                    {isConfiguring ? 'Done' : 'Rate ✎'}
                </button>
            </div>

            {isConfiguring && (
                <div className="fade-in" style={{ padding: '15px', background: 'var(--bg-body)', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                    <label style={{ fontSize: '10px', display: 'block', marginBottom: '5px' }}>Price per Litre ({getSymbol()})</label>
                    <input type="number" step="0.5" className="form-control" value={milkRate} onChange={(e) => setMilkRate(Number(e.target.value))} />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="stat-card glass-effect" style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Monthly Qty</div>
                    <div style={{ fontSize: '15px', fontWeight: '800' }}>{totalQty.toFixed(2)} L</div>
                </div>
                <div className="stat-card glass-effect" style={{ padding: '12px', textAlign: 'center', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--primary)' }}>Monthly Cost</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>{formatCurrency(totalAmt)}</div>
                </div>
            </div>

            <div className="essentials-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="essentials-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Qty (L)</th>
                            <th>Amount</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {daysArray.map(day => {
                            const { qty, amt } = getDailyMilk(day);
                            const isToday = day === new Date().getDate() && selectedMonth === new Date().getMonth();
                            return (
                                <tr key={day} style={{ background: isToday ? 'var(--primary-bg)' : 'transparent' }}>
                                    <td style={{ fontWeight: isToday ? '800' : '400' }}>{day} {months[selectedMonth].slice(0, 3)}</td>
                                    <td>{qty > 0 ? `${qty.toFixed(2)}L` : '—'}</td>
                                    <td>{amt > 0 ? formatCurrency(amt) : '—'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {qty === 0 && loggingDay !== day && (
                                            <button onClick={() => setLoggingDay(day)} className="btn-log-sm">+ Log</button>
                                        )}
                                        {loggingDay === day && (
                                            <div className="fade-in logs-controls">
                                                <div className="chips">
                                                    {[0.5, 1, 1.5, 2].map(q => <span key={q} onClick={() => setLogQty(q)} className={logQty === q ? 'active' : ''}>{q}L</span>)}
                                                </div>
                                                <div className="counter">
                                                    <button onClick={() => setLogQty(Math.max(0.25, logQty - 0.25))}>−</button>
                                                    <span style={{ fontWeight: '800' }}>{logQty.toFixed(2)}L</span>
                                                    <button onClick={() => setLogQty(logQty + 0.25)}>+</button>
                                                </div>
                                                <div className="actions">
                                                    <button onClick={() => handleLog(day)} className="btn-save">Save</button>
                                                    <button onClick={() => setLoggingDay(null)} className="btn-cancel">✕</button>
                                                </div>
                                            </div>
                                        )}
                                        {qty > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                                <span style={{ color: 'var(--success)', fontSize: '11px', fontWeight: '700' }}>✅ Logged</span>
                                                <button
                                                    onClick={() => {
                                                        const entry = milkData.find(e => new Date(e.date).getDate() === day);
                                                        if (entry && window.confirm('Delete this milk entry?')) {
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

export default MilkTracker;
