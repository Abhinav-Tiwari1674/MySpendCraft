import React, { useState } from 'react';
import {
    FaPlus, FaCheckCircle, FaChevronDown, FaChevronUp,
    FaShieldAlt
} from 'react-icons/fa';
import CurrencyContext from '../context/CurrencyContext';
import '../pages/Features.css';

const FeatureStep = ({ number, title, badge, description, items, icon: Icon, isReverse, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`feature-step-card-wrapper fade-in`}>
            <div className={`step-card vertical`}>
                <div className="step-content">
                    <span className="step-badge">{badge}</span>
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <ul className="feature-list">
                        {items.map((item, index) => (
                            <li key={index}>
                                <FaCheckCircle /> {item}
                            </li>
                        ))}
                    </ul>
                    <button className="learn-more" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <><FaChevronUp /> Hide details</> : <><FaChevronDown /> Learn how it helps</>}
                    </button>
                    {isOpen && (
                        <div className="details-panel">
                            {children}
                        </div>
                    )}
                </div>
                <div className="step-visual">
                    {Icon}
                </div>
            </div>
        </div>
    );
};

const FeaturesSection = () => {
    const { formatCurrency, getSymbol, currency } = React.useContext(CurrencyContext);

    const currencyNounMap = {
        'INR': 'rupee',
        'USD': 'dollar',
        'GBP': 'pound',
        'EUR': 'euro',
        'JPY': 'yen',
        'AUD': 'AUD',
        'CAD': 'CAD'
    };
    const currencyNoun = currencyNounMap[currency] || 'rupee';

    return (
        <div id="features" className="features-container" style={{ minHeight: 'auto', background: 'transparent' }}>
            <div className="features-hero" style={{ paddingTop: '60px' }}>
                <span className="step-badge">COMPLETE WALKTHROUGH</span>
                <h1>How MySpendCraft Helps You <br /><span className="text-gradient-flow">Manage Your Money</span></h1>
                <p>From the first sign-up to your long-term financial freedom, MySpendCraft is built to simplify every step of your money management journey.</p>
            </div>

            <div className="features-steps-grid">
                <FeatureStep
                    badge="STEP 1"
                    title="Add Your Expenses"
                    description="Easily log every transaction as it happens. Whether it's a quick tea break or a major monthly bill, MySpendCraft keeps it organized."
                    items={[
                        "Manual entry with intuitive category selection",
                        "Choose from Food, Rent, Travel, Health, and more",
                        "Record amounts with exact dates and descriptions"
                    ]}
                    icon={
                        <div className="mock-ui scale-in">
                            <div className="mock-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: 'white', fontWeight: '700' }}>Add Transaction</span>
                                    <FaPlus style={{ color: '#3b82f6' }} />
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.2)', height: '100px', borderRadius: '8px', marginBottom: '8px' }}></div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Food</div>
                                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Travel</div>
                                </div>
                            </div>
                        </div>
                    }
                >
                    <strong>Why it’s useful:</strong> Manual tracking makes you more aware of your small daily leakages—those little 50-100 unit expenses that add up to thousands globally.
                </FeatureStep>

                <FeatureStep
                    badge="STEP 2"
                    title="Daily Essentials"
                    description="Unique tracking for recurrent local services like Milk and Newspaper. No need to calculate manually at the end of the month."
                    items={[
                        "Dedicated Milk & Newspaper modules",
                        "Quantity-based tracking (litres) with decimal support",
                        "One-click monthly summary generation"
                    ]}
                    icon={
                        <div className="mock-ui scale-in">
                            <div className="mock-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ color: 'white', fontWeight: '700' }}>Milk Log</span>
                                    <span style={{ color: '#3b82f6' }}>{formatCurrency(1450)}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                    {[1, 1.5, 1.5, 0, 1, 2, 1].map((q, i) => (
                                        <div key={i} style={{ background: q > 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.1)', color: q > 0 ? '#3b82f6' : '#ef4444', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                                            {q}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                >
                    <strong>The Benefit:</strong> Eliminates the disputes with vendors and the mental tax of manual calculations. You know exactly what you owe at any moment.
                </FeatureStep>

                <FeatureStep
                    badge="STEP 3"
                    title="Smart Dashboard"
                    description="Your entire financial status at a single glance. No complex navigation required to see the big picture."
                    items={[
                        "Live balance tracking (Income - Expenses)",
                        "Month-wise and year-wise filtering",
                        "Quick view of top spending categories"
                    ]}
                    icon={
                        <div className="mock-ui scale-in" style={{ padding: '0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                                <div style={{ background: '#1e293b', padding: '20px' }}>
                                    <div style={{ fontSize: '12px', color: '#10b981' }}>Income</div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{getSymbol()}85k</div>
                                </div>
                                <div style={{ background: '#1e293b', padding: '20px' }}>
                                    <div style={{ fontSize: '12px', color: '#ef4444' }}>Expense</div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{getSymbol()}32k</div>
                                </div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', borderRadius: '0 0 16px 16px' }}>
                                <div style={{ fontSize: '12px', color: '#3b82f6' }}>Net Savings</div>
                                <div style={{ fontSize: '28px', fontWeight: '900', color: '#3b82f6' }}>{formatCurrency(53000)}</div>
                            </div>
                        </div>
                    }
                >
                    <strong>How it helps:</strong> It gives you immediate feedback. Seeing a 'Positive Balance' boosts confidence, while 'Negative' alerts you to change behavior early.
                </FeatureStep>

                <FeatureStep
                    badge="STEP 4"
                    title="Budget & Planning"
                    description="Proactive money management. Instead of just tracking past spending, take control of your future spending."
                    items={[
                        "Set monthly limits for individual categories",
                        "Real-time budget usage indicators",
                        "Visual warnings when you cross safe limits"
                    ]}
                    icon={
                        <div className="mock-ui scale-in">
                            <div className="mock-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ color: 'white', fontSize: '14px' }}>Shopping Budget</span>
                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{getSymbol()}8,000 / {getSymbol()}10,000</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ background: '#3b82f6', width: '80%', height: '100%' }}></div>
                                </div>
                                <div style={{ marginTop: '10px', color: '#3b82f6', fontSize: '12px', fontWeight: '700' }}>80% Used - Safe</div>
                            </div>
                        </div>
                    }
                >
                    <strong>The Outcome:</strong> You stop wonderings where your money went. You decide where it goes before you even spend it.
                </FeatureStep>

                <FeatureStep
                    badge="STEP 5"
                    title="Insights & Analytics"
                    description="Turn your raw transaction data into meaningful financial intelligence with beautiful visual reports."
                    items={[
                        "Spending trends over the last 6-12 months",
                        "Detailed category breakdowns (Pie charts)",
                        "Automatic calculation of year-on-year growth"
                    ]}
                    icon={
                        <div className="mock-ui scale-in">
                            <div className="mock-card">
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: '10px' }}>Food</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: '10px', height: '10px', background: '#ec4899', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: '10px' }}>Rent</span>
                                    </div>
                                </div>
                                <div className="mock-chart-container">
                                    {[30, 45, 25, 60, 80, 50, 90].map((h, i) => (
                                        <div key={i} className="mock-bar" style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(59, 130, 246, 0.2), #3b82f6)` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                >
                    <strong>Why Analytics?</strong> Identifying trends allows you to spot seasonal spikes or lifestyle inflation before they become permanent financial burdens.
                </FeatureStep>

                <FeatureStep
                    badge="STEP 6"
                    title="Privacy & Security"
                    description="Your financial privacy is our top priority. Your data is encrypted and handled with extreme care."
                    items={[
                        "JWT-based user authentication",
                        "Private database for every user",
                        "Cloud sync to access data from any device"
                    ]}
                    icon={
                        <div className="mock-ui scale-in" style={{ textAlign: 'center' }}>
                            <FaShieldAlt style={{ fontSize: '80px', color: '#3b82f6', marginBottom: '20px', opacity: 0.8 }} />
                            <h4 style={{ color: 'white', margin: 0 }}>Secured by RSA</h4>
                            <p style={{ fontSize: '12px', margin: '5px 0 0' }}>End-to-end encryption active</p>
                        </div>
                    }
                >
                    <strong>Peace of Mind:</strong> We don't sell your data. We don't track you. MySpendCraft is a private tool built for your personal growth.
                </FeatureStep>
            </div>
        </div>
    );
};

export default FeaturesSection;
