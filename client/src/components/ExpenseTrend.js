import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ExpenseTrend = ({ expenses }) => {
    // Get last 7 days labels
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
    }

    // Process data
    const last7DaysData = new Array(7).fill(0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    expenses.filter(e => e.type === 'expense').forEach(exp => {
        const expDate = new Date(exp.date);
        const diffTime = Math.abs(today - expDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;

        if (diffDays >= 0 && diffDays < 7) {
            last7DaysData[6 - diffDays] += exp.amount;
        }
    });

    const data = {
        labels: days,
        datasets: [
            {
                label: 'Spending',
                data: last7DaysData,
                fill: true,
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#f97316',
                borderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                displayColors: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11 } }
            },
        },
    };

    return (
        <div className="card glass-effect" style={{ height: '310px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px' }}>Trend Analysis</h3>
            {expenses.filter(e => e.type === 'expense').length > 0 ? (
                <div style={{ height: '210px' }}>
                    <Line data={data} options={options} />
                </div>
            ) : (
                <div style={{ padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.5 }}>📉</div>
                    <p style={{ fontSize: '13px' }}>Add expenses to see trend patterns.</p>
                </div>
            )}
        </div>
    );
};

export default ExpenseTrend;
