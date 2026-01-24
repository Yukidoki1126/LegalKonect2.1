import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Specialization } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function RegisterLawFirm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        firm_name: '',
        license_number: '',
        description: '',
        experience_range: '',
        lawyers: [] as string[],
        contact_person_name: '',
        contact_person_role: '',
        contact_person_phone: '',
        contact_person_email: '',
        phone: '',
        firm_email: '',
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
            console.error('Failed to load specializations', err);
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

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            nextStep();
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await api.registerLawFirm(formData);
            localStorage.setItem('token', response.token);
            setUser(response.user);
            navigate('/law-firm/dashboard');
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } } };
            setError(apiError.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card law-firm-register">
                <div className="auth-header">
                    <h1>🏛️ Register Law Firm</h1>
                    <p>Create your firm profile to connect with clients</p>
                    <div className="step-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>1<span>Account</span></div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>2<span>Firm</span></div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>3<span>Specialization</span></div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {step === 1 && (
                        <div className="form-section">
                            <h3>Account Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Your Full Name</label>
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
                                    <label htmlFor="email">Account Email</label>
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
                                        placeholder="Confirm password"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-section">
                            <h3>Firm Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firm_name">Firm Name *</label>
                                    <input
                                        type="text"
                                        id="firm_name"
                                        name="firm_name"
                                        value={formData.firm_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Law Firm Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+63 XXX XXX XXXX"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firm_email">Firm Email</label>
                                    <input
                                        type="email"
                                        id="firm_email"
                                        name="firm_email"
                                        value={formData.firm_email}
                                        onChange={handleChange}
                                        placeholder="contact@lawfirm.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Office Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Complete office address"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="license_number">DTI/SEC License Number</label>
                                    <input
                                        type="text"
                                        id="license_number"
                                        name="license_number"
                                        value={formData.license_number}
                                        onChange={handleChange}
                                        placeholder="Registration number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Firm Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Brief description of your firm and services"
                                        rows={1}
                                    />
                                </div>
                            </div>

                            <h4 style={{marginTop: '1.5rem', marginBottom: '0.75rem'}}>Contact Person (Optional)</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="contact_person_name">Contact Person Name</label>
                                    <input
                                        type="text"
                                        id="contact_person_name"
                                        name="contact_person_name"
                                        value={formData.contact_person_name}
                                        onChange={handleChange}
                                        placeholder="Secretary or staff name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact_person_role">Role/Position</label>
                                    <input
                                        type="text"
                                        id="contact_person_role"
                                        name="contact_person_role"
                                        value={formData.contact_person_role}
                                        onChange={handleChange}
                                        placeholder="e.g., Secretary, Legal Assistant"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="contact_person_phone">Contact Phone</label>
                                    <input
                                        type="tel"
                                        id="contact_person_phone"
                                        name="contact_person_phone"
                                        value={formData.contact_person_phone}
                                        onChange={handleChange}
                                        placeholder="Contact person phone"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact_person_email">Contact Email</label>
                                    <input
                                        type="email"
                                        id="contact_person_email"
                                        name="contact_person_email"
                                        value={formData.contact_person_email}
                                        onChange={handleChange}
                                        placeholder="Contact person email"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="form-section">
                            <div className="form-group">
                                <label>Legal Specializations Offered *</label>
                                <p className="form-help">Select the areas of law your firm practices</p>
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

                            <div className="info-box">
                                <p>📋 Your registration will be reviewed by our admin team for verification.</p>
                            </div>
                        </div>
                    )}

                    <div className="form-actions-row">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="btn-secondary" disabled={loading}>
                                Previous
                            </button>
                        )}
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {step < 3 ? 'Next' : (loading ? 'Submitting...' : 'Submit for Verification')}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    <p>Are you a client? <Link to="/register/client">Register here</Link></p>
                </div>
            </div>
        </div>
    );
}
