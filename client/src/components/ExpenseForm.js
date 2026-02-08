import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { FaCamera, FaImage, FaTimes, FaWallet, FaUniversity, FaCreditCard } from 'react-icons/fa';
import CurrencyContext from '../context/CurrencyContext';

const CATEGORY_KEYWORDS = {
    // ... existing keywords ...
    food: ['dinner', 'lunch', 'breakfast', 'pizza', 'burger', 'restaurant', 'cafe', 'swiggy', 'zomato', 'maggi', 'khana'],
    grocery: ['grocery', 'kirana', 'milk', 'bread', 'vegetable', 'fruit', 'egg', 'meat', 'blinkit', 'zepto', 'bigbasket'],
    travel: ['ola', 'uber', 'petrol', 'diesel', 'fuel', 'flight', 'bus', 'train', 'ticket', 'parking', 'metro', 'auto', 'rickshaw'],
    shopping: ['amazon', 'flipkart', 'myntra', 'clothe', 'shirt', 'pant', 'shoes', 'gadget', 'iphone', 'laptop', 'fashion'],
    entertainment: ['movie', 'netflix', 'hotstar', 'prime', 'subscription', 'game', 'pub', 'club', 'concert', 'party'],
    health: ['doctor', 'medicine', 'hospital', 'pharmacy', 'tablet', 'gym', 'fitness', 'clinic', 'medical'],
    salary: ['salary', 'bonus', 'divident', 'freelance', 'paycheck', 'interest', 'cashback'],
    rent: ['rent', 'maintenance', 'emi', 'home loan', 'car loan'],
    bills: ['electricity', 'water', 'gas', 'recharge', 'wifi', 'broadband', 'mobile bill', 'bill'],
    education: ['fee', 'school', 'college', 'course', 'book', 'stationery', 'exam'],
    investment: ['sip', 'mutual fund', 'stock', 'share', 'gold', 'fnd', 'ppf', 'crypto'],
    insurance: ['insurance', 'premium', 'lic', 'health insurance', 'car insurance'],
};

