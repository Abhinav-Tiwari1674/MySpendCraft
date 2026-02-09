import { useState, useEffect, useContext } from 'react';
import { FaBullseye, FaCalendarCheck } from 'react-icons/fa';
import CurrencyContext from '../context/CurrencyContext';

const SavingsGoal = ({ monthlySavings }) => {
    const { formatCurrency, getSymbol } = useContext(CurrencyContext);
    const [goal, setGoal] = useState(() => {
        const saved = localStorage.getItem('expenseZen_goal');
        if (saved) return JSON.parse(saved);
        return { name: 'New iPhone', target: 150000 };
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState(goal);

    useEffect(() => {
        localStorage.setItem('expenseZen_goal', JSON.stringify(goal));
    }, [goal]);

    const handleSave = () => {
        setGoal(tempGoal);
        setIsEditing(false);
    };

    const progress = goal.target > 0 ? Math.min(Math.round((monthlySavings / goal.target) * 100), 100) : 0;
    const dailySavings = monthlySavings > 0 ? monthlySavings / 30 : 0;
    const remaining = goal.target - monthlySavings;
    const daysToTarget = dailySavings > 0 && remaining > 0 ? Math.ceil(remaining / dailySavings) : null;

    return (
        <div className="card glass-effect" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'var(--primary-bg)',
                filter: 'blur(40px)',
                borderRadius: '50%',
                opacity: 0.5,
                zIndex: 0
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        background: 'var(--brand-gradient)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '14px',
                        boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)'
                    }}>
                        <FaBullseye size={20} className="logo-pulse" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Savings Mission</h3>
                        <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Predictive Tracking</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '6px 12px',
                        borderRadius: '8px'
                    }}
                >
                    {isEditing ? 'Cancel' : 'Edit Goal'}
                </button>
            </div>

            {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="What are you saving for?"
                        value={tempGoal.name}
                        onChange={(e) => setTempGoal({ ...tempGoal, name: e.target.value })}
                        style={{ fontSize: '14px', height: '45px', background: 'var(--bg-body)' }}
                    />
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{getSymbol()}</span>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Target Amount"
                            value={tempGoal.target}
                            onChange={(e) => setTempGoal({ ...tempGoal, target: Number(e.target.value) })}
                            onWheel={(e) => e.target.blur()}
                            style={{ fontSize: '14px', height: '45px', paddingLeft: '35px', background: 'var(--bg-body)' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} style={{ height: '45px', fontWeight: '800' }}>
                        Set Destination
                    </button>
                </div>
            ) : (
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '800', fontSize: '18px', color: 'white' }}>{goal.name}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '14px' }}>{formatCurrency(goal.target)}</span>
                    </div>

                    <div style={{
                        width: '100%',
                        height: '16px',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        marginBottom: '15px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
                        position: 'relative'
                    }}>
                        <div
                            className="progress-active"
                            style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #f97316 0%, #fb923c 50%, #f97316 100%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 3s ease-in-out infinite',
                                borderRadius: '20px',
                                transition: 'width 2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: '0 0 20px rgba(249, 115, 22, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{
                                fontSize: '40px',
                                fontWeight: '900',
                                color: 'white',
                                letterSpacing: '-2px',
                                lineHeight: '1',
                                textShadow: '0 2px 10px rgba(249, 115, 22, 0.3)'
                            }}>
                                {progress}<span style={{ fontSize: '20px', color: 'var(--primary)', marginLeft: '4px' }}>%</span>
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                marginTop: '4px',
                                letterSpacing: '1px',
                                fontWeight: '700'
                            }}>Progress Complete</div>
                        </div>

                        {daysToTarget ? (
                            <div style={{
                                textAlign: 'right',
                                background: 'var(--primary-bg)',
                                color: 'var(--primary)',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '800',
                                border: '1px solid rgba(249, 115, 22, 0.2)'
                            }}>
                                <FaCalendarCheck style={{ marginRight: '6px' }} />
                                {daysToTarget} Days Left
                            </div>
                        ) : (
                            <div style={{
                                background: 'var(--success-bg)',
                                color: 'var(--success)',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '900'
                            }}>
                                Goal Reached! 🚀
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsGoal;
