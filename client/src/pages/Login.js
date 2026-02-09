import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaGem, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    if (loading) return (
        <div className="auth-wrapper">
            <div className="loader">Loading...</div>
        </div>
    );

    return (
        <div className="auth-wrapper">
            <div className="auth-bg-blob blob-1"></div>
            <div className="auth-bg-blob blob-2"></div>
            <div className="auth-card">
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <FaGem style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px' }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
                        Enter your details to sign in
                    </p>
                </div>

                <div className="auth-segmented-control">
                    <div className="auth-segmented-item active">Sign In</div>
                    <Link to="/register" className="auth-segmented-item">Sign Up</Link>
                </div>

                {error && <div style={{ color: '#ef4444', marginBottom: '24px', textAlign: 'center', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ marginBottom: 0 }}>Password</label>
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>
                                Forgot?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '45px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '5px'
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-auth">
                        Sign In
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
