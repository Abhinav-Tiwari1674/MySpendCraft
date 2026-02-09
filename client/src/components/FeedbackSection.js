import { useState, useContext } from 'react';
import { FaStar, FaPaperPlane } from 'react-icons/fa';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const FeedbackSection = () => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { user } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) return;

        setLoading(true);
        try {
            await api.post('/feedback', {
                message,
                rating,
                name: user?.name,
                email: user?.email
            });
            setSubmitted(true);
            setMessage('');
            setRating(5);
        } catch (err) {
            console.error('Feedback submission failed', err);
            alert('Failed to send feedback. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="card glass-effect fade-in" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>🚀</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Feedback Received!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Thank you for helping us craft a better experience. Your feedback is valuable to us.</p>
                <button onClick={() => setSubmitted(false)} className="btn-text" style={{ marginTop: '15px' }}>Send another</button>
            </div>
        );
    }

    return (
        <div className="card glass-effect" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '24px' }}>✍️</span>
                <h3 style={{ fontSize: '16px', margin: 0 }}>Craftsman Feedback</h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                How is your spending journey so far? Let us know!
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            size={24}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            style={{
                                cursor: 'pointer',
                                color: (hover || rating) >= star ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                                transition: 'all 0.2s'
                            }}
                        />
                    ))}
                </div>

                <textarea
                    placeholder="Tell us what you like or what we can improve..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        height: '100px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        color: 'white',
                        padding: '12px',
                        fontSize: '14px',
                        resize: 'none',
                        marginBottom: '15px',
                        outline: 'none'
                    }}
                />

                <button
                    type="submit"
                    disabled={loading || !message}
                    className="btn-glow-primary"
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}
                >
                    {loading ? 'Sending...' : <><FaPaperPlane /> Submit Feedback</>}
                </button>
            </form>
        </div>
    );
};

export default FeedbackSection;