const ExpenseForm = ({ onAddExpense, expenseToEdit, onUpdateExpense, clearEdit, balance = 0 }) => {
    const { formatCurrency, getSymbol } = useContext(CurrencyContext);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'food',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        note: '',
        billUrl: '',
        wallet: 'Cash'
    });
    const [showDetails, setShowDetails] = useState(false);
    const [coins, setCoins] = useState([]);
    const [isFocused, setIsFocused] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const isFormValid = formData.title && formData.amount && formData.category && formData.date;

    useEffect(() => {
        if (expenseToEdit) {
            setFormData({
                title: expenseToEdit.title,
                amount: expenseToEdit.amount,
                category: expenseToEdit.category,
                type: expenseToEdit.type,
                date: expenseToEdit.date.split('T')[0],
                note: expenseToEdit.note || '',
                billUrl: expenseToEdit.billUrl || '',
                wallet: expenseToEdit.wallet || 'Cash'
            });
            if (expenseToEdit.note || expenseToEdit.billUrl) setShowDetails(true);

            // Handle image preview if billUrl is base64
            if (expenseToEdit.billUrl && expenseToEdit.billUrl.startsWith('data:image')) {
                setImagePreview(expenseToEdit.billUrl);
            } else {
                setImagePreview(null);
            }
        }
    }, [expenseToEdit]);

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to 70% quality
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedBase64);
                };
            };
        });
    };

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer rear camera on mobile
            });
            setCameraStream(stream);
            setShowCameraModal(true);

            // Wait for modal to render, then attach stream to video
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Camera access denied. Please allow camera permission or use Gallery option.');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            // Convert to base64 and compress
            const capturedImage = canvas.toDataURL('image/jpeg', 0.7);

            setFormData({ ...formData, billUrl: capturedImage });
            setImagePreview(capturedImage);
            closeCamera();
        }
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCameraModal(false);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsSubmitting(true); // Show loader during compression
                const compressedBase64 = await compressImage(file);
                setImagePreview(compressedBase64);
                setFormData(prev => ({ ...prev, billUrl: compressedBase64 }));
            } catch (err) {
                console.error("Compression failed", err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, billUrl: '' }));
    };

    const triggerCoinAnimation = () => {
        const newCoins = Array.from({ length: 8 }).map((_, i) => ({
            id: Date.now() + i,
            left: Math.random() * 100 + '%',
            delay: Math.random() * 0.5 + 's'
        }));
        setCoins(newCoins);
        setTimeout(() => setCoins([]), 2000);
    };

    const autoCategorize = (title) => {
        const lowerTitle = title.toLowerCase();
        for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(k => lowerTitle.includes(k))) {
                return cat;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        const expenseData = { ...formData, amount: Number(formData.amount) };
        console.log("Submitting ExpenseData:", { ...expenseData, billUrl: expenseData.billUrl ? "Base64 Content..." : "None" });

        try {
            if (expenseToEdit) {
                await onUpdateExpense(expenseToEdit._id, expenseData);
                clearEdit();
            } else {
                await onAddExpense(expenseData);
                triggerCoinAnimation();
            }

            // Reset form
            setFormData({
                title: '',
                amount: '',
                category: 'food',
                type: 'expense',
                date: new Date().toISOString().split('T')[0],
                note: '',
                billUrl: ''
            });
            setShowDetails(false);
            setImagePreview(null);
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        if (name === 'title') {
            const suggestedCat = autoCategorize(value);
            if (suggestedCat) {
                newFormData.category = suggestedCat;
                // Auto-set type based on category
                if (suggestedCat === 'salary') newFormData.type = 'income';
                else newFormData.type = 'expense';
            }
        }

        setFormData(newFormData);
    };

    const projectedBalance = useMemo(() => {
        const amt = Number(formData.amount) || 0;
        return formData.type === 'expense' ? balance - amt : balance + amt;
    }, [balance, formData.amount, formData.type]);

    const inputFocusStyle = (name) => ({
        height: '48px',
        background: 'var(--bg-body)',
        fontSize: '14px',
        border: isFocused === name ? '1px solid var(--primary)' : '1px solid var(--border)',
        boxShadow: isFocused === name ? '0 0 15px rgba(249, 115, 22, 0.2)' : 'none',
        transition: 'all 0.3s ease'
    });

    return (
        <div className="card glass-effect" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Camera Modal */}
            {showCameraModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.95)',
                    zIndex: 10000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <h3 style={{ color: 'white', textAlign: 'center', margin: 0 }}>📸 Capture Receipt</h3>

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                borderRadius: '16px',
                                border: '2px solid var(--primary)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}
                        />

                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={capturePhoto}
                                style={{
                                    padding: '15px 40px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
                                }}
                            >
                                📷 Capture
                            </button>
                            <button
                                type="button"
                                onClick={closeCamera}
                                style={{
                                    padding: '15px 40px',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coin Animations */}
            {coins.map(coin => (
                <div
                    key={coin.id}
                    className="coin-animation"
                    style={{ left: coin.left, animationDelay: coin.delay, top: '-50px' }}
                >
                    💰
                </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>✨</div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>{expenseToEdit ? 'Refine Entry' : 'Quick Capture'}</h3>
                </div>
                {formData.amount > 0 && (
                    <div className="fade-in" style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Projected Balance</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: projectedBalance < 0 ? 'var(--danger)' : 'var(--success)' }}>
                            {formatCurrency(projectedBalance)}
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'block', fontWeight: '700' }}>Entry Title</label>
                    <input
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="What's this for?"
                        value={formData.title}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('title')}
                        onBlur={() => setIsFocused('')}
                        required
                        style={{ ...inputFocusStyle('title'), height: '52px', fontSize: '14px' }}
                    />
                </div>
                <div className="form-group">
                    <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'block', fontWeight: '700' }}>Amount ({getSymbol()})</label>
                    <input
                        type="number"
                        name="amount"
                        className="form-control"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('amount')}
                        onBlur={() => setIsFocused('')}
                        onWheel={(e) => e.target.blur()}
                        required
                        style={{
                            ...inputFocusStyle('amount'),
                            height: '56px',
                            fontSize: '22px',
                            fontWeight: '900',
                            textAlign: 'center',
                            letterSpacing: '0.5px'
                        }}
                    />
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'block', fontWeight: '700' }}>Category</label>
                    <select
                        name="category"
                        className="form-control"
                        value={formData.category}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('category')}
                        onBlur={() => setIsFocused('')}
                        style={{ ...inputFocusStyle('category'), height: '52px', fontSize: '14px' }}
                    >
                        <option value="food">🍔 Food</option>
                        <option value="grocery">🛒 Grocery</option>
                        <option value="travel">🚗 Travel & Fuel</option>
                        <option value="shopping">🛍️ Shopping</option>
                        <option value="rent">🏠 Rent / EMI</option>
                        <option value="bills">🧾 Bills & Utils</option>
                        <option value="salary">💰 Salary / Income</option>
                        <option value="entertainment">🎬 Entertainment</option>
                        <option value="health">🏥 Health & Medical</option>
                        <option value="education">📚 Education</option>
                        <option value="investment">📈 Investment & SIP</option>
                        <option value="tax">🏛️ Taxes</option>
                        <option value="insurance">🛡️ Insurance</option>
                        <option value="other">📦 Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'block', fontWeight: '700' }}>Date</label>
                    <input
                        type="date"
                        name="date"
                        className="form-control"
                        value={formData.date}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('date')}
                        onBlur={() => setIsFocused('')}
                        required
                        style={{ ...inputFocusStyle('date'), height: '52px', fontSize: '14px' }}
                    />
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'block', fontWeight: '700' }}>Type</label>
                    <select
                        name="type"
                        className="form-control"
                        value={formData.type}
                        onChange={handleChange}
                        onFocus={() => setIsFocused('type')}
                        onBlur={() => setIsFocused('')}
                        style={{ ...inputFocusStyle('type'), height: '52px', fontSize: '14px' }}
                    >
                        <option value="expense">📉 Expense</option>
                        <option value="income">📈 Income</option>
                    </select>
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'block', fontWeight: '700' }}>Select Wallet</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {[
                            { id: 'Cash', icon: <FaWallet />, label: 'Cash' },
                            { id: 'Bank', icon: <FaUniversity />, label: 'Bank' },
                            { id: 'Credit Card', icon: <FaCreditCard />, label: 'Card' }
                        ].map(wallet => (
                            <div
                                key={wallet.id}
                                onClick={() => setFormData({ ...formData, wallet: wallet.id })}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: formData.wallet === wallet.id ? 'var(--primary-bg)' : 'rgba(255,255,255,0.03)',
                                    border: formData.wallet === wallet.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '5px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    color: formData.wallet === wallet.id ? 'var(--primary)' : 'white'
                                }}
                            >
                                {wallet.icon}
                                <span style={{ fontSize: '10px', fontWeight: '700' }}>{wallet.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Evidence & Context Toggle */}
                <div
                    onClick={() => setShowDetails(!showDetails)}
                    style={{
                        margin: '15px 0',
                        fontSize: '12px',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px',
                        background: 'rgba(249, 115, 22, 0.05)',
                        borderRadius: '10px',
                        border: '1px dashed rgba(249, 115, 22, 0.2)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {showDetails ? '− Hide Context' : '+ Add Note or Evidence'}
                </div>

                {showDetails && (
                    <div className="fade-in" style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Notes</label>
                            <textarea
                                name="note"
                                className="form-control"
                                placeholder="Add specific details..."
                                value={formData.note}
                                onChange={handleChange}
                                onFocus={() => setIsFocused('note')}
                                onBlur={() => setIsFocused('')}
                                style={{ ...inputFocusStyle('note'), minHeight: '80px', paddingTop: '10px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Evidence / Receipt</label>

                            {/* Hidden Inputs */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <input
                                type="file"
                                ref={cameraInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                capture
                                onChange={handleFileChange}
                            />

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', marginTop: '5px' }}>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    className="capture-btn"
                                >
                                    <FaImage size={22} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gallery</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={openCamera}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    className="capture-btn"
                                >
                                    <FaCamera size={22} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Camera</span>
                                </button>
                            </div>

                            {/* Image Preview Area */}
                            {imagePreview && (
                                <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--primary)', marginBottom: '10px', boxShadow: '0 0 15px rgba(249, 115, 22, 0.2)' }}>
                                    <img src={imagePreview} alt="Receipt Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                    >
                                        <FaTimes size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                        type="submit"
                        className="btn btn-primary glow-btn-primary"
                        disabled={!isFormValid || isSubmitting}
                        style={{
                            flex: 2,
                            height: '52px',
                            fontSize: '15px',
                            fontWeight: '800',
                            borderRadius: '12px',
                            opacity: (isFormValid && !isSubmitting) ? 1 : 0.6,
                            cursor: (isFormValid && !isSubmitting) ? 'pointer' : 'not-allowed',
                            letterSpacing: '0.5px',
                            transform: (isFormValid && !isSubmitting) ? 'translateY(0)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loader-mini"></span> Saving...
                            </>
                        ) : (
                            expenseToEdit ? 'Update Entry' : 'Confirm Entry'
                        )}
                    </button>
                    {expenseToEdit && (
                        <button
                            type="button"
                            className="btn-glow-primary"
                            onClick={() => { clearEdit(); setFormData({ title: '', amount: '', category: 'food', type: 'expense', date: new Date().toISOString().split('T')[0] }); }}
                            style={{
                                flex: 1,
                                height: '52px',
                                borderRadius: '12px',
                                color: 'white',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                fontSize: '14px',
                                fontWeight: '700'
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;
