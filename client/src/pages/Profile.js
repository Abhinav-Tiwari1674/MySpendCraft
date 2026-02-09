import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CurrencyContext from '../context/CurrencyContext';
import { FaUser, FaEnvelope, FaGlobeAmericas, FaGem, FaArrowLeft, FaCheckCircle, FaSave, FaShieldAlt, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import api from '../utils/api';

const Profile = () => {
    const { user, loading, setUser } = useContext(AuthContext);
    const { currency, country, changeCurrency, ratesList } = useContext(CurrencyContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const [myMessages, setMyMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(() => {
        return location.hash === '#support-history' ? 'support' : 'settings';
    });

    useEffect(() => {
        if (location.hash === '#support-history') {
            setActiveTab('support');
        } else if (!location.hash) {
            setActiveTab('settings');
        }
    }, [location]);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email });
            fetchMyMessages();
        }
    }, [user]);

    const fetchMyMessages = async () => {
        setLoadingMessages(true);
        try {
            const { data } = await api.get('/contact/my');
            setMyMessages(data);
            setLoadingMessages(false);

            // Mark as read after fetching
            if (data.some(m => m.status === 'replied' && !m.userRead)) {
                await api.put('/contact/mark-read');
            }
        } catch (err) {
            console.error('Failed to fetch messages', err);
            setLoadingMessages(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await api.put('/auth/profile', { name: formData.name });
            // Preserve the token in the auth state
            const token = localStorage.getItem('token');
            setUser({ ...res.data, token });
            showToast('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile', error);
            const message = error.response?.data?.message || 'Failed to update profile';
            showToast(message, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const countryData = {
        'India': { flag: '🇮🇳' },
        'United States': { flag: '🇺🇸' },
        'United Kingdom': { flag: '🇬🇧' },
        'Europe': { flag: '🇪🇺' },
        'Japan': { flag: '🇯🇵' },
        'Australia': { flag: '🇦🇺' },
        'Canada': { flag: '🇨🇦' }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="auth-wrapper" style={{ padding: '100px 20px' }}>
            <div className="auth-bg-blob blob-1"></div>
            <div className="auth-bg-blob blob-2" style={{ bottom: '10%', right: '10%' }}></div>

            <div className="auth-card" style={{ maxWidth: '600px', animation: 'auth-card-entrance 0.6s ease' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        marginBottom: '30px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}
                >
                    <FaArrowLeft size={12} /> Back to Dashboard
                </button>

                <div className="auth-header" style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '32px' }}>My Profile</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
                        Manage your account settings and support history.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '30px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '0'
                }}>
                    <button
                        onClick={() => setActiveTab('settings')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '12px 20px',
                            color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            borderBottom: activeTab === 'settings' ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaUser size={12} /> Account Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '12px 20px',
                            color: activeTab === 'support' ? 'var(--primary)' : 'var(--text-muted)',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            borderBottom: activeTab === 'support' ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            position: 'relative'
                        }}
                    >
                        <FaEnvelope size={12} /> Support History
                        {myMessages.some(m => m.status === 'replied' && !m.userRead) && (
                            <span style={{
                                width: '8px',
                                height: '8px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                            }}></span>
                        )}
                    </button>
                </div>


                {/* Account Settings Tab */}
                {activeTab === 'settings' && (
                    <form onSubmit={handleUpdateProfile}>
                        {/* Basic Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                            <div className="auth-input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaUser size={12} color="var(--primary)" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    className="premium-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="auth-input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaEnvelope size={12} color="var(--primary)" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    className="premium-input"
                                    value={formData.email}
                                    disabled
                                    style={{
                                        opacity: 0.9,
                                        cursor: 'not-allowed',
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.02)',
                                        color: 'white'
                                    }}
                                />
                                <small style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                    Email cannot be changed.
                                </small>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
                            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaGlobeAmericas color="var(--primary)" /> Regional Preferences
                            </h4>

                            <div className="auth-input-group" style={{ margin: 0 }}>
                                <label>Primary Currency & Country</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                    {ratesList.map((item) => (
                                        <div
                                            key={item.code}
                                            onClick={() => {
                                                const nameMap = {
                                                    INR: 'India', USD: 'United States', GBP: 'United Kingdom',
                                                    EUR: 'Europe', JPY: 'Japan', AUD: 'Australia', CAD: 'Canada'
                                                };
                                                changeCurrency(item.code, nameMap[item.code]);
                                                showToast(`Currency updated to ${item.code}`);
                                            }}
                                            style={{
                                                padding: '12px',
                                                background: currency === item.code ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${currency === item.code ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <span style={{ fontSize: '20px' }}>
                                                {countryData[item.code === 'INR' ? 'India' : (item.code === 'USD' ? 'United States' : (item.code === 'GBP' ? 'United Kingdom' : (item.code === 'EUR' ? 'Europe' : (item.code === 'JPY' ? 'Japan' : (item.code === 'AUD' ? 'Australia' : 'Canada')))))]?.flag}
                                            </span>
                                            <div style={{ lineHeight: 1 }}>
                                                <div style={{ fontSize: '12px', fontWeight: '700', color: currency === item.code ? 'white' : 'var(--text-muted)' }}>{item.code}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.symbol}</div>
                                            </div>
                                            {currency === item.code && <FaCheckCircle style={{ marginLeft: 'auto', color: 'var(--primary)' }} size={12} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn"
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '12px 24px' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isUpdating}
                                style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                {isUpdating ? 'Saving...' : <><FaSave /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                )}

                {/* Support History Tab */}
                {activeTab === 'support' && (
                    <div id="support-history" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaEnvelope color="var(--primary)" /> Support & Inquiry History
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {loadingMessages ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading history...</div>
                            ) : myMessages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    No support requests found.
                                </div>
                            ) : (
                                myMessages.map(msg => (
                                    <div key={msg._id} style={{
                                        padding: '16px',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '16px',
                                        border: `1px solid ${msg.status === 'replied' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </span>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                padding: '2px 8px',
                                                borderRadius: '100px',
                                                background: msg.status === 'replied' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                                                color: msg.status === 'replied' ? '#10b981' : 'var(--primary)'
                                            }}>
                                                {msg.status}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#e2e8f0', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                                            {msg.message}
                                        </p>

                                        {msg.adminReply && (
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                background: 'rgba(16, 185, 129, 0.05)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(16, 185, 129, 0.1)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                    <FaShieldAlt size={10} color="#10b981" />
                                                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#10b981' }}>OFFICIAL RESPONSE</span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#10b981', margin: 0 }}>
                                                    {msg.adminReply}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

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
        </div >
    );
};

export default Profile;
