import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '@/services/api';
import './Auth.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token || !email) {
            setError('Invalid reset link');
            return;
        }

        setLoading(true);

        try {
            await api.resetPassword({
                email: email,
                token: token,
                password: password,
                password_confirmation: confirmPassword,
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: { token?: string[] } } } };
            if (error.response?.data?.errors?.token) {
                setError(error.response.data.errors.token[0]);
            } else {
                setError(error.response?.data?.message || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="brand-icon">✅</div>
                        <h2>Password Reset Successful</h2>
                        <p>Your password has been reset successfully</p>
                    </div>

                    <div style={{
                        padding: '16px',
                        borderRadius: '6px',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #10b981',
                        color: '#065f46',
                        marginBottom: '24px',
                        textAlign: 'center'
                    }}>
                        Redirecting to login page...
                    </div>

                    <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="brand-icon">🔐</div>
                    <h2>Reset Password</h2>
                    <p>Enter your new password</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter new password (min 8 characters)"
                                disabled={!token || !email}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirm new password"
                                disabled={!token || !email}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading || !token || !email}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>Remember your password?</span>
                </div>

                <Link to="/login" className="btn-primary" style={{ 
                    backgroundColor: 'white', 
                    color: '#3b82f6', 
                    border: '1px solid #3b82f6',
                    textAlign: 'center',
                    display: 'block',
                    textDecoration: 'none'
                }}>
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
