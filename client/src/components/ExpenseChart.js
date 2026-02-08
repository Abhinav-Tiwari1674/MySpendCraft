import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = ({ expenses, onSliceClick }) => {
    const expenseItems = expenses.filter(e => e.type === 'expense');

    // Group by category
    const categories = {};
    expenseItems.forEach(item => {
        if (categories[item.category]) {
            categories[item.category] += item.amount;
        } else {
            categories[item.category] = item.amount;
        }
    });

    const data = {
        labels: Object.keys(categories),
        datasets: [
            {
                data: Object.values(categories),
                backgroundColor: [
                    '#f97316',
                    '#10b981',
                    '#f59e0b',
                    '#3b82f6',
                    '#8b5cf6',
                    '#ec4899',
                ],
                borderWidth: 0,
                hoverOffset: 15
            },
        ],
    };

    return (
        <div className="card glass-effect" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '4px' }}>Expense Breakdown</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>Click a slice to filter list</p>
            {expenseItems.length > 0 ? (
                <div style={{ height: '280px', width: '100%', maxWidth: '300px', cursor: 'pointer' }}>
                    <Pie
                        data={data}
                        options={{
                            maintainAspectRatio: false,
                            onClick: (evt, elements) => {
                                if (elements.length > 0) {
                                    const index = elements[0].index;
                                    const label = data.labels[index];
                                    onSliceClick(label);
                                }
                            },
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        usePointStyle: true,
                                        padding: 15,
                                        font: { family: "'Inter', sans-serif", size: 11 }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            ) : (
                <div style={{ padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                    <p style={{ fontWeight: '500' }}>No expense data to visualize yet.</p>
                </div>
            )}
        </div>
    );
};

export default ExpenseChart;
