import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const TermsOfUse = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            title: "Acceptance of Terms",
            content: "By accessing or using this application, you agree to be bound by these Terms of Use. If you do not agree with any part of the terms, please do not use the application."
        },
        {
            title: "Purpose of the Application",
            content: "This application is designed to help users track personal expenses, manage recurring payments, and view financial summaries. The data shown is for informational purposes only and should not be considered financial or legal advice."
        },
        {
            title: "User Responsibilities",
            content: "You agree to provide accurate information, use the application lawfully, not misuse the system, and keep your login credentials secure. You are responsible for all activity under your account."
        },
        {
            title: "Data & Privacy",
            content: "User data is handled according to the Privacy Policy. We do not sell personal data to third parties."
        },
        {
            title: "Accuracy of Information",
            content: "We do not guarantee that all calculations or reports will always be error-free. Users should verify critical information independently."
        },
        {
            title: "Feature Availability",
            content: "Features may be updated, modified, temporarily unavailable, or removed without prior notice."
        },
        {
            title: "Account Suspension or Removal",
            content: "Accounts violating these terms or misusing the system may be suspended or removed, which may result in loss of stored data."
        },
        {
            title: "Limitation of Liability",
            content: "The application is provided “as is”. We are not liable for financial loss, data loss, or service interruption."
        },
        {
            title: "Changes to Terms",
            content: "Terms may be updated periodically. Continued use after updates implies acceptance."
        },
        {
            title: "Contact",
            content: "For questions regarding these terms, users can contact support via the feedback section."
        }
    ];

    return (
        <div className="landing-page-container" style={{ minHeight: '100vh', paddingBottom: '100px', background: '#050505', color: 'white' }}>
            <Navbar />

            <section className="landing-section" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
                <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                    <div className="fade-in">
                        <Link to="/dashboard" className="btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '700', fontSize: '14px', transition: 'transform 0.2s' }}>
                            <FaArrowLeft size={12} /> Back to Dashboard
                        </Link>

                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'rgba(249, 115, 22, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                fontSize: '24px',
                                margin: '0 auto 16px',
                                border: '1px solid rgba(249, 115, 22, 0.2)'
                            }}>
                                <FaFileContract />
                            </div>
                            <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '12px', color: 'white' }}>
                                Terms of <span style={{ color: 'var(--primary)' }}>Use</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                                Please read these terms carefully before using MySpendCraft.
                            </p>
                        </div>

                        <div className="card glass-effect" style={{
                            padding: '40px',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(20px)'
                        }}>
                            {sections.map((section, index) => (
                                <div key={index} style={{
                                    marginBottom: index === sections.length - 1 ? 0 : '40px',
                                    paddingBottom: index === sections.length - 1 ? 0 : '30px',
                                    borderBottom: index === sections.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>
                                        {section.title}
                                    </h3>
                                    <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#94a3b8' }}>
                                        {section.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                                Last updated: February 2026
                            </p>
                            <Link to="/dashboard" style={{
                                display: 'inline-block',
                                padding: '12px 30px',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                border: '1px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsOfUse;
