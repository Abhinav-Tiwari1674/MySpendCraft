import { useState, useEffect, useContext } from 'react';
import CurrencyContext from '../context/CurrencyContext';

const NewspaperTracker = ({ allExpenses, onAddExpense, onDeleteExpense, selectedMonth, selectedYear }) => {
    const { formatCurrency, getSymbol } = useContext(CurrencyContext);
    const [paperRate, setPaperRate] = useState(() => Number(localStorage.getItem('zen_paper_rate')) || 10);
    const [isConfiguring, setIsConfiguring] = useState(false);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        localStorage.setItem('zen_paper_rate', paperRate);
    }, [paperRate]);

    const paperData = allExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && e.category === 'Newspaper';
    });

    const isPaperLogged = (day) => paperData.some(e => new Date(e.date).getDate() === day);

    const totalDays = paperData.length;
    const totalCost = paperData.reduce((a, b) => a + b.amount, 0);

    const togglePaper = (day) => {
        const existing = paperData.find(e => new Date(e.date).getDate() === day);
        if (existing) {
            if (window.confirm('Delete this newspaper entry?')) {
                onDeleteExpense(existing._id);
            }
            return;
        }

        const d = new Date(selectedYear, selectedMonth, day);
        onAddExpense({
            title: `Newspaper - (${day} ${months[selectedMonth].slice(0, 3)})`,
            amount: paperRate,
            quantity: 1,
            category: 'Newspaper',
            type: 'expense',
            date: d.toISOString()
        });
    };

    return (
        <div className="card glass-effect" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>📰</span>
                    <h3 style={{ fontSize: '16px', margin: 0 }}>Newspaper Hub</h3>
                </div>
                <button onClick={() => setIsConfiguring(!isConfiguring)} className="btn-text">
                    {isConfiguring ? 'Done' : 'Rate ✎'}
                </button>
            </div>

            {isConfiguring && (
                <div className="fade-in" style={{ padding: '15px', background: 'var(--bg-body)', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                    <label style={{ fontSize: '10px', display: 'block', marginBottom: '5px' }}>Daily Price ({getSymbol()})</label>
                    <input type="number" className="form-control" value={paperRate} onChange={(e) => setPaperRate(Number(e.target.value))} onWheel={(e) => e.target.blur()} />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="stat-card glass-effect" style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Days Logged</div>
                    <div style={{ fontSize: '15px', fontWeight: '800' }}>{totalDays} Days</div>
                </div>
                <div className="stat-card glass-effect" style={{ padding: '12px', textAlign: 'center', borderLeft: '4px solid #64748b' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Monthly Cost</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{formatCurrency(totalCost)}</div>
                </div>
            </div>

            <div className="essentials-scroll" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
                    {daysArray.map(day => {
                        const logged = isPaperLogged(day);
                        const isToday = day === new Date().getDate() && selectedMonth === new Date().getMonth();
                        return (
                            <div
                                key={day}
                                onClick={() => togglePaper(day)}
                                style={{
                                    padding: '10px 5px',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    cursor: logged ? 'default' : 'pointer',
                                    background: logged ? 'var(--success-bg)' : isToday ? 'var(--primary-bg)' : 'var(--bg-body)',
                                    border: `1px solid ${logged ? 'var(--success)' : isToday ? 'var(--primary)' : 'var(--border)'}`,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{day}</div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: logged ? 'var(--success)' : 'var(--text-main)' }}>
                                    {logged ? '✅' : '—'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                One-tap to mark newspaper as taken.
            </div>
        </div>
    );
};

export default NewspaperTracker;
