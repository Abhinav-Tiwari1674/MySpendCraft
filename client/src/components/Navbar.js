import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CurrencyContext from '../context/CurrencyContext';
import { FaSignOutAlt, FaGem, FaBars, FaTimes, FaGlobeAmericas, FaUserCircle, FaChevronDown, FaEnvelope, FaChartLine } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { currency, country, changeCurrency, ratesList } = useContext(CurrencyContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '' });
    const currencyRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
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
        };
    }, []);

    const onLogout = () => {
        setIsProfileOpen(false);
        navigate('/');
        logout();
    };

    const showToast = (message) => {
        setToast({ visible: true, message });
        setTimeout(() => setToast({ visible: false, message: '' }), 3000);
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
                                <div className="user-avatar" style={{ margin: 0, width: '32px', height: '32px', fontSize: '13px' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>
                                    {user.name.split(' ')[0]}
                                </span>
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

            {/* Local Navbar Toast */}
            {toast.visible && (
                <div className="toast success" style={{
                    position: 'fixed',
                    top: '100px',
                    right: '20px',
                    zIndex: 2000,
                    animation: 'auth-card-entrance 0.3s'
                }}>
                    {toast.message}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
