import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/services/api';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const redirectByRole = useCallback((role: string) => {
        switch (role) {
            case 'client':
                navigate('/client/dashboard');
                break;
            case 'law_firm':
                navigate('/law-firm/dashboard');
                break;
            case 'admin':
                navigate('/admin/dashboard');
                break;
            default:
                navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        if (isAuthenticated && user) {
            redirectByRole(user.role);
        }
    }, [isAuthenticated, user, redirectByRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMessage({ type: '', text: '' });
        setForgotLoading(true);

        try {
            const response = await api.forgotPassword(forgotEmail);
            setForgotMessage({ type: 'success', text: response.message });
            setForgotEmail('');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setForgotMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to send reset email' 
            });
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="brand-icon">⚖️</div>
                    <h2>LegalKonect</h2>
                    <p>Sign in to your account</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your.email@example.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="password">Password</label>
                            <button 
                                type="button" 
                                onClick={() => setShowForgotPassword(true)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#3b82f6', 
                                    cursor: 'pointer', 
                                    fontSize: '14px',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>New to LegalKonect?</span>
                </div>

                <div className="register-options">
                    <Link to="/register/client" className="register-btn client-btn">
                        <span className="btn-icon">👤</span>
                        <div className="btn-content">
                            <strong>Register as Client</strong>
                            <small>Find legal services</small>
                        </div>
                    </Link>
                    <Link to="/register/law-firm" className="register-btn firm-btn">
                        <span className="btn-icon">🏛️</span>
                        <div className="btn-content">
                            <strong>Register as Law Firm</strong>
                            <small>Grow your practice</small>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '32px',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                    }}>
                        <h3 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Reset Password</h3>
                        <p style={{ marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {forgotMessage.text && (
                            <div style={{
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '16px',
                                backgroundColor: forgotMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                border: `1px solid ${forgotMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
                                color: forgotMessage.type === 'success' ? '#065f46' : '#991b1b',
                                fontSize: '14px'
                            }}>
                                {forgotMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword}>
                            <div className="form-group">
                                <label htmlFor="forgot-email">Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        type="email"
                                        id="forgot-email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setForgotMessage({ type: '', text: '' });
                                        setForgotEmail('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    {forgotLoading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
