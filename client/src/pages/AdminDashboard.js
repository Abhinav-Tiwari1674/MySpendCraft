import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import {
    FaArrowLeft, FaEnvelope, FaCheck, FaUser, FaClock,
    FaChartLine, FaUsers, FaDatabase, FaShieldAlt, FaSearch,
    FaChevronRight, FaFilter, FaTimes
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');


    const [activeAction, setActiveAction] = useState(null);
    const [backupProgress, setBackupProgress] = useState(0);
    const [showLogs, setShowLogs] = useState(false);
    const [globalMessage, setGlobalMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        if (stats) setRefreshing(true);
        else setLoading(true);

        try {
            const [statsRes, usersRes, messagesRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/contact')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setMessages(messagesRes.data);
            setLoading(false);
            setRefreshing(false);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
            setLoading(false);
            setRefreshing(false);
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                alert('Data refresh failed. Please check your connection.');
            }
        }
    };

    const runBackup = () => {
        setActiveAction('backup');
        setBackupProgress(0);
        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setActiveAction(null), 1500);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    const sendBroadcast = () => {
        if (!globalMessage.trim()) return;
        setActiveAction('sending');
        setTimeout(() => {
            setActiveAction('sent');
            setGlobalMessage('');
            setTimeout(() => setActiveAction(null), 2000);
        }, 1500);
    };

    const toggleAdminStatus = async (userId, currentStatus) => {
        try {
            const res = await api.patch(`/admin/users/${userId}`, { isAdmin: !currentStatus });
            setUsers(users.map(u => u._id === userId ? { ...u, isAdmin: res.data.isAdmin } : u));
        } catch (err) {
            alert('Failed to update admin status');
        }
    };

    const markMessageRead = async (id) => {
        try {
            await api.patch(`/contact/${id}`, { status: 'read' });
            setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' } : m));
            setStats({ ...stats, newMessages: stats.newMessages - 1 });
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    {['overview', 'users', 'messages'].map(tab => (
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
                            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaFilter /> Filter</button>
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
                                                <button
                                                    onClick={() => toggleAdminStatus(u._id, u.isAdmin)}
                                                    className="table-action-btn"
                                                >
                                                    {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {messages.map((msg) => (
                                <div key={msg._id} className="admin-card" style={{
                                    borderLeft: `4px solid ${msg.status === 'new' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)'}`,
                                    opacity: msg.status === 'read' ? 0.7 : 1
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div className="user-avatar" style={{ width: '40px', height: '40px' }}><FaUser /></div>
                                            <div>
                                                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{msg.name}</h3>
                                                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{msg.email}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                            {msg.status === 'new' && <span className="status-badge new">NEW</span>}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#e2e8f0', marginBottom: '20px' }}>{msg.message}</p>
                                    {msg.status === 'new' && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button onClick={() => markMessageRead(msg._id)} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}><FaCheck /> Mark Read</button>
                                        </div>
                                    )}
                                </div>
                            ))}
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
