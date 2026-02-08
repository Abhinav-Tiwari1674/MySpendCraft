import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaGem, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Question/Answer
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFetchQuestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setSecurityQuestion(data.question);
            setStep(2);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Something went wrong. Please check your email.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password-answer', {
                email,
                securityAnswer,
                newPassword
            });
            setLoading(false);
            setIsSubmitted(true);
            setTimeout(() => navigate('/login'), 4000);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Incorrect answer or failed to reset password.');
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
                        {isSubmitted ? "All set!" : "Reset Password"}
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px', lineHeight: '1.5' }}>
                        {isSubmitted
                            ? "Your password has been updated successfully."
                            : step === 1
                                ? "Enter your email to locate your account"
                                : "Answer your security question to continue"}
                    </p>
                </div>

                {!isSubmitted ? (
                    <div>
                        {error && (
                            <div style={{
                                color: '#ef4444',
                                marginBottom: '24px',
                                textAlign: 'center',
                                fontSize: '13px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <FaExclamationTriangle size={12} /> {error}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleFetchQuestion}>
                                <div className="auth-input-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        className="auth-input"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button type="submit" className="btn-auth" disabled={loading}>
                                    {loading ? "Finding..." : "Find Account"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Question</div>
                                    <div style={{ fontSize: '15px', color: 'white', fontWeight: '600', lineHeight: '1.4' }}>{securityQuestion}</div>
                                </div>

                                <div className="auth-input-group">
                                    <label>Your Answer</label>
                                    <input
                                        type="text"
                                        className="auth-input"
                                        placeholder="Type your answer"
                                        value={securityAnswer}
                                        onChange={(e) => setSecurityAnswer(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="auth-input-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        className="auth-input"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        minLength={6}
                                    />
                                </div>

                                <div className="auth-input-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        className="auth-input"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <button type="submit" className="btn-auth" disabled={loading}>
                                    {loading ? "Updating..." : "Reset Password"}
                                </button>

                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Try another email
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <FaCheckCircle style={{ fontSize: '32px', color: '#10b981' }} />
                        </div>
                        <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Success!</h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', marginBottom: '32px' }}>
                            Redirecting you to login shortly...
                        </p>
                        <button onClick={() => navigate('/login')} className="btn-auth">
                            Go to Login
                        </button>
                    </div>
                )}

                <div className="auth-footer">
                    <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FaArrowLeft size={11} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
