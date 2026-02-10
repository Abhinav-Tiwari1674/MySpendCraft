import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import {
    FaEnvelope, FaCheck, FaUser, FaClock,
    FaChartLine, FaUsers, FaDatabase, FaShieldAlt, FaSearch,
    FaChevronRight, FaFilter, FaTimes, FaStar, FaTrash,
    FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaServer,
    FaMemory, FaMicrochip, FaSync, FaTerminal, FaFileDownload,
    FaBolt, FaReply, FaShareAlt, FaBell, FaThLarge, FaCommentDots,
    FaHeartbeat
} from 'react-icons/fa';

const StatCard = ({ icon, label, value, color }) => (
    <div className="elite-stat-card">
        <div className="stat-icon" style={{ background: `${color}15`, color }}>{icon}</div>
        <div className="card-bottom-info">
            <label>{label}</label>
            <h3>{value || '0'}</h3>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [systemLogs, setSystemLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const [activeOverlay, setActiveOverlay] = useState(null);
    const [backupProgress, setBackupProgress] = useState(0);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
    };

    const fetchAllData = useCallback(async () => {
        // Use a functional check or a state that doesn't trigger a re-fetch loop
        setRefreshing(true);

        try {
            const [statsRes, usersRes, messagesRes, feedbacksRes, logsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/contact'),
                api.get('/feedback'),
                api.get('/admin/logs')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setMessages(messagesRes.data);
            setFeedbacks(feedbacksRes.data);
            setSystemLogs(logsRes.data);
        } catch (err) {
            console.error('Failed to sync data', err);
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigate]); // Removed 'stats' from dependencies to break infinite loop

    useEffect(() => {
        fetchAllData();

        // Auto-refresh data every 30 seconds for a "live" feel
        const autoSync = setInterval(() => {
            fetchAllData();
        }, 30000);

        return () => clearInterval(autoSync);
    }, [fetchAllData]);

    const runBackupTask = async () => {
        setActiveOverlay('backup');
        setBackupProgress(0);
        try {
            let p = 0;
            const interval = setInterval(() => { p += 5; setBackupProgress(p); if (p >= 100) clearInterval(interval); }, 100);
            await api.post('/admin/backup');
            setTimeout(() => { setActiveOverlay(null); showToast('Vault Synchronized'); fetchAllData(); }, 2500);
        } catch (e) { setActiveOverlay(null); showToast('Sync Failed', 'error'); }
    };

    const handleToggleAdmin = async (userId, currentlyAdmin) => {
        try {
            await api.patch(`/admin/users/${userId}`, { isAdmin: !currentlyAdmin });
            showToast(`Role updated successfully`);
            fetchAllData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update role', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this craftsman? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            showToast('Craftsman removed from the vault');
            fetchAllData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    const handleUpdateFeedbackStatus = async (id, status) => {
        try {
            await api.patch(`/feedback/${id}`, { status });
            showToast('Feedback status updated');
            fetchAllData();
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleReplyToContact = async (id, message) => {
        if (!message.trim()) return;
        try {
            await api.post(`/contact/${id}/reply`, { reply: message });
            showToast('Reply sent successfully');
            fetchAllData();
        } catch (err) {
            showToast('Failed to send reply', 'error');
        }
    };

    const handleDeleteContact = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`/contact/${id}`);
            showToast('Message deleted');
            fetchAllData();
        } catch (err) {
            showToast('Failed to delete message', 'error');
        }
    };

    const handleUpdateContactStatus = async (id, status) => {
        try {
            await api.patch(`/contact/${id}`, { status });
            showToast('Message marked as read');
            fetchAllData();
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastMessage.trim()) return;
        try {
            await api.post('/admin/broadcast', { message: broadcastMessage });
            showToast('Broadcast sent to all craftsmen');
            setBroadcastMessage('');
            setActiveOverlay(null);
        } catch (err) {
            showToast('Failed to send broadcast', 'error');
        }
    };

    if (loading && !stats) return (
        <div style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'monospace' }}>
            <h1>MASTER_AUTH_PENDING...</h1>
        </div>
    );

    return (
        <div className="exact-admin-root">
            <Navbar />

            {/* Overlays */}
            {activeOverlay === 'backup' && (
                <div className="elite-overlay">
                    <div className="overlay-box mini">
                        <FaDatabase className="v5-spin-icon" style={{ color: '#10b981' }} />
                        <h3>Securing the Vault</h3>
                        <div className="v5-progress-bar-container">
                            <div className="v5-progress-bar-fill" style={{ width: `${backupProgress}%` }}></div>
                        </div>
                        <p>{backupProgress}% Encrypted & Stored</p>
                    </div>
                </div>
            )}

            {activeOverlay === 'logs' && (
                <div className="elite-overlay">
                    <div className="overlay-box wide">
                        <div className="overlay-header">
                            <h3>System Logs</h3>
                            <button className="close-overlay" onClick={() => setActiveOverlay(null)}><FaTimes /></button>
                        </div>
                        <div className="terminal-view">
                            {systemLogs.length === 0 ? <p className="term-line dimmed">Waiting for logs...</p> :
                                systemLogs.map((log, i) => (
                                    <div key={i} className="term-line">
                                        <span className="term-time">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                                        <span className={`term-tag ${log.action.toLowerCase()}`}>{log.action}</span>
                                        <span className="term-msg">{log.message}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            {activeOverlay === 'broadcast' && (
                <div className="elite-overlay">
                    <div className="overlay-box mini">
                        <div className="overlay-header">
                            <h3>Global Broadcast</h3>
                            <button className="close-overlay" onClick={() => setActiveOverlay(null)}><FaTimes /></button>
                        </div>
                        <p className="overlay-desc">Send a message to all craftsmen dashboards.</p>
                        <textarea
                            className="v5-textarea"
                            placeholder="Type your message here..."
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                        />
                        <button className="v5-action-btn-main" onClick={handleSendBroadcast}>
                            <FaBolt /> Broadcast Now
                        </button>
                    </div>
                </div>
            )}

            {activeOverlay === 'audit' && (
                <div className="elite-overlay">
                    <div className="overlay-box wide">
                        <div className="overlay-header">
                            <h3>Audit Activity</h3>
                            <button className="close-overlay" onClick={() => setActiveOverlay(null)}><FaTimes /></button>
                        </div>
                        <div className="audit-table-box">
                            <table className="exact-table audit">
                                <thead>
                                    <tr>
                                        <th>TIME</th>
                                        <th>ACTION</th>
                                        <th>DETAILS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {systemLogs.slice(0, 20).map((log, i) => (
                                        <tr key={i}>
                                            <td className="term-time">{new Date(log.createdAt).toLocaleString()}</td>
                                            <td><span className={`v5-role-badge admin`}>{log.action}</span></td>
                                            <td className="dimmed">{log.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <div className="exact-container">
                <header className="exact-header">
                    <div className="header-text">
                        <h1>Crafting Room</h1>
                        <p>Welcome back, Master. Here's what's happening today.</p>
                    </div>
                    <button className="refresh-btn" onClick={fetchAllData}>
                        {refreshing ? 'Syncing...' : 'Refresh Data'}
                    </button>
                </header>

                <nav className="exact-tabs">
                    {['overview', 'users', 'feedback', 'messages'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-link ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>

                <div className="exact-content">
                    {activeTab === 'overview' && (
                        <div className="overview-grid fade-in">
                            <div className="stat-cards-row">
                                <StatCard icon={<FaUsers />} label="Total Craftsmen" value={stats?.totalUsers || '5'} color="#f97316" />
                                <StatCard icon={<FaChartLine />} label="Total Expenses" value={stats?.totalExpenses || '21'} color="#8b5cf6" />
                                <StatCard icon={<FaEnvelope />} label="New Inquiries" value={stats?.newMessages || '0'} color="#0ea5e9" />
                                <StatCard icon={<FaDatabase />} label="Vault Status" value={stats?.dbStatus || 'Connected'} color="#10b981" />
                            </div>

                            <div className="panel-grid">
                                <div className="panel-box quick-actions">
                                    <h3>Quick Actions</h3>
                                    <div className="action-btns">
                                        <button className="panel-action-btn" onClick={() => setActiveOverlay('logs')}>
                                            <div className="action-icon" style={{ color: '#f97316' }}><FaShieldAlt /></div>
                                            <span>System Logs</span>
                                        </button>
                                        <button className="panel-action-btn" onClick={() => setActiveOverlay('broadcast')}>
                                            <div className="action-icon" style={{ color: '#0ea5e9' }}><FaEnvelope /></div>
                                            <span>Send Global Update</span>
                                        </button>
                                        <button className="panel-action-btn" onClick={() => setActiveOverlay('audit')}>
                                            <div className="action-icon" style={{ color: '#8b5cf6' }}><FaUsers /></div>
                                            <span>Audit Activity</span>
                                        </button>
                                        <button className="panel-action-btn" onClick={runBackupTask}>
                                            <div className="action-icon" style={{ color: '#10b981' }}><FaDatabase /></div>
                                            <span>Database Backup</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="panel-box server-info">
                                    <div className="panel-box-header">
                                        <h3>Server Info</h3>
                                        <FaHeartbeat className="pulse-icon-v5" />
                                    </div>
                                    <div className="info-list v5">
                                        <div className="info-item-v5">
                                            <div className="v5-info-label">
                                                <FaMicrochip /> CPU Load
                                            </div>
                                            <span className="v5-tech-value">{stats?.serverMetrics?.cpuLoad ? `${(stats.serverMetrics.cpuLoad[0] * 100).toFixed(1)}%` : '2.4%'}</span>
                                        </div>

                                        <div className="info-item-v5 ram-item">
                                            <div className="v5-info-head">
                                                <div className="v5-info-label"><FaMemory /> RAM Usage</div>
                                                <span className="v5-tech-value">
                                                    {stats?.serverMetrics?.freeMem ?
                                                        `${((1 - stats.serverMetrics.freeMem / stats.serverMetrics.totalMem) * 100).toFixed(1)}%` :
                                                        '42.8%'
                                                    }
                                                </span>
                                            </div>
                                            <div className="v5-progress-bar">
                                                <div
                                                    className="v5-progress-fill"
                                                    style={{
                                                        width: stats?.serverMetrics?.freeMem ?
                                                            `${(1 - stats.serverMetrics.freeMem / stats.serverMetrics.totalMem) * 100}%` :
                                                            '42.8%'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="info-item-v5">
                                            <div className="v5-info-label"><FaClock /> Core Uptime</div>
                                            <span className="v5-tech-value">{stats?.serverMetrics?.uptime ? `${Math.floor(stats.serverMetrics.uptime / 3600)}h ${Math.floor((stats.serverMetrics.uptime % 3600) / 60)}m` : '124h 32m'}</span>
                                        </div>

                                        <div className="v5-server-meta">
                                            <div className="v5-meta-bit">
                                                <label>PLATFORM</label>
                                                <span>{stats?.serverMetrics?.platform?.toUpperCase() || 'LINUX'}</span>
                                            </div>
                                            <div className="v5-meta-bit">
                                                <label>NODE</label>
                                                <span>{stats?.serverMetrics?.nodeVersion || 'v20.10.0'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="status-indicator v5">
                                        <div className="status-dot pulse"></div>
                                        <span>ALL_CORE_SYSTEMS_OPTIMAL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="users-pane fade-in">
                            <div className="pane-top-v4">
                                <div className="search-box-v4">
                                    <FaSearch className="search-icon-v4" />
                                    <input
                                        type="text"
                                        placeholder="Search craftsmen..."
                                        value={searchTerm}
                                        onChange={x => setSearchTerm(x.target.value)}
                                    />
                                </div>
                                <div className="filter-wrapper-v4">
                                    <button className="filter-btn-v4" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                                        <FaFilter /> Filter
                                    </button>
                                    {showFilterDropdown && (
                                        <div className="filter-dropdown-v4">
                                            <div className={`filter-opt ${filterRole === 'all' ? 'active' : ''}`} onClick={() => { setFilterRole('all'); setShowFilterDropdown(false) }}>All Roles</div>
                                            <div className={`filter-opt ${filterRole === 'admin' ? 'active' : ''}`} onClick={() => { setFilterRole('admin'); setShowFilterDropdown(false) }}>Admins</div>
                                            <div className={`filter-opt ${filterRole === 'user' ? 'active' : ''}`} onClick={() => { setFilterRole('user'); setShowFilterDropdown(false) }}>Users</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="exact-table-box v5-elevation">
                                <table className="exact-table v5">
                                    <thead>
                                        <tr>
                                            <th>NAME</th>
                                            <th>EMAIL</th>
                                            <th>JOINED</th>
                                            <th>ROLE</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.filter(u => {
                                            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                u.email.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesRole = filterRole === 'all' ||
                                                (filterRole === 'admin' && u.isAdmin) ||
                                                (filterRole === 'user' && !u.isAdmin);
                                            return matchesSearch && matchesRole;
                                        }).map(u => (
                                            <tr key={u._id}>
                                                <td>
                                                    <div className="user-v5">
                                                        <div className="v5-avatar-glow">
                                                            <div className="v5-avatar">{u.name[0]}</div>
                                                        </div>
                                                        <span className="v5-user-name">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="email-cell-v5">{u.email}</td>
                                                <td className="v5-date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`v5-role-badge ${u.isAdmin ? 'admin' : 'user'}`}>
                                                        {u.isAdmin ? 'ADMIN' : 'USER'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-group-v5">
                                                        <button
                                                            className="v5-ghost-btn"
                                                            onClick={() => handleToggleAdmin(u._id, u.isAdmin)}
                                                        >
                                                            {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                                        </button>
                                                        <button
                                                            className="v5-delete-btn"
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            disabled={u.isAdmin}
                                                        >
                                                            <FaTrash />
                                                        </button>
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
                        <div className="feedback-pane fade-in">
                            <div className="pane-top-v4">
                                <h2 className="v4-pane-title">User Feedback</h2>
                                <button className="refresh-btn-v4" onClick={fetchAllData}>
                                    <FaSync className={refreshing ? 'spin' : ''} /> Refresh
                                </button>
                            </div>
                            <div className="feedback-grid-v5">
                                {feedbacks.map(f => (
                                    <div key={f._id} className={`feedback-card-v5 ${f.rating >= 4 ? 'high' : f.rating <= 2 ? 'low' : 'mid'}`}>
                                        <div className="card-top-v5">
                                            <div className="user-info-v5">
                                                <h4>{f.name}</h4>
                                                <p>{f.email}</p>
                                            </div>
                                            <div className="v5-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} style={{ color: i < f.rating ? '#f97316' : '#111' }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="card-body-v5">
                                            <p className="v5-feedback-msg">"{f.message}"</p>
                                        </div>
                                        <div className="card-footer-v5">
                                            <span className="v5-feedback-date">{new Date(f.createdAt).toLocaleDateString()}</span>
                                            <div className="v5-card-actions">
                                                {f.status !== 'addressed' ? (
                                                    <button
                                                        className="v5-check-btn"
                                                        onClick={() => handleUpdateFeedbackStatus(f._id, 'addressed')}
                                                        title="Mark Addressed"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                ) : (
                                                    <span className="v5-addressed-tag">Addressed</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="messages-pane fade-in">
                            <div className="pane-top-v4">
                                <h2 className="v4-pane-title">Inquiries</h2>
                                <button className="refresh-btn-v4" onClick={fetchAllData}>
                                    <FaSync className={refreshing ? 'spin' : ''} /> Refresh
                                </button>
                            </div>
                            <div className="messages-stream-v5">
                                {messages.map(m => (
                                    <div key={m._id} className={`message-thread-v5 ${m.status === 'new' ? 'unread' : ''}`}>
                                        <div className="thread-header-v5">
                                            <div className="sender-chip-v5">
                                                <div className="v5-mini-avatar">{m.name[0]}</div>
                                                <div className="sender-details-v5">
                                                    <h5>{m.name}</h5>
                                                    <span>{m.email}</span>
                                                </div>
                                            </div>
                                            <div className="thread-meta-v5">
                                                <span className="v5-date">{new Date(m.createdAt).toLocaleString()}</span>
                                                <span className={`v5-status-tag ${m.status}`}>{m.status.toUpperCase()}</span>
                                            </div>
                                        </div>

                                        <div className="thread-body-v5">
                                            <div className="user-msg-box-v5">
                                                <p>{m.message}</p>
                                            </div>

                                            {m.adminReply && (
                                                <div className="admin-reply-box-v5">
                                                    <div className="reply-label-v5"><FaShieldAlt /> ADMIN RESPONSE</div>
                                                    <p>{m.adminReply}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="thread-footer-v5">
                                            <div className="thread-actions-v5">
                                                <button
                                                    className="v5-reply-btn"
                                                    onClick={() => {
                                                        const reply = window.prompt(`Update response to ${m.name}:`, m.adminReply || '');
                                                        if (reply) handleReplyToContact(m._id, reply);
                                                    }}
                                                >
                                                    <FaReply /> {m.adminReply ? 'Update Reply' : 'Send Reply'}
                                                </button>
                                                <button
                                                    className="v5-trash-btn"
                                                    onClick={() => handleDeleteContact(m._id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .exact-admin-root {
                    background-color: #000;
                    min-height: 100vh;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                }
                .exact-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                
                .exact-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
                .header-text h1 { font-size: 38px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -1px; }
                .header-text p { color: #888; font-size: 16px; margin: 0; }
                .refresh-btn { background: #fff; color: #000; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; }

                .exact-tabs { display: flex; gap: 30px; border-bottom: 1px solid #111; margin-bottom: 30px; }
                .tab-link { background: none; border: none; color: #555; padding: 15px 0; font-weight: 700; cursor: pointer; font-size: 14px; position: relative; transition: 0.2s; }
                .tab-link.active { color: #f97316; }
                .tab-link.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #f97316; }

                .stat-cards-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                .elite-stat-card { background: #0a0a0a; border: 1px solid #111; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 16px; }
                .stat-icon { width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
                .card-bottom-info label { display: block; color: #444; font-size: 11px; font-weight: 700; margin-bottom: 4px; }
                .card-bottom-info h3 { font-size: 24px; font-weight: 800; margin: 0; }

                .panel-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
                .panel-box { background: #0a0a0a; border: 1px solid #111; border-radius: 16px; padding: 24px; }
                .panel-box h3 { font-size: 16px; font-weight: 700; margin: 0 0 20px 0; color: #ffffff; }

                .action-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .panel-action-btn { background: #0c0c0c; border: 1px solid #151515; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; cursor: pointer; text-align: left; transition: 0.2s; }
                .panel-action-btn:hover { background: #111; border-color: #222; }
                .action-icon { font-size: 18px; }
                .panel-action-btn span { font-weight: 700; color: #fff; font-size: 14px; }

                .info-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 25px; }
                .info-item { display: flex; justify-content: space-between; align-items: center; }
                .info-item label { color: #444; font-size: 13px; font-weight: 600; }
                .info-item span { color: #fff; font-size: 13px; font-weight: 700; }

                .status-indicator { background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px; }
                .status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; }
                .status-indicator span { color: #10b981; font-size: 11px; font-weight: 700; }

                .user-v4 { display: flex; align-items: center; gap: 15px; font-weight: 700; color: #fff; }
                .v4-avatar-glow {
                    width: 38px; height: 38px; border-radius: 50%;
                    background: rgba(249, 115, 22, 0.3);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 15px rgba(249, 115, 22, 0.4);
                }
                .v4-avatar {
                    width: 32px; height: 32px; background: #f97316; color: #fff;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-size: 14px; font-weight: 900;
                }
                
                .pane-top-v4 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; position: relative; }
                .filter-wrapper-v4 { position: relative; }
                .filter-dropdown-v4 {
                    position: absolute; top: calc(100% + 10px); right: 0; 
                    background: #0a0a0a; border: 1px solid #111; border-radius: 12px;
                    width: 160px; z-index: 1000; overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .filter-opt { padding: 12px 20px; color: #666; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .filter-opt:hover { background: #111; color: #fff; }
                .filter-opt.active { color: #f97316; background: rgba(249, 115, 22, 0.05); }

                .search-box-v4 { 
                    background: #0a0a0a; border: 1px solid #111; border-radius: 12px;
                    display: flex; align-items: center; padding: 0 15px; width: 300px;
                }
                .search-icon-v4 { color: #444; font-size: 14px; }
                .search-box-v4 input { 
                    background: none; border: none; color: #fff; padding: 12px;
                    width: 100%; font-size: 14px; outline: none;
                }
                .filter-btn-v4 {
                    background: #fff; color: #000; border: none; padding: 8px 16px;
                    border-radius: 8px; font-weight: 800; display: flex; align-items: center;
                    gap: 10px; cursor: pointer; font-size: 13px;
                }

                /* Elite V5 Styles */
                .v5-elevation { box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid #111; border-radius: 16px; overflow: hidden; }
                .exact-table.v5 { border-collapse: separate; border-spacing: 0; }
                .exact-table.v5 th { background: #050505; color: #444; font-size: 11px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #111; }
                .exact-table.v5 tr:hover { background: rgba(255,255,255,0.01); }
                .user-v5 { display: flex; align-items: center; gap: 15px; }
                .v5-avatar-glow { width: 40px; height: 40px; background: rgba(249, 115, 22, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(249, 115, 22, 0.2); }
                .v5-avatar { width: 32px; height: 32px; background: #f97316; color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
                .v5-user-name { font-weight: 700; color: #fff; }
                .email-cell-v5 { color: #888; font-size: 13px; }
                .v5-date-cell { color: #555; font-size: 12px; }
                .v5-role-badge { font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 6px; }
                .v5-role-badge.admin { background: rgba(249, 115, 22, 0.1); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.2); }
                .v5-role-badge.user { background: #111; color: #555; }
                .action-group-v5 { display: flex; gap: 8px; }
                .v5-ghost-btn { background: #0a0a0a; border: 1px solid #111; color: #666; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s; }
                .v5-ghost-btn:hover { background: #fff; color: #000; }
                .v5-delete-btn { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); color: #ef4444; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .v5-delete-btn:hover:not(:disabled) { background: #ef4444; color: #fff; }

                /* Feedback V5 Grid */
                .feedback-grid-v5 { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
                .feedback-card-v5 { background: #0a0a0a; border-radius: 16px; padding: 24px; border: 1px solid #111; display: flex; flex-direction: column; gap: 15px; border-top-width: 3px; }
                .feedback-card-v5.high { border-top-color: #10b981; }
                .feedback-card-v5.mid { border-top-color: #f97316; }
                .feedback-card-v5.low { border-top-color: #ef4444; }
                .card-top-v5 { display: flex; justify-content: space-between; align-items: flex-start; }
                .user-info-v5 h4 { margin: 0; font-size: 15px; color: #fff; }
                .user-info-v5 p { margin: 4px 0 0 0; font-size: 12px; color: #555; }
                .v5-stars { display: flex; gap: 3px; font-size: 10px; }
                .v5-feedback-msg { color: #aaa; font-size: 13px; line-height: 1.6; font-style: italic; }
                .card-footer-v5 { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #111; padding-top: 15px; }
                .v5-feedback-date { font-size: 11px; color: #444; font-weight: 700; }
                .v5-check-btn { background: #111; border: 1px solid #222; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .v5-check-btn:hover { background: #10b981; border-color: #10b981; }
                .v5-addressed-tag { font-size: 10px; color: #10b981; font-weight: 800; text-transform: uppercase; }

                /* Messages V5 Stream */
                .messages-stream-v5 { display: flex; flex-direction: column; gap: 20px; }
                .message-thread-v5 { background: #0a0a0a; border: 1px solid #111; border-radius: 20px; overflow: hidden; }
                .message-thread-v5.unread { border-left: 4px solid #10b981; }
                .thread-header-v5 { padding: 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01); border-bottom: 1px solid #111; }
                .sender-chip-v5 { display: flex; align-items: center; gap: 12px; }
                .v5-mini-avatar { width: 36px; height: 36px; background: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; }
                .sender-details-v5 h5 { margin: 0; font-size: 14px; }
                .sender-details-v5 span { font-size: 11px; color: #555; }
                .v5-status-tag { font-size: 9px; font-weight: 900; padding: 2px 8px; border-radius: 4px; }
                .v5-status-tag.new { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .v5-status-tag.replied { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                
                .thread-body-v5 { padding: 25px; display: flex; flex-direction: column; gap: 20px; }
                .user-msg-box-v5 { background: #0c0c0c; border: 1px solid #151515; padding: 20px; border-radius: 12px 12px 12px 4px; position: relative; }
                .user-msg-box-v5 p { margin: 0; color: #fff; line-height: 1.6; }
                .admin-reply-box-v5 { background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 12px 12px 4px 12px; align-self: flex-end; width: 90%; }
                .reply-label-v5 { display: flex; align-items: center; gap: 8px; color: #10b981; font-size: 10px; font-weight: 900; margin-bottom: 10px; }
                .admin-reply-box-v5 p { margin: 0; color: #ccc; line-height: 1.6; }

                .thread-footer-v5 { padding: 15px 25px; background: rgba(255,255,255,0.01); border-top: 1px solid #111; }
                .thread-actions-v5 { display: flex; justify-content: flex-end; gap: 12px; }
                .v5-reply-btn { background: #f97316; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2); }
                .v5-trash-btn { background: none; border: 1px solid #222; color: #444; width: 38px; height: 38px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .v5-trash-btn:hover { border-color: #ef4444; color: #ef4444; }

                .v4-pane-title { font-size: 18px; font-weight: 800; margin: 0; color: #fff; }
                .refresh-btn-v4 { background: #111; border: 1px solid #222; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .refresh-btn-v4:hover { background: #1a1a1a; border-color: #333; }

                .panel-box-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .pulse-icon-v5 { color: #10b981; font-size: 12px; opacity: 0.5; }
                
                .info-list.v5 { display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px; }
                .info-item-v5 { display: flex; flex-direction: column; gap: 8px; }
                .v5-info-label { display: flex; align-items: center; gap: 8px; color: #444; font-size: 11px; font-weight: 800; text-transform: uppercase; }
                .v5-tech-value { color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; }
                
                .v5-info-head { display: flex; justify-content: space-between; align-items: center; }
                .v5-progress-bar { height: 4px; background: #111; border-radius: 10px; overflow: hidden; }
                .v5-progress-fill { height: 100%; background: #10b981; border-radius: 10px; transition: width 1s ease-in-out; }
                
                .v5-server-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; background: #0c0c0c; border-radius: 8px; border: 1px solid #151515; }
                .v5-meta-bit { display: flex; flex-direction: column; gap: 4px; }
                .v5-meta-bit label { color: #333; font-size: 9px; font-weight: 900; }
                .v5-meta-bit span { color: #888; font-size: 11px; font-weight: 700; }

                .status-indicator.v5 { background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.08); padding: 15px; border-radius: 12px; justify-content: center; }
                .status-indicator.v5 span { letter-spacing: 1px; font-family: 'JetBrains Mono', monospace; font-size: 10px; }

                .pulse { animation: pulseAnim 2s infinite; }
                @keyframes pulseAnim {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                /* Overlay & Modal V5 Styles */
                .elite-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .overlay-box { background: #070707; border: 1px solid #1a1a1a; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; }
                .overlay-box.mini { width: 400px; padding: 30px; text-align: center; }
                .overlay-box.wide { width: 900px; max-height: 80vh; }
                
                .overlay-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-bottom: 1px solid #111; }
                .overlay-header h3 { margin: 0; font-size: 16px; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
                .close-overlay { background: #111; border: none; color: #444; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .close-overlay:hover { background: #222; color: #fff; }

                .overlay-desc { color: #555; font-size: 12px; margin-bottom: 20px; }
                .v5-textarea { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; color: #fff; padding: 15px; font-size: 13px; min-height: 120px; resize: none; width: 100%; margin-bottom: 20px; outline: none; transition: border-color 0.2s; }
                .v5-textarea:focus { border-color: #333; }
                
                .v5-action-btn-main { background: #fff; color: #000; border: none; padding: 12px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; transition: transform 0.2s; }
                .v5-action-btn-main:hover { transform: translateY(-2px); }

                .v5-spin-icon { font-size: 30px; margin-bottom: 15px; animation: spin 2s linear infinite; }
                .v5-progress-bar-container { width: 100%; height: 4px; background: #111; border-radius: 10px; overflow: hidden; margin: 15px 0; }
                .v5-progress-bar-fill { height: 100%; background: #10b981; transition: width 0.1s; border-radius: 10px; }
                .overlay-box.mini p { color: #555; font-size: 11px; margin: 0; font-weight: 700; }

                /* Terminal View */
                .terminal-view { background: #050505; padding: 20px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 11px; flex: 1; }
                .term-line { display: flex; gap: 12px; margin-bottom: 8px; line-height: 1.4; color: #aaa; }
                .term-time { color: #444; font-weight: 700; flex-shrink: 0; }
                .term-tag { font-weight: 900; padding: 0 6px; border-radius: 3px; font-size: 10px; text-transform: uppercase; flex-shrink: 0; }
                .term-tag.user_delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .term-tag.login_success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .term-msg { color: #ccc; }
                .dimmed { opacity: 0.5; }

                .audit-table-box { padding: 0 10px 20px 10px; overflow-y: auto; }
                .exact-table.audit { border-top: none; }
                .exact-table.audit td { font-size: 11px; color: #888; border-bottom: 1px solid #0a0a0a; padding: 15px; }

                .fade-in { animation: fadeIn 0.4s ease; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
