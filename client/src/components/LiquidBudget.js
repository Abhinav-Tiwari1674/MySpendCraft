import { useContext } from 'react';
import CurrencyContext from '../context/CurrencyContext';
import { FaEdit } from 'react-icons/fa';

const LiquidBudget = ({ totalExpense, monthlyBudget, onUpdateBudget }) => {
    const { formatCurrency } = useContext(CurrencyContext);

    const handleEdit = () => {
        const newBudget = prompt('Enter new monthly budget:', monthlyBudget);
        if (newBudget !== null && !isNaN(newBudget) && newBudget > 0) {
            onUpdateBudget(Number(newBudget));
        }
    };

    // Calculate percentage (0 to 100)
    const percentage = Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100);
    const isHighSpend = percentage > 80;
    const isOverBudget = percentage >= 100;

    // Determine color based on threshold
    const liquidColor = isOverBudget ? '#ef4444' : (isHighSpend ? '#f59e0b' : '#f97316');
    const glowColor = isOverBudget ? 'rgba(239, 68, 68, 0.4)' : (isHighSpend ? 'rgba(245, 158, 11, 0.4)' : 'rgba(249, 115, 22, 0.4)');

    return (
        <div className="card glass-effect liquid-budget-card" style={{
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="card-header-mini" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Budget Consumption 🌊
                </span>
                <button
                    onClick={handleEdit}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', opacity: 0.6, padding: '4px' }}
                    title="Edit Budget"
                >
                    <FaEdit size={12} />
                </button>
            </div>

            <div className="liquid-container" style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                border: `4px solid ${isOverBudget ? 'var(--danger)' : 'rgba(255,255,255,0.05)'}`,
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.3)',
                boxShadow: `0 0 30px ${glowColor}, inset 0 0 20px rgba(0,0,0,0.5)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {/* Liquid fill */}
                <div className="liquid-fill" style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: `${percentage}%`,
                    background: liquidColor,
                    transition: 'height 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.5s ease',
                }}>
                    {/* Animated Waves */}
                    <div className="wave wave-1" style={{ fill: liquidColor }}></div>
                    <div className="wave wave-2" style={{ fill: liquidColor, opacity: 0.5 }}></div>
                </div>

                {/* Percentage Text Overlay */}
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{
                        fontSize: '42px',
                        fontWeight: '900',
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        {percentage}<span style={{ fontSize: '20px', opacity: 0.8 }}>%</span>
                    </div>
                </div>
            </div>

            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Spent</span>
                    <span style={{ fontWeight: '700', color: isOverBudget ? 'var(--danger)' : 'white' }}>{formatCurrency(totalExpense)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget</span>
                    <span style={{ fontWeight: '700' }}>{formatCurrency(monthlyBudget)}</span>
                </div>
            </div>

            {isOverBudget && (
                <div className="alert-badge" style={{
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '800',
                    marginTop: '5px',
                    animation: 'pulse-alert 2s infinite'
                }}>
                    ⚠️ LIMIT BREACHED
                </div>
            )}
        </div>
    );
};

export default LiquidBudget;
