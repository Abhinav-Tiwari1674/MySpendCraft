import { useContext, useEffect, useState } from 'react';
import { FaExclamationTriangle, FaLightbulb, FaFire, FaChartLine } from 'react-icons/fa';
import CurrencyContext from '../context/CurrencyContext';

const IntelligentConsole = ({
    expenses,
    balance,
    totalIncome,
    totalExpense,
    allExpenses,
    monthlyBudget,
    onUpdateBudget
}) => {
    const { formatCurrency, getSymbol } = useContext(CurrencyContext);
    const [streak, setStreak] = useState(0);

    // --- Time Analysis ---
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = daysInMonth - currentDay + 1;

    // --- Daily Allocation Logic ---
    const remainingBudget = Math.max(0, monthlyBudget - totalExpense);
    const dailySafeAllowance = Math.round(remainingBudget / daysRemaining);

    // --- Performance Stats ---
    const dailyAvg = currentDay > 0 ? totalExpense / currentDay : 0;
    const projectedSpend = Math.round(dailyAvg * daysInMonth);

    // Today's Spend
    const todayStr = now.toISOString().split('T')[0];
    const todaySpend = expenses
        .filter(e => e.type === 'expense' && e.date.split('T')[0] === todayStr)
        .reduce((a, b) => a + b.amount, 0);

    const isOverDaily = todaySpend > dailySafeAllowance;
    const allowanceUsage = dailySafeAllowance > 0 ? (todaySpend / dailySafeAllowance) * 100 : 0;

    // --- Trend Sparkline Data (Last 7 Days) ---
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayTotal = expenses
            .filter(e => e.type === 'expense' && e.date.split('T')[0] === dateStr)
            .reduce((a, b) => a + b.amount, 0);
        return dayTotal;
    });

    const maxTrend = Math.max(...last7Days, 1);
    const sparklinePath = last7Days.map((val, i) => `${(i / 6) * 100},${100 - (val / maxTrend) * 90}`).join(' L ');

    // --- Zen Insights Logic ---
    const getZenInsight = () => {
        if (totalExpense === 0) return "Add your first transaction to unlock AI insights.";
        if (projectedSpend > monthlyBudget) return "Current projection exceeds budget. Avoid luxury spends this week.";
        if (todaySpend === 0) return "Zero spend today! Your saving streak is active. Keep it up.";
        if (isOverDaily) return "Today's spend is high. Tomorrow, try to stay under 50% of your shield.";
        return "You're spending like a Pro. Elite status maintained.";
    };

    // --- Saving Streak Simulation ---
    useEffect(() => {
        const savedStreak = parseInt(localStorage.getItem('zen_streak') || "0");
        const lastCheck = localStorage.getItem('zen_streak_last_check');

        if (lastCheck !== todayStr) {
            if (todaySpend <= dailySafeAllowance && dailySafeAllowance > 0) {
                const newStreak = savedStreak + 1;
                setStreak(newStreak);
                localStorage.setItem('zen_streak', newStreak.toString());
            } else if (isOverDaily) {
                setStreak(0);
                localStorage.setItem('zen_streak', "0");
            }
            localStorage.setItem('zen_streak_last_check', todayStr);
        } else {
            setStreak(savedStreak);
        }
    }, [todaySpend, dailySafeAllowance, todayStr, isOverDaily]);

    // --- Category Thresholds ---
    const categoryTotals = {};
    expenses.filter(e => e.type === 'expense').forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const categoryAlerts = Object.keys(categoryTotals).filter(cat => categoryTotals[cat] > (monthlyBudget * 0.25));

    const handleBudgetEdit = () => {
        const val = prompt(`Set your monthly budget (${getSymbol()}):`, monthlyBudget);
        if (val && !isNaN(val)) onUpdateBudget(Number(val));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Daily Spend Shield & Zen Insight */}
            <div className="card glass-effect" style={{
                padding: '24px',
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* Card Header with Streak */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    gap: '10px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: 'var(--text-muted)',
                        textAlign: 'left'
                    }}>
                        Daily Spend Shield 🛡️
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: '800',
                        color: 'var(--primary)',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                    }}>
                        <FaFire /> {streak} DAY STREAK
                    </div>
                </div>

                <div style={{ fontSize: '48px', fontWeight: '900', color: isOverDaily ? 'var(--danger)' : 'white', lineHeight: '1' }}>
                    {formatCurrency(dailySafeAllowance)}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>
                    Safe limit to stay under budget
                </div>

                {/* Zen Insight Card */}
                <div style={{
                    marginTop: '25px',
                    padding: '15px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px',
                    textAlign: 'left',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <FaLightbulb style={{ color: 'var(--primary)', marginTop: '3px', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>Zen Insight</div>
                        <div style={{ fontSize: '12px', color: 'white', marginTop: '4px', lineHeight: '1.4' }}>{getZenInsight()}</div>
                    </div>
                </div>

                {/* Allowance Meter */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '20px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${Math.min(allowanceUsage, 100)}%`,
                        height: '100%',
                        background: isOverDaily ? 'var(--danger)' : 'var(--brand-gradient)',
                        transition: 'width 1s ease'
                    }} />
                </div>
            </div>

            {/* Threshold Alerts */}
            {categoryAlerts.length > 0 && (
                <div className="card glass-effect alert-flash" style={{ padding: '20px', borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <FaExclamationTriangle style={{ color: 'var(--danger)' }} />
                        <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--danger)', fontWeight: '800' }}>Threshold Breached</h3>
                    </div>
                    {categoryAlerts.map(cat => (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                            <span style={{ textTransform: 'capitalize', fontWeight: '700' }}>{cat}</span>
                            <span style={{ color: 'var(--danger)', fontWeight: '800' }}>{formatCurrency(categoryTotals[cat])}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Burn Projection & Trends */}
            <div className="card glass-effect" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Month-End Projection</div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: projectedSpend > monthlyBudget ? 'var(--danger)' : 'var(--success)' }}>
                        {formatCurrency(projectedSpend)}
                    </div>

                    {/* Sparkline Trend */}
                    <div style={{ height: '40px', marginTop: '20px', position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path
                                d={`M ${sparklinePath}`}
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                style={{ strokeDasharray: 200, strokeDashoffset: 0, animation: 'progress-shimmer 2s ease forwards' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', bottom: '-15px', left: 0, width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text-muted)' }}>
                            <span>7d ago</span>
                            <span>Today</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card glass-effect" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px', cursor: 'pointer' }} onClick={handleBudgetEdit}>BUDGET ✎</div>
                    <div style={{ fontSize: '20px', fontWeight: '900' }}>{formatCurrency(monthlyBudget)}</div>
                </div>
                <div className="card glass-effect" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px' }}>TODAY</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: isOverDaily ? 'var(--danger)' : 'white' }}>{formatCurrency(todaySpend)}</div>
                </div>
            </div>
        </div>
    );
};

export default IntelligentConsole;
