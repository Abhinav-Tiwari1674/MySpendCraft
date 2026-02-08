import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
  FaBolt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronDown,
  FaInstagram,
  FaChartPie,
  FaArrowRight,
  FaGem,
  FaShieldAlt,
  FaWallet,
  FaCode,
  FaMusic,
  FaPlay,
  FaEllipsisH,
  FaThLarge,
  FaTwitter,
  FaArrowUp
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import FeaturesSection from '../components/FeaturesSection';
import CurrencyContext from '../context/CurrencyContext';
import api from '../utils/api';


const Landing = () => {
  const { user } = useContext(AuthContext);
  const { formatCurrency, getSymbol, currency } = useContext(CurrencyContext);
  const location = useLocation();
  const navigate = useNavigate();

  const currencyNames = {
    'INR': 'Rupees',
    'USD': 'Dollars',
    'GBP': 'Pounds',
    'EUR': 'Euros',
    'JPY': 'Yen',
    'AUD': 'Australian Dollars',
    'CAD': 'Canadian Dollars'
  };

  const currentCurrencyName = currencyNames[currency] || 'Currency';
  const currentCurrencyNoun = currency === 'INR' ? 'Rupee' : currentCurrencyName.slice(0, -1);

  // Currency Cycler for Hero
  const [cyclingText, setCyclingText] = useState(`Every ${currentCurrencyNoun}`);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const cycleItems = [
      { t: 'Every Dollar', s: '$' },
      { t: 'Every Rupee', s: '₹' },
      { t: 'Every Euro', s: '€' },
      { t: 'Every Pound', s: '£' },
      { t: 'Every Yen', s: '¥' },
      { t: 'Every AUD', s: 'A$' },
      { t: 'Every CAD', s: 'C$' }
    ];
    let i = 0;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        i = (i + 1) % cycleItems.length;
        setCyclingText(`${cycleItems[i].t}`);
        setFade(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Clear state to avoid scrolling on refresh (optional, but good practice)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // FAQ State
  const [activeFaq, setActiveFaq] = useState(null);

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: null });

  // Toast Notification State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const faqs = [
    { q: "How accurate is expense tracking?", a: `MySpendCraft provides real-time tracking with ${getSymbol()}0.01 precision. Every transaction you enter is instantly calculated and reflected across all your dashboards and reports.` },
    { q: "Is my financial data secure?", a: "Yes, absolutely. We use industry-standard JWT authentication and end-to-end encryption. Your data is private and only accessible to you through your secure account." },
    { q: "Can I track monthly and yearly expenses?", a: "Yes! Our smart filters allow you to drill down into specific months or view your entire financial history with yearly trends and comparisons." },
    { q: "How does Daily Essentials tracking work?", a: "We have custom modules for services like Milk and Newspaper. You can track quantity (litres/decimals) daily, and MySpendCraft will auto-calculate the month-end bill for you." },
    { q: "Is MySpendCraft free to use?", a: "MySpendCraft's core features are free for individuals. We believe everyone deserves better financial awareness without any barriers." }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      showToast('❌ Please fill all required fields.', 'error');
      return;
    }

    // Verify imports at top of file include: import api from '../utils/api';

    setFormStatus({ loading: true, success: false, error: null });

    try {
      await api.post('/contact', formData);
      setFormStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', message: '' });
      showToast('✅ Message sent successfully! We\'ll get back to you shortly.', 'success');
    } catch (error) {
      setFormStatus({ loading: false, success: false, error: error.response?.data?.message || 'Something went wrong' });
      showToast('❌ Failed to send message. Please try again.', 'error');
    }
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="home" className="landing-page-container">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`toast ${toast.type}`} style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
          <span>{toast.message}</span>
        </div>
      )}

      <Navbar />

      {/* Hero Section */}
      <section className="landing-section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', padding: '80px 8%', position: 'relative' }}>
        <div className="landing-hero-glow"></div>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '60px', alignItems: 'center', position: 'relative', zIndex: 1, padding: 0 }}>
          <div>


            <div className="fade-in" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(249, 115, 22, 0.1)',
              padding: '8px 16px',
              borderRadius: '100px',
              width: 'fit-content',
              marginBottom: '24px',
              border: '1px solid rgba(249, 115, 22, 0.2)'
            }}>
              <FaBolt style={{ color: 'var(--brand-primary)', fontSize: '14px' }} />
              <span style={{ color: 'white', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>TRUSTED BY 5,000+ USERS WORLDWIDE</span>
            </div>

            <h1 className="scale-in" style={{
              fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: '800',
              letterSpacing: '-2px',
              lineHeight: 1.1,
              marginBottom: '24px',
              color: 'white'
            }}>
              Take Control of <br />
              <span
                className={`text-gradient-flow ${fade ? 'fade-in-quick' : 'fade-out-quick'}`}
                style={{ fontSize: '1em', display: 'inline-block', transition: 'opacity 0.5s' }}
              >
                {cyclingText}
              </span> <br /> You Spend
            </h1>

            <p className="slide-up" style={{
              fontSize: '16px',
              color: 'var(--text-muted)',
              maxWidth: '580px',
              marginBottom: '32px',
              lineHeight: 1.6,
              fontWeight: '400'
            }}>
              The smart expense tracker that helps you understand your spending habits, set budgets, and save more money effortlessly.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '60px' }}>
              <Link to="/register" className="btn btn-primary">
                <span style={{ fontWeight: '700', fontSize: '15px' }}>Start Tracking Free</span>
                <FaArrowRight fontSize={14} />
              </Link>
              <button onClick={scrollToFeatures} className="btn" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}>
                See Features
              </button>
            </div>
          </div>

          {/* Hero Orbital Animation - Juspay Replica (Exact) */}
          <div className="floating-widget" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            <div className="orbit-container">
              {/* Central HubSpot */}
              <div className="central-logo scale-in">
                <FaGem style={{ fontSize: '56px', color: 'var(--brand-primary)', filter: 'drop-shadow(0 0 20px rgba(249, 115, 22, 0.6))' }} />
              </div>

              {/* Main Orbit Ring (8 Nodes) */}
              <div className="orbit-ring ring-main">
                {/* Spokes */}
                {[...Array(8)].map((_, i) => (
                  <div key={`spoke-${i}`} className={`orbit-spoke spoke-${i + 1}`}></div>
                ))}

                {/* Nodes - Matching Reference Clockwise from Top */}

                {/* 1. Top - Woman Avatar */}
                <div className="orbiting-item item-1 item-img">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </div>

                {/* 2. Top-Right - Code (Purple) */}
                <div className="orbiting-item item-2 item-purple"><FaCode /></div>

                {/* 3. Right - Dots (Dark) */}
                <div className="orbiting-item item-3 item-dark"><FaEllipsisH /></div>

                {/* 4. Bottom-Right - Man Avatar */}
                <div className="orbiting-item item-4 item-img">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </div>

                {/* 5. Bottom - Music (Purple/Blue) */}
                <div className="orbiting-item item-5 item-indigo"><FaMusic /></div>

                {/* 6. Bottom-Left - Woman Avatar 2 */}
                <div className="orbiting-item item-6 item-img">
                  <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </div>

                {/* 7. Left - Play (Blue) */}
                <div className="orbiting-item item-7 item-blue"><FaPlay /></div>

                {/* 8. Top-Left - Layout (Dark) */}
                <div className="orbiting-item item-8 item-dark"><FaThLarge /></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Contact Us Section */}
      <section id="contact" style={{ padding: '80px 8%', background: '#020617' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', color: 'white', marginBottom: '16px', letterSpacing: '-1.5px' }}>Contact Us</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>Have questions? Our team is here to help you master your finances.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-info-item">
              <div className="contact-info-icon"><FaPhone /></div>
              <div className="contact-info-text">
                <h4>Phone</h4>
                <a href="tel:+917052007402">+91 7052007402</a>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon"><FaEnvelope /></div>
              <div className="contact-info-text">
                <h4>Email</h4>
                <a href="mailto:support@myspendcraft.com">support@myspendcraft.com</a>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon"><FaMapMarkerAlt /></div>
              <div className="contact-info-text">
                <h4>Address</h4>
                <p>MySpendCraft HQ, High-Tech City,<br />New Delhi, India</p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="premium-input"
                  placeholder="Your Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                className="premium-input premium-textarea"
                placeholder="How can we help?"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={formStatus.loading} style={{ padding: '14px', fontSize: '15px', fontWeight: '700' }}>
              {formStatus.loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '80px 8%', background: '#030712' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', color: 'white', marginBottom: '16px', letterSpacing: '-1.5px' }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>Find answers to common questions about our service</p>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
              <div className="faq-question">
                {faq.q}
                <FaChevronDown className="chevron-icon" />
              </div>
              {activeFaq === index && <div className="faq-answer slide-up">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Juspay Style Footer */}
      <footer className="footer-juspay juspay-grid">
        <div className="footer-juspay-columns">
          {/* Logo Column */}
          <div className="footer-juspay-column">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', marginBottom: '30px' }}>
              <div style={{ background: '#f97316', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)' }}>
                <FaGem style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <span style={{ fontWeight: '900', fontSize: '32px', color: 'white', letterSpacing: '-1.5px' }}>MySpendCraft</span>
            </Link>
          </div>

          {/* Platform Column */}
          <div className="footer-juspay-column">
            <h4>Platform</h4>
            <ul>
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button></li>
              <li><button onClick={() => navigate('/features')}>Features</button></li>
              <li><button onClick={() => navigate('/login')}>Dashboard</button></li>
              <li><button onClick={() => document.getElementById('faq').scrollIntoView({ behavior: 'smooth' })}>FAQ</button></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="footer-juspay-column">
            <h4>Support</h4>
            <ul>
              <li><button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>Contact Us</button></li>
              <li><button onClick={() => window.location.href = 'mailto:support@myspendcraft.com'}>Help Center</button></li>
              <li><button onClick={() => window.location.href = 'mailto:careers@myspendcraft.com'}>Careers</button></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-juspay-column">
            <h4>Legal</h4>
            <ul>
              <li><button onClick={() => navigate('/privacy-policy')}>Privacy Policy</button></li>
              <li><button onClick={() => document.getElementById('faq').scrollIntoView({ behavior: 'smooth' })}>Terms of Use</button></li>
              <li><button onClick={() => document.getElementById('faq').scrollIntoView({ behavior: 'smooth' })}>Security</button></li>
            </ul>
          </div>

          {/* Social Column */}
          <div className="footer-juspay-column">
            <h4>Connect</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" className="social-btn-flat"><FaInstagram size={18} /></a>
              <a href="#" className="social-btn-flat"><FaTwitter size={18} /></a>
              <a href="mailto:contact@myspendcraft.com" className="social-btn-flat"><FaEnvelope size={18} /></a>
            </div>
          </div>

          {/* Scroll Up Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <FaArrowUp />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>
            Copyright 2026. MySpendCraft, a subsidiary of MyCraft. All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '13px' }}>
              <Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Use</a>
            </div>



          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
