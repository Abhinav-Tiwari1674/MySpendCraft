import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaUsers, FaUserPlus, FaHome, FaSignOutAlt, FaCopy, FaCheckCircle } from 'react-icons/fa';

const HouseholdManager = () => {
    const { user, setUser } = useContext(AuthContext);
    const [household, setHousehold] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteCode, setInviteCode] = useState('');
    const [householdName, setHouseholdName] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHousehold();
    }, []);

    const fetchHousehold = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/household');
            setHousehold(data);
            setError('');
        } catch (err) {
            console.error('Error fetching household', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/household', { name: householdName });
            setHousehold(data);
            // Refresh user context to get updated householdId
            const meRes = await api.get('/auth/me');
            setUser(meRes.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create household');
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/household/join', { inviteCode });
            setHousehold(data);
            const meRes = await api.get('/auth/me');
            setUser(meRes.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid invite code');
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this household?')) return;
        try {
            await api.post('/household/leave');
            setHousehold(null);
            const meRes = await api.get('/auth/me');
            setUser(meRes.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave household');
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(household.inviteCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (loading) return <div className="card glass-effect" style={{ padding: '20px', textAlign: 'center' }}>Loading Household...</div>;

    if (!household) {
        return (
            <div className="card glass-effect" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px', borderRadius: '10px' }}>
                        <FaHome />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Family Sharing</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>JOIN A HOUSEHOLD</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Enter Invite Code"
                                className="form-control"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                style={{ height: '38px', fontSize: '13px' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 15px', height: '38px', fontSize: '12px' }}>Join</button>
                        </div>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    </div>

                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>CREATE NEW HOUSEHOLD</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Household Name"
                                className="form-control"
                                value={householdName}
                                onChange={(e) => setHouseholdName(e.target.value)}
                                style={{ height: '38px', fontSize: '13px' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 15px', height: '38px', fontSize: '12px' }}>Create</button>
                        </div>
                    </form>

                    {error && <div style={{ fontSize: '11px', color: 'var(--danger)', textAlign: 'center' }}>{error}</div>}
                </div>
            </div>
        );
    }

    return (
        <div className="card glass-effect" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px', borderRadius: '10px' }}>
                        <FaHome />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{household.name}</h3>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Family Workspace</div>
                    </div>
                </div>
                {user.role === 'member' && (
                    <button onClick={handleLeave} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }} title="Leave Household">
                        <FaSignOutAlt />
                    </button>
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Invite Members</label>
                <div onClick={copyInviteCode} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 15px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    border: '1px dashed var(--primary)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: 'white', letterSpacing: '2px' }}>{household.inviteCode}</span>
                    <span style={{ fontSize: '12px', color: copySuccess ? 'var(--success)' : 'var(--primary)' }}>
                        {copySuccess ? <FaCheckCircle /> : <FaCopy />}
                    </span>
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '5px' }}>Share this code with your family members to join.</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Members</label>
                {household.members.map(member => (
                    <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            fontSize: '14px',
                            fontWeight: '800'
                        }}>
                            {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>
                                {member.name} {member._id === household.owner._id ? '(Owner)' : ''}
                                {member._id === user._id ? ' (You)' : ''}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{member.email}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HouseholdManager;
