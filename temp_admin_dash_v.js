import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import {
    FaArrowLeft, FaEnvelope, FaCheck, FaUser, FaClock,
    FaChartLine, FaUsers, FaDatabase, FaShieldAlt, FaSearch,
    FaChevronRight, FaFilter, FaTimes, FaStar, FaTrash,
    FaCheckCircle, FaExclamationCircle, FaInfoCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all'); // 'all', 'admin', 'user'
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);



    const [activeAction, setActiveAction] = useState(null);
    const [backupProgress, setBackupProgress] = useState(0);
    const [showLogs, setShowLogs] = useState(false);
    const [globalMessage, setGlobalMessage] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
    };

    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        if (stats) setRefreshing(true);
        else setLoading(true);

        try {
            const [statsRes, usersRes, messagesRes, feedbacksRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/contact'),
                api.get('/feedback')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setMessages(messagesRes.data);
            setFeedbacks(feedbacksRes.data);
            setLoading(false);
            setRefreshing(false);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
            setLoading(false);
            setRefreshing(false);
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                showToast('Data refresh failed. Please check your connection.', 'error');
            }
        }
    };

    const runBackup = async () => {
        setActiveAction('backup');
        setBackupProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setBackupProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setActiveAction(null);
                    showToast('Database backup completed successfully!');
                }, 500);
            }
        }, 300);
    };

    const sendBroadcast = async () => {
        if (!globalMessage.trim()) return;
        setActiveAction('sending');
        try {
            await api.post('/admin/broadcast', { message: globalMessage });
            setActiveAction('sent');
            setGlobalMessage('');
            showToast('Announcement broadcast successfully!');
        } catch (err) {
            setActiveAction(null);
            showToast('Failed to broadcast! Check connection.', 'error');
        }
    };

    const toggleAdminStatus = async (userId, currentStatus) => {
        try {
            const res = await api.patch(`/admin/users/${userId}`, { isAdmin: !currentStatus });
            setUsers(users.map(u => u._id === userId ? { ...u, isAdmin: res.data.isAdmin } : u));
            showToast(`User ${!currentStatus ? 'promoted to' : 'demoted from'} admin status!`, 'success');
        } catch (err) {
            showToast('Failed to update admin status', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you absolutely sure you want to remove this user? This action is IRREVERSIBLE.')) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            showToast('User removed successfully.', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to remove user', 'error');
        }
    };

    const markMessageRead = async (id) => {
        try {
            await api.patch(`/contact/${id}`, { status: 'read' });
            setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' } : m));
            setStats({ ...stats, newMessages: stats.newMessages - 1 });
        } catch (err) {
            console.error(err);
            showToast('Failed to mark message as read.', 'error');
        }
    };

    const handleReplySubmit = async (e, id) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            const res = await api.post(`/contact/${id}/reply`, { reply: replyText });
            setMessages(messages.map(m => m._id === id ? res.data : m));
            setReplyText('');
            setReplyingTo(null);
            showToast('Reply sent successfully!', 'success');
            fetchAllData();
        } catch (err) {
            showToast('Failed to send reply. Please try again.', 'error');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || (filterRole === 'admin' ? u.isAdmin : !u.isAdmin);
        return matchesSearch && matchesRole;
    });

    if (loading && !stats) return <div style={{ height: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><h1>Loading Crafting Panel...</h1></div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />


            {activeAction === 'backup' && (
                <div className="admin-overlay">
                    <div className="premium-modal">
                        <FaDatabase className="rotate" style={{ fontSize: '40px', color: '#10b981', marginBottom: '20px' }} />
                        <h3>Securing the Vault</h3>
                        <p>Backing up all financial records to the shadow realm...</p>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${backupProgress}%` }}></div>
                        </div>
                        <span style={{ fontSize: '12px', marginTop: '10px' }}>{backupProgress}% Encrypted</span>
                    </div>
                </div>
            )}

            {activeAction === 'broadcasting' && (
                <div className="admin-overlay">
                    <div className="premium-modal">
                        <h3>Global Broadcast</h3>
                        <textarea
                            value={globalMessage}
                            onChange={(e) => setGlobalMessage(e.target.value)}
                            placeholder="Enter message for all users..."
                            className="premium-textarea"
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={sendBroadcast} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>Send Update</button>
                            <button onClick={() => setActiveAction(null)} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {(activeAction === 'sending' || activeAction === 'sent') && (
                <div className="admin-overlay">
                    <div className="premium-modal">
                        {activeAction === 'sending' ? (
                            <>
                                <FaEnvelope className="bounce" style={{ fontSize: '40px', color: '#f97316', marginBottom: '20px' }} />
                                <h3>Broadcasting...</h3>
                            </>
                        ) : (
                            <>
                                <FaCheck style={{ fontSize: '40px', color: '#10b981', marginBottom: '20px' }} />
                                <h3>Broadcast Sent!</h3>
                                <p>Message delivered to all craftsmen.</p>
                                <button
                                    onClick={() => setActiveAction(null)}
                                    className="btn-glow-primary"
                                    style={{ marginTop: '20px', padding: '10px 30px' }}
                                >
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showLogs && (
                <div className="admin-overlay" onClick={() => setShowLogs(false)}>
                    <div className="side-drawer" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>System Logs</h2>
                            <button onClick={() => setShowLogs(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FaTimes /></button>
                        </div>
                        <div className="log-list">
                            <LogItem icon={<FaShieldAlt color="#10b981" />} text="Admin session verified" time="Just now" />
                            <LogItem icon={<FaUser color="#0ea5e9" />} text="New craftsman registered" time="2 hours ago" />
                            <LogItem icon={<FaEnvelope color="#f97316" />} text="Inquiry check complete" time="5 hours ago" />
                            <LogItem icon={<FaDatabase color="#8b5cf6" />} text="Automated cleanup ran" time="Yesterday" />
                            <LogItem icon={<FaShieldAlt color="#ef4444" />} text="Unauthorized access blocked" time="Yesterday" />
                        </div>
                    </div>
                </div>
            )}

            <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', marginTop: '80px' }}>


                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px' }}>Crafting Room</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Master. Here's what's happening today.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {refreshing && <div className="spinner-small"></div>}
                        <button
                            disabled={refreshing}
                            onClick={fetchAllData}
                            className="btn-secondary"
                            style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', opacity: refreshing ? 0.7 : 1 }}
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>
                </div>


                <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['overview', 'users', 'feedback', 'messages'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: 'none', border: 'none', padding: '15px 5px', color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab ? '700' : '500', cursor: 'pointer', position: 'relative', overflow: 'visible'
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '2px', background: 'var(--brand-primary)' }} />}
                        </button>
                    ))}
                </div>


                {activeTab === 'overview' && (
                    <div className="fade-in">

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <StatCard icon={<FaUsers />} label="Total Craftsmen" value={stats?.totalUsers} color="#f97316" />
                            <StatCard icon={<FaChartLine />} label="Total Expenses" value={stats?.totalExpenses} color="#8b5cf6" />
                            <StatCard icon={<FaEnvelope />} label="New Inquiries" value={stats?.newMessages} color="#0ea5e9" />
                            <StatCard icon={<FaDatabase />} label="Vault Status" value={stats?.dbStatus} color="#10b981" />
                        </div>


                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                            <div className="admin-card">
                                <h3>Quick Actions</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                                    <button onClick={() => setShowLogs(true)} className="dashboard-action-btn bronze">
                                        <div className="action-icon"><FaShieldAlt /></div>
                                        <span>System Logs</span>
                                    </button>
                                    <button onClick={() => setActiveAction('broadcasting')} className="dashboard-action-btn primary">
                                        <div className="action-icon"><FaEnvelope /></div>
                                        <span>Send Global Update</span>
                                    </button>
                                    <button onClick={() => setActiveTab('users')} className="dashboard-action-btn purple">
                                        <div className="action-icon"><FaUsers /></div>
                                        <span>Audit Activity</span>
                                    </button>
                                    <button onClick={runBackup} className="dashboard-action-btn green">
                                        <div className="action-icon"><FaDatabase /></div>
                                        <span>Database Backup</span>
                                    </button>
                                </div>
                            </div>
                            <div className="admin-card">
                                <h3>Server Info</h3>
                                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Environment</span><span>Production</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Uptime</span><span>99.99%</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Last Backup</span><span>2h ago</span></div>
                                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                                        All systems operational
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div className="search-bar" style={{ width: '300px' }}>
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search craftsmen..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="premium-input"
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: filterRole !== 'all' ? 'var(--brand-primary)' : '' }}
                                >
                                    <FaFilter /> Filter {filterRole !== 'all' && `(${filterRole})`}
                                </button>
                                {showFilterDropdown && (
                                    <>
                                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setShowFilterDropdown(false)} />
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '8px',
                                            background: '#1e293b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            padding: '8px',
                                            zIndex: 999,
                                            minWidth: '150px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                        }}>
                                            <div onClick={() => { setFilterRole('all'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '8px', background: filterRole === 'all' ? 'rgba(255,255,255,0.05)' : 'transparent', color: 'white', fontSize: '13px' }}>All Users</div>
                                            <div onClick={() => { setFilterRole('admin'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '8px', background: filterRole === 'admin' ? 'rgba(255,255,255,0.05)' : 'transparent', color: '#f97316', fontSize: '13px' }}>Admins Only</div>
                                            <div onClick={() => { setFilterRole('user'); setShowFilterDropdown(false); }} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '8px', background: filterRole === 'user' ? 'rgba(255,255,255,0.05)' : 'transparent', color: '#94a3b8', fontSize: '13px' }}>Regular Users</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u._id}>
                                            <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px' }}>{u.name[0]}</div>{u.name}</div></td>
                                            <td>{u.email}</td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td><span className={`status-badge ${u.isAdmin ? 'admin' : 'user'}`}>{u.isAdmin ? 'ADMIN' : 'USER'}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => toggleAdminStatus(u._id, u.isAdmin)}
                                                        className="table-action-btn"
                                                    >
                                                        {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                                    </button>
                                                    {!u.isAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="table-action-btn"
                                                            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {feedbacks.length === 0 ? (
                                <div className="admin-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '30px', marginBottom: '15px' }}>≡ƒìâ</div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>No feedback yet</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Craftsmen are quiet today.</p>
                                </div>
                            ) : (
                                feedbacks.map((fb) => (
                                    <div key={fb._id} className="admin-card" style={{
                                        borderTop: `4px solid ${fb.rating >= 4 ? '#10b981' : fb.rating <= 2 ? '#ef4444' : '#f97316'}`,
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '15px' }}>{fb.name}</h4>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fb.email}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <FaStar key={s} size={10} color={fb.rating >= s ? '#fbbf24' : 'rgba(255,255,255,0.1)'} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#e2e8f0', marginBottom: '15px' }}>"{fb.message}"</p>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
                                            {new Date(fb.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gap: '25px' }}>
                            {messages.length === 0 ? (
                                <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '20px' }}>≡ƒô⌐</div>
                                    <h3>Secure Inbox is Empty</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>No craftsman inquiries at the moment.</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg._id} className="admin-card" style={{
                                        borderLeft: `4px solid ${msg.status === 'new' ? 'var(--brand-primary)' : msg.status === 'replied' ? '#10b981' : 'rgba(255,255,255,0.05)'}`,
                                        background: 'rgba(255,255,255,0.03)',
                                        position: 'relative',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <div className="user-avatar" style={{ width: '48px', height: '48px', background: 'var(--brand-primary)', color: 'white' }}>
                                                    {msg.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{msg.name}</h3>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{msg.email}</span>
                                                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
                                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {msg.status === 'new' && <span className="status-badge new">URGENT</span>}
                                                {msg.status === 'replied' && <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>REPLIED</span>}
                                            </div>
                                        </div>

                                        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#e2e8f0', margin: 0, fontStyle: 'italic' }}>"{msg.message}"</p>
                                        </div>

                                        {msg.adminReply && (
                                            <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)', marginBottom: '20px', marginLeft: '30px', position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: '-15px', top: '20px', fontSize: '12px', color: '#10b981' }}>Γöö{'>'}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <FaShieldAlt size={12} color="#10b981" />
                                                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Response</span>
                                                </div>
                                                <p style={{ fontSize: '14px', color: '#10b981', margin: 0 }}>{msg.adminReply}</p>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                            {msg.status === 'new' && (
                                                <button onClick={() => markMessageRead(msg._id)} className="btn-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                                                    <FaCheck /> Mark Viewed
                                                </button>
                                            )}
                                            {replyingTo === msg._id ? (
                                                <div style={{ width: '100%', marginTop: '10px' }}>
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Craft your response..."
                                                        className="premium-textarea"
                                                        style={{ marginBottom: '15px' }}
                                                    />
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                        <button onClick={() => setReplyingTo(null)} className="btn-secondary" style={{ fontSize: '12px', padding: '8px 20px' }}>Cancel</button>
                                                        <button onClick={(e) => handleReplySubmit(e, msg._id)} className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 25px' }}>Send Reply</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setReplyingTo(msg._id)} className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 20px' }}>
                                                    <FaEnvelope style={{ marginRight: '8px' }} /> {msg.adminReply ? 'Update Reply' : 'Send Reply'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .admin-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 24px;
                    transition: all 0.3s ease;
                }
                .dashboard-action-btn {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    color: white;
                    padding: 15px;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: left;
                    overflow: hidden;
                    position: relative;
                }
                .dashboard-action-btn:hover {
                    background: rgba(255,255,255,0.08);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }
                .dashboard-action-btn .action-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: all 0.3s;
                }
                .dashboard-action-btn.bronze .action-icon { background: rgba(249, 115, 22, 0.1); color: #f97316; }
                .dashboard-action-btn.primary .action-icon { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
                .dashboard-action-btn.purple .action-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .dashboard-action-btn.green .action-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                
                .dashboard-action-btn:hover.bronze { border-color: #f97316; }
                .dashboard-action-btn:hover.primary { border-color: #0ea5e9; }
                .dashboard-action-btn:hover.purple { border-color: #8b5cf6; }
                .dashboard-action-btn:hover.green { border-color: #10b981; }


                .admin-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
                    z-index: 1000; display: flex; align-items: center; justify-content: center;
                    animation: fadeIn 0.3s ease;
                }
                .premium-modal {
                    background: #1e293b; border: 1px solid rgba(255,255,255,0.1);
                    padding: 40px; border-radius: 24px; text-align: center;
                    max-width: 400px; width: 90%; animation: slideUp 0.3s ease;
                }
                .progress-container {
                    width: 100%; height: 6px; background: rgba(255,255,255,0.05);
                    border-radius: 100px; margin-top: 30px; overflow: hidden;
                }
                .progress-bar { height: 100%; background: #10b981; transition: width 0.1s; }
                
                .premium-textarea {
                    width: 100%; height: 120px; background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
                    padding: 15px; color: white; margin-top: 20px; font-family: inherit;
                    resize: none;
                }
                .side-drawer {
                    position: absolute; right: 0; top: 0; bottom: 0; width: 350px;
                    background: #0f172a; border-left: 1px solid rgba(255,255,255,0.1);
                    padding: 40px 30px; animation: slideInRight 0.3s ease;
                    box-shadow: -10px 0 30px rgba(0,0,0,0.5);
                }
                .log-item {
                    display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .rotate { animation: rotate 2s linear infinite; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .bounce { animation: bounce 1s ease infinite; }

                .admin-table-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; }
                .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
                .admin-table th { background: rgba(255,255,255,0.03); padding: 15px 20px; font-size: 13px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
                .admin-table td { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .status-badge { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 800; }
                .status-badge.admin { background: rgba(249, 115, 22, 0.2); color: #f97316; }
                .status-badge.user { background: rgba(255,255,255,0.05); color: #94a3b8; }
                .status-badge.new { background: var(--brand-primary); color: white; }
                .table-action-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.3s; }
                .table-action-btn:hover { border-color: var(--brand-primary); color: var(--brand-primary); }

                    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.1);
                    border-top-color: var(--brand-primary); border-radius: 50%;
                    animation: rotate 0.6s linear infinite;
                }
            `}</style>
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
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
            width: '50px', height: '50px', borderRadius: '12px',
            background: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>{label}</div>
            <div style={{ fontSize: '24px', fontWeight: '800' }}>{value}</div>
        </div>
    </div>
);

const LogItem = ({ icon, text, time }) => (
    <div className="log-item" style={{ display: 'flex', gap: '15px', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ marginTop: '4px' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '4px' }}>{text}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{time}</div>
        </div>
    </div>
);

export default AdminDashboard;
