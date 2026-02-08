import { useState, useEffect, useContext } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import CurrencyContext from '../context/CurrencyContext';
import Navbar from '../components/Navbar';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseTrend from '../components/ExpenseTrend';
import SavingsGoal from '../components/SavingsGoal';
import MilkTracker from '../components/MilkTracker';
import NewspaperTracker from '../components/NewspaperTracker';
import CustomSelect from '../components/CustomSelect';
import Sparkline from '../components/Sparkline';
import LiquidBudget from '../components/LiquidBudget';
import RecurringBills from '../components/RecurringBills';
import HouseholdManager from '../components/HouseholdManager';
import { FaArrowUp, FaArrowDown, FaWallet, FaUniversity, FaCreditCard, FaDownload, FaCalendarAlt, FaSyncAlt, FaPlus, FaExclamationTriangle, FaEdit, FaCheckCircle, FaUtensils, FaShoppingBag, FaPlane, FaFilm, FaFileInvoice, FaShoppingCart, FaTrash, FaRobot } from 'react-icons/fa';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyBudget, setMonthlyBudget] = useState(() => {
        return Number(localStorage.getItem('myspendcraft_budget')) || 50000;
    });
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const { loading, user } = useContext(AuthContext);
    const { formatCurrency, getSymbol } = useContext(CurrencyContext);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

    useEffect(() => {
        fetchExpenses();
        processRecurringBills();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const processRecurringBills = async () => {
        try {
            await api.post('/recurring/process');
            fetchExpenses();
        } catch (error) {
            console.error('Error processing recurring bills', error);
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Title', 'Amount', 'Type', 'Category', 'Wallet', 'Note'];

        const rows = filteredExpenses.map(e => {
            const d = new Date(e.date);
            const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            return [
                dateStr,
                `"${e.title.replace(/"/g, '""')}"`,
                e.amount,
                e.type,
                e.category,
                e.wallet || 'Cash',
                `"${(e.note || '').replace(/"/g, '""')}"`
            ];
        });


        const csvString = "\ufeff" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MySpendCraft_${months[selectedMonth]}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast('Excel/CSV Report downloaded!');
    };

    const exportToPDF = () => {
        const doc = jsPDF();


        doc.rect(0, 0, 210, 40, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(255, 255, 255);
        doc.text('MySpendCraft', 14, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text('Premium Expense Report', 14, 32);


        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.text(`PERIOD: ${months[selectedMonth].toUpperCase()} ${selectedYear}`, 140, 50);
        doc.text(`USER: ${user?.name?.toUpperCase() || 'USER'}`, 140, 55);
        doc.text(`DATE: ${new Date().toLocaleDateString().toUpperCase()}`, 140, 60);


        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(14, 45, 110, 35, 3, 3, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(249, 115, 22);
        doc.text('FINANCIAL SUMMARY', 20, 54);

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");


        const currencyCode = user?.preferences?.currency || 'INR';
        const currencyLabel = currencyCode === 'INR' ? 'Rs.' : currencyCode;

        doc.text(`Total Income (${currencyCode}):`, 20, 62);
        doc.setFont("helvetica", "bold");
        doc.text(`${totalIncome.toLocaleString()}`, 60, 62);

        doc.setFont("helvetica", "normal");
        doc.text(`Total Expense:`, 20, 68);
        doc.setFont("helvetica", "bold");
        doc.text(`${totalExpense.toLocaleString()}`, 60, 68);

        doc.setFont("helvetica", "normal");
        doc.text(`Net Balance:`, 20, 74);
        doc.setFont("helvetica", "bold");

        if (balance >= 0) {
            doc.setTextColor(16, 185, 129);
        } else {
            doc.setTextColor(239, 68, 68);
        }
        doc.text(`${balance.toLocaleString()}`, 60, 74);


        const tableColumn = ["Date", "Description", "Category", "Wallet", "Type", `Amount (${user?.preferences?.currency || 'INR'})`];
        const tableRows = filteredExpenses.map(exp => [
            new Date(exp.date).toLocaleDateString(),
            exp.title,
            exp.category,
            exp.wallet || 'Cash',
            exp.type.toUpperCase(),
            exp.amount.toLocaleString()
        ]);

        autoTable(doc, {
            startY: 90,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: [249, 115, 22],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                5: { halign: 'right', fontStyle: 'bold' }
            },
            alternateRowStyles: { fillColor: [252, 252, 252] },
            styles: { fontSize: 9, cellPadding: 4 },
            margin: { left: 14, right: 14 }
        });

        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount} - Generated by MySpendCraft`, 14, 285);
        }

        doc.save(`MySpendCraft_Report_${months[selectedMonth]}_${selectedYear}.pdf`);
        showToast('Premium PDF Report downloaded!');
    };

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
    };

    const fetchExpenses = async () => {
        try {
            const { data } = await api.get('/expenses');
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses', error);
            showToast('Failed to load expenses', 'error');
        }
    };

    const addExpense = async (expenseData) => {
        try {
            const { data } = await api.post('/expenses', expenseData);
            setExpenses([data, ...expenses]);
            showToast('Transaction added successfully!');
        } catch (error) {
            console.error('Error adding expense', error);
            const errMsg = error.response?.data?.message || error.message || 'Failed to add transaction';
            showToast(errMsg, 'error');
        }
    };

    const updateExpense = async (id, expenseData) => {
        try {
            const { data } = await api.put(`/expenses/${id}`, expenseData);
            setExpenses(expenses.map(exp => exp._id === id ? data : exp));
            showToast('Transaction updated!');
        } catch (error) {
            console.error('Error updating expense', error);
            showToast('Update failed', 'error');
        }
    };

    const deleteExpense = async (id) => {
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses(expenses.filter(exp => exp._id !== id));
            showToast('Transaction deleted');
        } catch (error) {
            console.error('Error deleting expense', error);
            showToast('Deletion failed', 'error');
        }
    };


    const partitionedExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === selectedMonth && expDate.getFullYear() === selectedYear;
    });

    const sortedExpenses = [...partitionedExpenses].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'date') { valA = new Date(valA); valB = new Date(valB); }
        if (sortConfig.direction === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
    });

    const filteredExpenses = sortedExpenses.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === '' || exp.category === filterCategory;
        const matchesType = filterType === 'all' || exp.type === filterType;
        return matchesSearch && matchesCategory && matchesType;
    });

    const totalIncome = partitionedExpenses
        .filter(exp => exp.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = partitionedExpenses
        .filter(exp => exp.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    const walletBalances = partitionedExpenses.reduce((acc, exp) => {
        const amt = exp.type === 'income' ? exp.amount : -exp.amount;
        acc[exp.wallet] = (acc[exp.wallet] || 0) + amt;
        return acc;
    }, { 'Cash': 0, 'Bank': 0, 'Credit Card': 0 });

    const [categoryBudgets, setCategoryBudgets] = useState({});

    const categorySpending = partitionedExpenses
        .filter(exp => exp.type === 'expense')
        .reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

    useEffect(() => {
        if (user && user.categoryBudgets) {
            setCategoryBudgets(user.categoryBudgets);
        }
    }, [user]);

    const handleUpdateCategoryBudget = async (category, amount) => {
        try {
            const newBudgets = { ...categoryBudgets, [category]: Number(amount) };
            await api.put('/auth/preferences', { categoryBudgets: newBudgets });
            setCategoryBudgets(newBudgets);
            showToast(`${category} budget updated!`);
        } catch (error) {
            console.error('Error updating category budget', error);
            showToast('Failed to update budget', 'error');
        }
    };

    const getComparisonData = () => {
        const prevMonth = (selectedMonth - 1 + 12) % 12;
        const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

        const prevMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear && e.type === 'expense';
        }).reduce((a, b) => a + b.amount, 0);

        const changePercent = prevMonthExpenses > 0 ? Math.round(((totalExpense - prevMonthExpenses) / prevMonthExpenses) * 100) : 0;
        return changePercent;
    };

    const expenseChange = getComparisonData();

    const updateBudget = (newBudget) => {
        setMonthlyBudget(newBudget);
        localStorage.setItem('myspendcraft_budget', newBudget);
        showToast('Monthly budget updated!');
    };

    const getSparklineData = (type) => {
        const relevantExpenses = partitionedExpenses
            .filter(e => e.type === type)
            .sort((a, b) => new Date(a.date) - new Date(b.date));


        if (relevantExpenses.length === 0) return [0, 0];
        if (relevantExpenses.length === 1) return [0, relevantExpenses[0].amount];
        return relevantExpenses.map(e => e.amount);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-body)' }}>
            <div className="loader">Loading...</div>
        </div>
    );

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <div className="landing-hero-glow" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navbar />
                <div className="container fade-in">
                    {toast.visible && (
                        <div className={`toast ${toast.type}`}>
                            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                        </div>
                    )}


                    <div className="dashboard-header-glass slide-down">
                        <div className="header-left">
                            <h1 className="greeting-text">
                                Welcome back, {user?.name?.split(' ')[0] || 'User'}! <span style={{ fontSize: '20px' }}>✨</span>
                            </h1>
                            <div className="date-display">
                                <FaCalendarAlt />
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '16px', color: 'var(--primary)' }}>
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        <div className="header-controls">
                            <CustomSelect
                                value={selectedMonth}
                                options={months.map((m, i) => ({ value: i, label: m }))}
                                onChange={(val) => setSelectedMonth(val)}
                                width="160px"
                            />

                            <CustomSelect
                                value={selectedYear}
                                options={years.map(y => ({ value: y, label: y.toString() }))}
                                onChange={(val) => setSelectedYear(val)}
                                width="140px"
                            />

                            <button className="btn-glow-primary" onClick={exportToPDF} style={{ marginRight: '10px' }}>
                                <FaDownload /> PDF Report
                            </button>
                            <button className="btn-glow-primary" onClick={exportToCSV} style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>
                                <FaDownload /> CSV Report
                            </button>
                        </div>
                    </div>

                    <div className="stat-cards">
                        <div className={`stat-card income slide-up glass-effect`} style={{ animationDelay: '0.1s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>Total Income</h3>
                                <div style={{ padding: '8px', background: 'var(--success-bg)', borderRadius: '10px', color: 'var(--success)' }}>
                                    <FaArrowUp size={16} />
                                </div>
                            </div>
                            <p className="income-text">{formatCurrency(totalIncome)}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div className="insight-text">For {months[selectedMonth]} {selectedYear}</div>
                                <Sparkline data={getSparklineData('income')} colorClass="income" />
                            </div>
                        </div>

                        <div className={`stat-card expense slide-up glass-effect`} style={{ animationDelay: '0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>Total Expense</h3>
                                <div style={{ padding: '8px', background: 'var(--danger-bg)', borderRadius: '10px', color: 'var(--danger)' }}>
                                    <FaArrowDown size={16} />
                                </div>
                            </div>
                            <p className="expense-text">{formatCurrency(totalExpense)}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div className="insight-text">
                                    <span className={`percent-badge ${expenseChange > 0 ? 'down' : 'up'}`}>
                                        {expenseChange > 0 ? '+' : ''}{expenseChange}%
                                    </span> vs last month
                                </div>
                                <Sparkline data={getSparklineData('expense')} colorClass="expense" />
                            </div>
                        </div>

                        <div className="premium-balance-card slide-up" style={{ animationDelay: '0.3s' }}>
                            <div className="balance-header">
                                <div>
                                    <span className="balance-label">Total Balance</span>
                                    <h2 className="balance-amount">{formatCurrency(balance)}</h2>
                                </div>
                                <div className="balance-icon-badge">
                                    <FaWallet size={20} />
                                </div>
                            </div>

                            <div className="balance-chart">
                                {[45, 65, 50, 80, 60, 90, 75, 85, 60, 95, 70, 80].map((h, i) => (
                                    <div
                                        key={i}
                                        className="chart-bar"
                                        style={{
                                            height: `${h}%`,
                                            animationDelay: `${0.4 + (i * 0.05)}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>


                    <div className="card glass-effect slide-up" style={{ animationDelay: '0.35s', marginBottom: '24px', padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '20px', borderRight: '1px solid var(--border)', minWidth: '120px' }}>
                                <FaWallet style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Wallets</span>
                            </div>
                            <div style={{ display: 'flex', gap: '30px', flex: 1 }}>
                                {[
                                    { id: 'Cash', icon: <FaWallet />, color: '#fbbf24' },
                                    { id: 'Bank', icon: <FaUniversity />, color: '#60a5fa' },
                                    { id: 'Credit Card', icon: <FaCreditCard />, color: '#f87171' }
                                ].map(wallet => (
                                    <div key={wallet.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: `${wallet.color}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: wallet.color,
                                            fontSize: '20px'
                                        }}>
                                            {wallet.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>{wallet.id}</div>
                                            <div style={{ fontSize: '16px', fontWeight: '900', color: walletBalances[wallet.id] < 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                                                {formatCurrency(walletBalances[wallet.id])}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="left-panel slide-up" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <ExpenseForm
                                onAddExpense={addExpense}
                                expenseToEdit={expenseToEdit}
                                onUpdateExpense={updateExpense}
                                clearEdit={() => setExpenseToEdit(null)}
                                balance={balance}
                            />
                            <NewspaperTracker
                                allExpenses={expenses}
                                onAddExpense={addExpense}
                                onDeleteExpense={deleteExpense}
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                            />
                            <LiquidBudget
                                totalExpense={totalExpense}
                                monthlyBudget={monthlyBudget}
                                onUpdateBudget={updateBudget}
                            />
                            <SavingsGoal monthlySavings={balance} />

                        </div>

                        <div className="center-panel slide-up" style={{ animationDelay: '0.5s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <ExpenseList
                                expenses={filteredExpenses}
                                onDelete={deleteExpense}
                                onEdit={(exp) => setExpenseToEdit(exp)}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                filterCategory={filterCategory}
                                setFilterCategory={setFilterCategory}
                                filterType={filterType}
                                setFilterType={setFilterType}
                                clearFilter={() => { setFilterCategory(''); setFilterType('all'); }}
                                sortConfig={sortConfig}
                                setSortConfig={setSortConfig}
                            />
                        </div>

                        <div className="right-panel slide-up" style={{ animationDelay: '0.6s', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            <div className="card glass-effect" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px', borderRadius: '10px' }}>
                                        <FaExclamationTriangle />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Budget Hub</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {['food', 'shopping', 'travel', 'entertainment', 'bills', 'grocery'].map(cat => {
                                        const spent = categorySpending[cat] || 0;
                                        const budget = categoryBudgets[cat] || 0;
                                        const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                                        const isOver = budget > 0 && spent > budget;

                                        const getCatIcon = (c) => {
                                            switch (c) {
                                                case 'food': return <FaUtensils />;
                                                case 'shopping': return <FaShoppingBag />;
                                                case 'travel': return <FaPlane />;
                                                case 'entertainment': return <FaFilm />;
                                                case 'bills': return <FaFileInvoice />;
                                                case 'grocery': return <FaShoppingCart />;
                                                default: return <FaWallet />;
                                            }
                                        };

                                        return (
                                            <div key={cat} style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px',
                                                padding: '12px',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                                        <div style={{ color: 'var(--primary)', fontSize: '14px', opacity: 0.8, flexShrink: 0 }}>
                                                            {getCatIcon(cat)}
                                                        </div>
                                                        <span style={{
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            textTransform: 'capitalize',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {cat}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                            <input
                                                                type="number"
                                                                placeholder="Limit"
                                                                value={budget || ''}
                                                                onChange={(e) => handleUpdateCategoryBudget(cat, e.target.value)}
                                                                onWheel={(e) => e.target.blur()}
                                                                style={{
                                                                    width: '75px',
                                                                    fontSize: '11px',
                                                                    background: 'rgba(0,0,0,0.3)',
                                                                    border: '1px solid var(--border)',
                                                                    borderRadius: '6px',
                                                                    color: 'white',
                                                                    padding: '4px 6px 4px 16px',
                                                                    textAlign: 'right',
                                                                    fontWeight: '700',
                                                                    outline: 'none',
                                                                    transition: 'all 0.3s ease',
                                                                    appearance: 'textfield',
                                                                    WebkitAppearance: 'none',
                                                                    margin: 0
                                                                }}
                                                            />
                                                            <div style={{ position: 'absolute', left: '6px', pointerEvents: 'none', opacity: 0.4, fontSize: '9px' }}>
                                                                {getSymbol()}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUpdateCategoryBudget(cat, 0)}
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                color: 'var(--danger)',
                                                                padding: '4px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s ease',
                                                                opacity: budget > 0 ? 1 : 0.3
                                                            }}
                                                            title="Clear Budget"
                                                        >
                                                            <FaTrash size={10} />
                                                        </button>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '0 2px' }}>/</span>
                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: isOver ? 'var(--danger)' : 'var(--text-main)' }}>
                                                            {formatCurrency(spent)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                                                    <div style={{
                                                        width: `${percent}%`,
                                                        height: '100%',
                                                        background: isOver ? 'var(--danger)' : 'linear-gradient(90deg, var(--primary), #fb923c)',
                                                        boxShadow: isOver ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none',
                                                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        borderRadius: '10px'
                                                    }} />
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '600', color: isOver ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                        {isOver ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <FaExclamationTriangle size={8} /> Limit Exceeded!
                                                            </span>
                                                        ) : (
                                                            `${Math.round(percent)}% used`
                                                        )}
                                                    </div>
                                                    {budget > 0 && !isOver && (
                                                        <div style={{ fontSize: '9px', color: 'var(--success)', fontWeight: '600' }}>
                                                            {formatCurrency(budget - spent)} left
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <RecurringBills />

                            <MilkTracker
                                allExpenses={expenses}
                                onAddExpense={addExpense}
                                onDeleteExpense={deleteExpense}
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                            />


                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '10px' }}>
                                <ExpenseChart
                                    expenses={partitionedExpenses}
                                    onSliceClick={(cat) => setFilterCategory(cat)}
                                />
                                <ExpenseTrend expenses={partitionedExpenses} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fab-container slide-up" style={{ animationDelay: '1s' }}>
                <button
                    className="fab-btn"
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        const titleInput = document.querySelector('input[name="title"]');
                        if (titleInput) titleInput.focus();
                    }}
                    title="Add New Transaction"
                >
                    <FaPlus />
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
