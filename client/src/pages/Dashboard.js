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
import CustomSelect from '../components/CustomSelect';
import Sparkline from '../components/Sparkline';
import LiquidBudget from '../components/LiquidBudget';
import RecurringBills from '../components/RecurringBills';
import HouseholdManager from '../components/HouseholdManager';
import HouseholdHub from '../components/HouseholdHub';
import FeedbackSection from '../components/FeedbackSection';
import { FaArrowUp, FaArrowDown, FaWallet, FaUniversity, FaCreditCard, FaMoneyBillWave, FaDownload, FaCalendarAlt, FaSyncAlt, FaPlus, FaExclamationTriangle, FaEdit, FaCheckCircle, FaUtensils, FaShoppingBag, FaPlane, FaFilm, FaFileInvoice, FaShoppingCart, FaTrash, FaRobot, FaInfoCircle, FaExclamationCircle, FaThLarge, FaList, FaChartPie, FaPercentage, FaFileInvoiceDollar, FaUsers, FaCommentDots, FaTimes } from 'react-icons/fa';

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
    const [announcement, setAnnouncement] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const { loading, user } = useContext(AuthContext);
    const { formatCurrency, getSymbol } = useContext(CurrencyContext);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

    useEffect(() => {
        fetchExpenses();
        processRecurringBills();
        fetchAnnouncement();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Poll for announcements every 5 minutes
        const announcementTimer = setInterval(fetchAnnouncement, 5 * 60 * 1000);

        return () => {
            clearInterval(timer);
            clearInterval(announcementTimer);
        };
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const { data } = await api.get('/auth/announcement');
            if (data && data.isActive) {
                // Only show if it's a new announcement or user hasn't dismissed it
                const dismissedId = localStorage.getItem('dismissed_announcement');
                if (dismissedId !== data._id) {
                    setAnnouncement(data);
                }
            } else {
                setAnnouncement(null);
            }
        } catch (error) {
            console.error('Error fetching announcement', error);
        }
    };

    const handleDismissAnnouncement = () => {
        if (announcement) {
            localStorage.setItem('dismissed_announcement', announcement._id);
            setAnnouncement(null);
        }
    };

    const handleVersionRefresh = () => {
        handleDismissAnnouncement();
        window.location.reload();
    };


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

    const tabs = [
        { id: 'overview', icon: <FaThLarge />, label: 'Overview' },
        { id: 'expenses', icon: <FaList />, label: 'Expenses' },
        { id: 'analytics', icon: <FaChartPie />, label: 'Analytics' },
        { id: 'budget', icon: <FaPercentage />, label: 'Budget' },
        { id: 'bills', icon: <FaFileInvoiceDollar />, label: 'Bills' },
        { id: 'household', icon: <FaUsers />, label: 'Home Tracker' },
        { id: 'feedback', icon: <FaCommentDots />, label: 'Feedback' },
    ];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-body)' }}>
            <div className="loader">Loading MySpendCraft...</div>
        </div>
    );

    return (
        <div className="dash-container">
            <Navbar />

            <aside className="dash-sidebar">
                <nav className="sidebar-nav">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span className="sidebar-label">{tab.label}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="dash-main-content">
                {/* Premium Toast Notification */}
                {toast.visible && (
                    <div className="toast-container">
                        <div className={`toast ${toast.type}`}>
                            <div className="toast-icon">
                                {toast.type === 'success' && <FaCheckCircle />}
                                {toast.type === 'error' && <FaExclamationCircle />}
                                {toast.type === 'info' && <FaInfoCircle />}
                            </div>
                            <div className="toast-content">
                                <div className="toast-message">{toast.message}</div>
                            </div>
                        </div>
                    </div>
                )}

                {announcement && (
                    <div className="update-banner glass-effect slide-down" style={{
                        marginBottom: '30px',
                        padding: '15px 25px',
                        background: announcement.type === 'warning' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                        borderLeft: `4px solid ${announcement.type === 'warning' ? '#ef4444' : 'var(--primary)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ color: announcement.type === 'warning' ? '#ef4444' : 'var(--primary)', fontSize: '24px' }}>
                                {announcement.type === 'warning' ? <FaExclamationTriangle /> : <FaRobot />}
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '15px' }}>System Announcement</div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>{announcement.message}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleVersionRefresh} className="btn-glow-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                                <FaSyncAlt /> Refresh Now
                            </button>
                            <button onClick={handleDismissAnnouncement} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                                <FaTimes size={14} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="fade-in">
                    {activeTab === 'overview' && (
                        <div className="tab-container">
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
                                <div className="stat-card income slide-up glass-effect">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3>Total Income</h3>
                                        <div style={{ padding: '8px', background: 'var(--success-bg)', borderRadius: '10px', color: 'var(--success)' }}>
                                            <FaArrowUp size={16} />
                                        </div>
                                    </div>
                                    <p className="income-text">{formatCurrency(totalIncome)}</p>
                                    <Sparkline data={getSparklineData('income')} colorClass="income" />
                                </div>

                                <div className="stat-card expense slide-up glass-effect">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3>Total Expense</h3>
                                        <div style={{ padding: '8px', background: 'var(--danger-bg)', borderRadius: '10px', color: 'var(--danger)' }}>
                                            <FaArrowDown size={16} />
                                        </div>
                                    </div>
                                    <p className="expense-text">{formatCurrency(totalExpense)}</p>
                                    <Sparkline data={getSparklineData('expense')} colorClass="expense" />
                                </div>

                                <div className="premium-balance-card slide-up">
                                    <div className="balance-header">
                                        <div>
                                            <span className="balance-label">Total Balance</span>
                                            <h2 className="balance-amount">{formatCurrency(balance)}</h2>
                                        </div>
                                        <FaWallet size={20} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                {[
                                    { name: 'Cash', icon: <FaMoneyBillWave />, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                                    { name: 'Bank', icon: <FaUniversity />, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
                                    { name: 'Credit Card', icon: <FaCreditCard />, gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }
                                ].map(wallet => (
                                    <div key={wallet.name} className="card glass-effect slide-up" style={{
                                        padding: '20px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '-10px',
                                            width: '80px',
                                            height: '80px',
                                            background: wallet.gradient,
                                            filter: 'blur(30px)',
                                            opacity: 0.3,
                                            borderRadius: '50%'
                                        }} />
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                padding: '10px',
                                                background: wallet.gradient,
                                                borderRadius: '12px',
                                                marginBottom: '12px',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                                            }}>
                                                <div style={{ color: 'white', fontSize: '20px' }}>{wallet.icon}</div>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                                {wallet.name}
                                            </div>
                                            <div style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
                                                {formatCurrency(walletBalances[wallet.name])}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="tab-content-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
                                <ExpenseForm
                                    onAddExpense={addExpense}
                                    expenseToEdit={expenseToEdit}
                                    onUpdateExpense={updateExpense}
                                    clearEdit={() => setExpenseToEdit(null)}
                                    balance={balance}
                                />
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
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div className="tab-container" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
                            <ExpenseForm
                                onAddExpense={addExpense}
                                expenseToEdit={expenseToEdit}
                                onUpdateExpense={updateExpense}
                                clearEdit={() => setExpenseToEdit(null)}
                                balance={balance}
                            />
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
                    )}

                    {activeTab === 'analytics' && (
                        <div className="tab-content-grid">
                            <ExpenseChart expenses={partitionedExpenses} onSliceClick={(cat) => setFilterCategory(cat)} />
                            <ExpenseTrend expenses={partitionedExpenses} />
                            <div className="card glass-effect" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '800' }}>Category Breakdown</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {Object.entries(categorySpending).map(([cat, amount]) => (
                                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{cat}</span>
                                            <span style={{ fontWeight: '700' }}>{formatCurrency(amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <div className="tab-content-grid">
                            <LiquidBudget
                                totalExpense={totalExpense}
                                monthlyBudget={monthlyBudget}
                                onUpdateBudget={updateBudget}
                            />
                            <SavingsGoal monthlySavings={balance} />
                            <div className="card glass-effect" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaPercentage style={{ color: 'var(--primary)' }} />
                                    Budget Hub
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {['food', 'shopping', 'travel', 'entertainment', 'bills', 'grocery'].map(cat => {
                                        const spent = categorySpending[cat] || 0;
                                        const budget = categoryBudgets[cat] || 0;
                                        const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                                        const isOverBudget = spent > budget && budget > 0;
                                        const isWarning = percentage > 80 && percentage <= 100;
                                        const isGood = percentage <= 80;

                                        let barColor = 'var(--success)';
                                        if (isOverBudget) barColor = 'var(--danger)';
                                        else if (isWarning) barColor = '#f59e0b';

                                        return (
                                            <div key={cat} style={{
                                                background: 'rgba(255,255,255,0.02)',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <span style={{
                                                        textTransform: 'capitalize',
                                                        fontWeight: '700',
                                                        fontSize: '14px'
                                                    }}>{cat}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{
                                                            fontSize: '12px',
                                                            color: isOverBudget ? 'var(--danger)' : 'var(--text-muted)'
                                                        }}>
                                                            {formatCurrency(spent)} / {formatCurrency(budget)}
                                                        </span>
                                                        <BudgetInput
                                                            category={cat}
                                                            initialValue={budget}
                                                            onUpdate={handleUpdateCategoryBudget}
                                                            getSymbol={getSymbol}
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateCategoryBudget(cat, 0)}
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                borderRadius: '8px',
                                                                padding: '6px 8px',
                                                                cursor: 'pointer',
                                                                color: '#ef4444',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            title="Reset budget"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    width: '100%',
                                                    height: '8px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    borderRadius: '10px',
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{
                                                        width: `${percentage}%`,
                                                        height: '100%',
                                                        background: barColor,
                                                        borderRadius: '10px',
                                                        transition: 'width 0.5s ease, background 0.3s ease',
                                                        boxShadow: `0 0 10px ${barColor}`
                                                    }} />
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: barColor,
                                                    marginTop: '6px',
                                                    fontWeight: '700'
                                                }}>
                                                    {percentage.toFixed(0)}% {isOverBudget ? 'Over Budget!' : 'Used'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bills' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <RecurringBills />
                        </div>
                    )}

                    {activeTab === 'household' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <HouseholdHub
                                allExpenses={expenses}
                                onAddExpense={addExpense}
                                onDeleteExpense={deleteExpense}
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                            />
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <FeedbackSection />
                        </div>
                    )}
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
            </main>
        </div>
    );
};

const BudgetInput = ({ category, initialValue, onUpdate, getSymbol }) => {
    const [localValue, setLocalValue] = useState(initialValue || '');
    useEffect(() => { setLocalValue(initialValue || ''); }, [initialValue]);

    const handleBlur = () => {
        if (Number(localValue) !== Number(initialValue)) {
            onUpdate(category, localValue);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '8px', opacity: 0.5, fontSize: '11px' }}>{getSymbol()}</span>
            <input
                type="number"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                style={{
                    width: '80px',
                    padding: '4px 6px 4px 18px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '12px',
                    textAlign: 'right'
                }}
            />
        </div>
    );
};

export default Dashboard;
