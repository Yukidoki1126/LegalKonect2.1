import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Specialization } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function RegisterClient() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        specialization_ids: [] as number[],
    });
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    useEffect(() => {
        loadSpecializations();
    }, []);

    const loadSpecializations = async () => {
        try {
            const data = await api.getSpecializations();
            setSpecializations(data);
        } catch (err) {
            console.error('Failed to load specializations');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSpecializationToggle = (id: number) => {
        setFormData((prev) => ({
            ...prev,
            specialization_ids: prev.specialization_ids.includes(id)
                ? prev.specialization_ids.filter((s) => s !== id)
                : [...prev.specialization_ids, id],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.registerClient(formData);
            localStorage.setItem('token', response.token);
            setUser(response.user);
            navigate('/client/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h1>⚖️ Register as Client</h1>
                    <p>Create your account to find legal assistance</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_confirmation">Confirm Password</label>
                            <input
                                type="password"
                                id="password_confirmation"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required
                                placeholder="Confirm your password"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+63 XXX XXX XXXX"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address (Optional)</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Your address"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Legal Specializations Needed</label>
                        <p className="form-help">Select the types of legal help you're looking for</p>
                        <div className="specialization-grid">
                            {specializations.map((spec) => (
                                <label key={spec.id} className="specialization-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.specialization_ids.includes(spec.id)}
                                        onChange={() => handleSpecializationToggle(spec.id)}
                                    />
                                    <span>{spec.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    <p>Are you a law firm? <Link to="/register/law-firm">Register here</Link></p>
                </div>
            </div>
        </div>
    );
}
