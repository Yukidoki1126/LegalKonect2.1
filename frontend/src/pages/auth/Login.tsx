import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>⚖️ LawFirm Locator</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account?</p>
                    <div className="register-links">
                        <Link to="/register/client">Register as Client</Link>
                        <Link to="/register/law-firm">Register as Law Firm</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
