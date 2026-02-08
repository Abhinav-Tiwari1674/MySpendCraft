import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import CurrencyContext from '../context/CurrencyContext';
import { FaCalendarAlt, FaPlus, FaTrash, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const RecurringBills = () => {
    const [bills, setBills] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const { formatCurrency } = useContext(CurrencyContext);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'bills',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        wallet: 'Bank'
    });

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const { data } = await api.get('/recurring');
            setBills(data);
        } catch (error) {
            console.error('Error fetching recurring bills', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/recurring', formData);
            fetchBills();
            setIsAdding(false);
            setFormData({
                title: '',
                amount: '',
                category: 'bills',
                frequency: 'monthly',
                startDate: new Date().toISOString().split('T')[0],
                wallet: 'Bank'
            });
        } catch (error) {
            console.error('Error adding recurring bill', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/recurring/${id}`);
            fetchBills();
        } catch (error) {
            console.error('Error deleting recurring bill', error);
        }
    };

    return (
        <div className="card glass-effect" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '10px' }}>
                        <FaCalendarAlt />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Recurring Bills</h3>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    style={{
                        background: 'var(--primary)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isAdding ? <FaPlus style={{ transform: 'rotate(45deg)' }} /> : <FaPlus />}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <input
                        type="text"
                        placeholder="Bill Title (e.g. Netflix)"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        style={{ height: '48px', fontSize: '14px', padding: '0 15px' }}
                    />
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <input
                            type="number"
                            placeholder="Amount"
                            className="form-control"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            onWheel={(e) => e.target.blur()}
                            required
                            style={{ height: '48px', fontSize: '14px', flex: 1, minWidth: 0, padding: '0 15px' }}
                        />
                        <select
                            className="form-control"
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            style={{
                                height: '48px',
                                fontSize: '14px',
                                flex: 1.2,
                                minWidth: 0,
                                padding: '0 15px',
                                cursor: 'pointer',
                                background: 'rgba(2, 6, 23, 0.8)'
                            }}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            className="form-control"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                            style={{ height: '48px', fontSize: '14px', padding: '0 15px', width: '100%' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '14px', fontWeight: '800', marginTop: '5px' }}>Schedule Bill</button>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bills.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        No recurring bills scheduled yet.
                    </div>
                ) : (
                    bills.map(bill => {
                        const nextDate = new Date(bill.nextDate);
                        const today = new Date();
                        const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
                        const isDueSoon = diffDays <= 3 && diffDays >= 0;

                        return (
                            <div key={bill._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                background: isDueSoon ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)',
                                borderRadius: '10px',
                                border: isDueSoon ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {isDueSoon && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '3px',
                                        height: '100%',
                                        background: 'var(--danger)',
                                        boxShadow: '0 0 10px var(--danger)'
                                    }} />
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ color: isDueSoon ? 'var(--danger)' : 'var(--primary)', fontSize: '18px' }}>
                                        {isDueSoon ? <FaExclamationTriangle className="alert-flash" /> : <FaClock />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {bill.title}
                                            {isDueSoon && <span style={{ fontSize: '8px', background: 'var(--danger)', color: 'white', padding: '1px 4px', borderRadius: '4px', textTransform: 'uppercase' }}>Due Soon</span>}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                            {bill.frequency} • Next: {nextDate.toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{formatCurrency(bill.amount)}</div>
                                    <button
                                        onClick={() => handleDelete(bill._id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RecurringBills;
