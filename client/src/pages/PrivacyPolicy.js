import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaUserShield, FaDatabase, FaEyeSlash, FaServer, FaFileContract, FaArrowLeft, FaGem } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const policyPoints = [
        {
            icon: <FaShieldAlt />,
            title: "End-to-End Encryption",
            description: "All sensitive financial data is encrypted using industry-standard AES-256 encryption before being stored in our secure database."
        },
        {
            icon: <FaLock />,
            title: "Zero Knowledge Architecture",
            description: "We employ a zero-knowledge approach, meaning your transaction details are private and accessible only by you through your secure credentials."
        },
        {
            icon: <FaUserShield />,
            title: "User Data Ownership",
            description: "You own 100% of your data. We do not sell, rent, or share your personal financial information with any third-party advertisers or data brokers."
        },
        {
            icon: <FaDatabase />,
            title: "Secure Data Hosting",
            description: "Your data is hosted on high-security MongoDB Atlas clusters with continuous monitoring, automated backups, and global compliance certifications."
        },
        {
            icon: <FaEyeSlash />,
            title: "Anonymized Analytics",
            description: "Any internal analytics used to improve MySpendCraft are completely anonymized and aggregated, ensuring no individual spend can be traced back to a user."
        },
        {
            icon: <FaServer />,
            title: "JWT Authentication",
            description: "We use JSON Web Tokens (JWT) for secure session management, ensuring that every request to our server is verified and authorized."
        },
        {
            icon: <FaFileContract />,
            title: "GDPR & ISO Compliance",
            description: "Our platform is built with global privacy standards in mind, adhering to GDPR principles and ISO security best practices."
        },
        {
            icon: <FaLock />,
            title: "No Hidden Trackers",
            description: "MySpendCraft contains zero hidden tracking scripts, third-party cookies, or invasive behavioral monitoring tools."
        },
        {
            icon: <FaShieldAlt />,
            title: "Multi-Factor Protection",
            description: "Our infrastructure is protected by multi-layer firewalls and DDoS protection to ensure 99.9% uptime and data availability."
        },
        {
            icon: <FaDatabase />,
            title: "Transparent Data Deletion",
            description: "If you choose to delete your account, all your associated financial records and personal data are permanently erased from our production servers."
        },
        {
            icon: <FaUserShield />,
            title: "No Manual Access",
            description: "Access to the backend infrastructure is strictly restricted. No employee or administrator can view your private transaction history."
        },
        {
            icon: <FaGem />,
            title: "Elite Security Standards",
            description: "We treat your financial awareness as a sacred trust, maintaining the highest levels of digital hygiene and security auditing."
        }
    ];

    return (
        <div className="landing-page-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <Navbar />

            <section className="landing-section" style={{ paddingTop: '160px', paddingBottom: '60px' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <Link to="/" className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>
                        <FaArrowLeft size={12} /> Back to Home
                    </Link>

                    <div className="fade-in" style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <span className="step-badge">TRUST & SECURITY</span>
                        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', color: 'white', letterSpacing: '-2px', marginBottom: '20px' }}>
                            Privacy <span style={{ color: 'var(--primary)', display: 'inline-block' }}>Policy</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                            At MySpendCraft, we believe financial privacy is a fundamental human right.
                            Transparency is our core, and security is our foundation.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        {policyPoints.map((point, index) => (
                            <div key={index} className="card glass-effect scale-in" style={{ padding: '30px', animationDelay: `${index * 0.05}s`, height: '100%' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'var(--primary-bg)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    fontSize: '24px',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(249, 115, 22, 0.2)'
                                }}>
                                    {point.icon}
                                </div>
                                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                                    {point.title}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                    {point.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
