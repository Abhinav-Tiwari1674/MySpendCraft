import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CurrencyContext from '../context/CurrencyContext';
import { FaSignOutAlt, FaGem, FaBars, FaTimes, FaGlobeAmericas, FaUserCircle, FaChevronDown, FaEnvelope, FaChartLine, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import api from '../utils/api';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { currency, country, changeCurrency, ratesList } = useContext(CurrencyContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const currencyRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        let interval;
        if (user) {
            fetchUnreadCount();
            interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        const handleClickOutside = (event) => {
            if (currencyRef.current && !currencyRef.current.contains(event.target)) {
                setIsCurrencyOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
            if (interval) clearInterval(interval);
        };
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/contact/unread-count');
            setUnreadCount(data.count);
        } catch (err) {
            console.error('Failed to fetch unread count', err);
        }
    };

    const onLogout = () => {
        setIsProfileOpen(false);
        navigate('/');
        logout();
    };

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
    };

    const handleNavigation = (sectionId) => {
        setIsMobileMenuOpen(false);
        if (location.pathname === '/') {
            if (sectionId === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
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

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                {/* Branding */}
                <Link to="/" onClick={() => handleNavigation('home')} className="nav-brand">
                    <div className="logo-symbol">
                        <FaGem className={scrolled ? "" : "logo-pulse"} />
                    </div>
                    <h1>MySpendCraft</h1>
                </Link>

                {/* Desktop Menu - Centered */}
                <div className="nav-menu">
                    <button onClick={() => handleNavigation('home')}>Home</button>
                    <Link
                        to="/features"
                        className={location.pathname === '/features' ? 'active' : ''}
                    >
                        Features
                    </Link>
                    <button onClick={() => handleNavigation('contact')}>Contact Us</button>
                </div>

                {/* Right Side Actions */}
                <div className="nav-actions">
                    {/* Currency Selector */}
                    <div className="currency-selector" ref={currencyRef}>
                        <button className="globe-btn" onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}>
                            <FaGlobeAmericas />
                            <span className="current-flag">{countryData[country]?.flag || '🌍'}</span>
                        </button>

                        {isCurrencyOpen && (
                            <div className="currency-dropdown">
                                <div className="dropdown-header">Select Language & Currency</div>
                                {ratesList.map((item) => (
                                    <div
                                        key={item.code}
                                        className={`currency-item ${currency === item.code ? 'active' : ''}`}
                                        onClick={() => {
                                            const nameMap = {
                                                INR: 'India',
                                                USD: 'United States',
                                                GBP: 'United Kingdom',
                                                EUR: 'Europe',
                                                JPY: 'Japan',
                                                AUD: 'Australia',
                                                CAD: 'Canada'
                                            };
                                            changeCurrency(item.code, nameMap[item.code]);
                                            setIsCurrencyOpen(false);
                                        }}
                                    >
                                        <span className="flag">{countryData[item.code === 'INR' ? 'India' : (item.code === 'USD' ? 'United States' : (item.code === 'GBP' ? 'United Kingdom' : (item.code === 'EUR' ? 'Europe' : (item.code === 'JPY' ? 'Japan' : (item.code === 'AUD' ? 'Australia' : 'Canada')))))]?.flag}</span>
                                        <div className="country-info">
                                            <span className="country-name">{item.code === 'INR' ? 'India' : (item.code === 'USD' ? 'United States' : (item.code === 'GBP' ? 'United Kingdom' : (item.code === 'EUR' ? 'Europe' : (item.code === 'JPY' ? 'Japan' : (item.code === 'AUD' ? 'Australia' : 'Canada')))))}</span>
                                            <span className="currency-code">{item.code} ({item.symbol})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {user ? (
                        <div className="user-profile-container" ref={profileRef} style={{ position: 'relative' }}>
                            <div
                                className="user-profile-trigger"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    padding: '5px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '100px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div className="profile-btn-glow"></div>
                                <div style={{ position: 'relative' }}>
                                    <FaUserCircle size={20} color="var(--primary)" />
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-4px',
                                            width: '10px',
                                            height: '10px',
                                            background: '#ef4444',
                                            borderRadius: '50%',
                                            border: '2px solid #0f172a',
                                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                                        }}></span>
                                    )}
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '700' }}>{user.name.split(' ')[0]}</span>
                                <FaChevronDown size={10} style={{
                                    color: 'var(--text-muted)',
                                    transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease'
                                }} />
                            </div>

                            {isProfileOpen && (
                                <div className="profile-dropdown" style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 15px)',
                                    right: 0,
                                    width: '260px',
                                    padding: '20px',
                                    borderRadius: '24px',
                                    zIndex: 2000,
                                    background: 'rgba(8, 8, 8, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                                    animation: 'auth-card-entrance 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '15px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
                                        <div className="user-avatar" style={{ width: '45px', height: '45px', fontSize: '18px' }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '800', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <button className="dropdown-item" onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }}>
                                            <FaGem size={14} /> My Dashboard
                                        </button>
                                        <button className="dropdown-item" onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}>
                                            <FaUserCircle size={14} /> Account Settings
                                        </button>
                                        <button className="dropdown-item" onClick={() => { navigate('/profile#support-history'); setIsProfileOpen(false); }}>
                                            <FaEnvelope size={14} /> Support History
                                            {unreadCount > 0 && <span style={{ marginLeft: 'auto', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>}
                                        </button>
                                        {user.isAdmin && (
                                            <button className="dropdown-item" onClick={() => { navigate('/admin/dashboard'); setIsProfileOpen(false); }}>
                                                <FaChartLine size={14} /> Admin Dashboard
                                            </button>
                                        )}
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
                                        <button className="dropdown-item logout" onClick={onLogout}>
                                            <FaSignOutAlt size={14} /> Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn-login">Log In</Link>
                            <Link to="/register" className="btn-get-started">
                                Get Started Free
                            </Link>
                        </>
                    )}

                    {/* Mobile Toggle */}
                    <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" style={{
                    position: 'fixed',
                    top: '80px',
                    left: '5%',
                    right: '5%',
                    background: 'rgba(8, 8, 8, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 999,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                    <button onClick={() => handleNavigation('home')} className="btn-login" style={{ fontSize: '18px', textAlign: 'left', background: 'none', border: 'none' }}>Home</button>
                    <Link to="/features" onClick={() => setIsMobileMenuOpen(false)} className="btn-login" style={{ fontSize: '18px', textDecoration: 'none' }}>Features</Link>
                    <button onClick={() => handleNavigation('contact')} className="btn-login" style={{ fontSize: '18px', textAlign: 'left', background: 'none', border: 'none' }}>Contact Us</button>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                    {!user && (
                        <>
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-login" style={{ fontSize: '18px' }}>Log In</Link>
                            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-get-started" style={{ textAlign: 'center' }}>Get Started Free</Link>
                        </>
                    )}
                </div>
            )}

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
        </nav>
    );
};

export default Navbar;
