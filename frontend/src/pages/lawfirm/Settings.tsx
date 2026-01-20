import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Specialization } from '../../types';
import LawFirmLayout from '../../components/lawfirm/LawFirmLayout';
import './LawFirmDashboard.css';

export default function ProfileSettings() {
    const [formData, setFormData] = useState({
        firm_name: '',
        description: '',
        phone: '',
        email: '',
        address: '',
        specialization_ids: [] as number[],
    });
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profile, specs] = await Promise.all([
                api.getLawFirmProfile(),
                api.getSpecializations(),
            ]);
            
            setFormData({
                firm_name: profile.firm_name,
                description: profile.description || '',
                phone: profile.phone || '',
                email: profile.email || '',
                address: profile.address || '',
                specialization_ids: profile.specializations?.map(s => s.id) || [],
            });
            setSpecializations(specs);
        } catch {
            console.error('Failed to load profile data');
        } finally {
            setLoading(false);
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
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.updateLawFirmProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <LawFirmLayout>
            <div className="law-firm-settings">
                <div className="page-header">
                    <h2>⚙️ Profile Settings</h2>
                    <p>Update your firm's public information and services</p>
                </div>

                {loading ? (
                    <div className="loading">Loading profile...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="settings-form">
                        <section className="settings-section">
                            <h3>🏛️ Firm Information</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Firm Name</label>
                                    <input
                                        type="text"
                                        name="firm_name"
                                        value={formData.firm_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Public Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Office Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Firm Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="settings-section">
                            <h3>⚖️ Specializations</h3>
                            <p className="section-help">Select the areas of law your firm practices</p>
                            <div className="specializations-grid-settings">
                                {specializations.map((spec) => (
                                    <label key={spec.id} className="spec-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.specialization_ids.includes(spec.id)}
                                            onChange={() => handleSpecializationToggle(spec.id)}
                                        />
                                        <span>{spec.name}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </LawFirmLayout>
    );
}
