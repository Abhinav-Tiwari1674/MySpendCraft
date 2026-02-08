import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaGem, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/auth/reset-password/${token}`, { password });
            setLoading(false);
            setIsSubmitted(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Invalid or expired token. Please request a new reset link.');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card scale-in">
                <div style={{ textAlign: 'center', marginBottom: '45px', position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(249, 115, 22, 0.08)',
                        padding: '20px',
                        borderRadius: '24px',
                        marginBottom: '24px',
                        border: '1px solid rgba(249, 115, 22, 0.2)',
                        boxShadow: '0 0 30px rgba(249, 115, 22, 0.15), inset 0 0 15px rgba(249, 115, 22, 0.1)'
                    }}>
                        <FaGem className="logo-pulse" style={{ fontSize: '48px', color: 'var(--brand-primary)', filter: 'drop-shadow(0 0 20px rgba(249, 115, 22, 0.6))' }} />
                    </div>
                    <h1 style={{
                        fontSize: '34px',
                        fontWeight: '900',
                        color: 'white',
                        letterSpacing: '-1.5px',
                        margin: 0,
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        New Password
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', marginTop: '15px', lineHeight: '1.6', fontWeight: '500' }}>
                        {!isSubmitted
                            ? "Please enter and confirm your new strong password."
                            : "Your password has been reset successfully."}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 2 }}>
                        {error && (
                            <div style={{
                                color: '#ef4444',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontSize: '14px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                justifyContent: 'center'
                            }}>
                                <FaExclamationTriangle size={14} /> {error}
                            </div>
                        )}

                        <div className="auth-input-group">
                            <input
                                type="password"
                                className="auth-input"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="auth-input-group">
                            <input
                                type="password"
                                className="auth-input"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <button type="submit" className="btn-auth" disabled={loading}>
                            {loading ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0', position: 'relative', zIndex: 2 }}>
                        <FaCheckCircle style={{ fontSize: '64px', color: '#10b981', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }} />
                        <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '10px' }}>Password Reset!</h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', marginBottom: '30px' }}>
                            You will be redirected to the login page shortly...
                        </p>
                        <Link to="/login" className="btn-auth" style={{ textDecoration: 'none' }}>
                            Go to Login Now
                        </Link>
                    </div>
                )}

                <div style={{ margin: '40px 0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)' }}></div>
                </div>

                <div className="auth-footer" style={{ opacity: isSubmitted ? 0 : 1 }}>
                    <p>
                        Remembered your password? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
