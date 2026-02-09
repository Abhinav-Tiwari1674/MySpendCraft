import { useState } from 'react';
import MilkTracker from './MilkTracker';
import NewspaperTracker from './NewspaperTracker';
import WashermanTracker from './WashermanTracker';

const HouseholdHub = ({ allExpenses, onAddExpense, onDeleteExpense, selectedMonth, selectedYear }) => {
    const [activeTab, setActiveTab] = useState('milk');

    const tabs = [
        { id: 'milk', label: 'Milk', icon: '🥛' },
        { id: 'newspaper', label: 'Paper', icon: '📰' },
        { id: 'washerman', label: 'Laundry', icon: '🧺' }
    ];

    return (
        <div className="card glass-effect household-hub-card" style={{ padding: '12px' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px', display: 'flex', gap: '5px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            padding: '8px 5px',
                            color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: activeTab === tab.id ? '800' : '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="hub-content fade-in" key={activeTab}>
                {activeTab === 'milk' && (
                    <MilkTracker
                        allExpenses={allExpenses}
                        onAddExpense={onAddExpense}
                        onDeleteExpense={onDeleteExpense}
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                    />
                )}
                {activeTab === 'newspaper' && (
                    <NewspaperTracker
                        allExpenses={allExpenses}
                        onAddExpense={onAddExpense}
                        onDeleteExpense={onDeleteExpense}
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                    />
                )}
                {activeTab === 'washerman' && (
                    <WashermanTracker
                        allExpenses={allExpenses}
                        onAddExpense={onAddExpense}
                        onDeleteExpense={onDeleteExpense}
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                    />
                )}
            </div>

            <style>{`
                .household-hub-card .card {
                    background: none !important;
                    border: none !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                }
                .essentials-table th, .essentials-table td {
                    padding: 8px 10px !important;
                    font-size: 12px !important;
                }
                .essentials-table {
                    border-spacing: 0;
                    width: 100%;
                }
                .btn-log-sm {
                    padding: 4px 10px !important;
                    font-size: 11px !important;
                }
            `}</style>
        </div>
    );
};

export default HouseholdHub;
