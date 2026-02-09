import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaGem } from 'react-icons/fa';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const securityQuestions = [
        "What was the name of your first childhood best friend?",
        "What is the name of the street you grew up on?",
        "What was your favorite toy as a child?",
        "What is the name of your favorite school teacher?",
        "What was the first concert you ever attended?",
        "In what city did your parents meet?",
        "What was the name of your first stuffed animal?"
    ];

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Please enter a valid and authentic email address');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            await register(name, email, password, securityQuestion, securityAnswer);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-bg-blob blob-1"></div>
            <div className="auth-bg-blob blob-2"></div>
            <div className="auth-card">
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <FaGem style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px' }}>
                        Create an account
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
                        Start managing your finance today
                    </p>
                </div>

                <div className="auth-segmented-control">
                    <Link to="/login" className="auth-segmented-item">Sign In</Link>
                    <div className="auth-segmented-item active">Sign Up</div>
                </div>

                {error && <div className="fade-in" style={{ color: '#ef4444', marginBottom: '24px', textAlign: 'center', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="name@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Password
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer', fontSize: '10px', color: 'var(--primary)', textTransform: 'none' }}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </span>
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="auth-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ margin: '32px 0 16px 0', color: 'rgba(255, 255, 255, 0.3)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Security Recovery
                    </div>

                    <div className="auth-input-group">
                        <label>Security Question</label>
                        <select
                            className="auth-input"
                            style={{ appearance: 'none', cursor: 'pointer', color: securityQuestion ? 'white' : 'rgba(255, 255, 255, 0.2)' }}
                            value={securityQuestion}
                            onChange={(e) => setSecurityQuestion(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select a question...</option>
                            {securityQuestions.map((q, i) => (
                                <option key={i} value={q} style={{ background: '#0f172a', color: 'white' }}>{q}</option>
                            ))}
                        </select>
                    </div>

                    <div className="auth-input-group">
                        <label>Your Answer</label>
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Type your answer here"
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-auth">
                        Create Account
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
