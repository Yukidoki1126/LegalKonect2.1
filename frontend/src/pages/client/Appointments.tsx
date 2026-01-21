import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Appointment } from '../../types';
import ClientLayout from '../../components/client/ClientLayout';
import './Dashboard.css';

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    
    // Rating modal state
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadAppointments();

        // Auto-refresh every 30 seconds to check for appointment updates
        const refreshInterval = setInterval(() => {
            loadAppointments();
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, []);


    const loadAppointments = async () => {
        try {
            const data = await api.getClientAppointments();
            setAppointments(data);
        } catch {
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleRateClick = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setRating(0);
        setReview('');
        setShowRatingModal(true);
    };

    const handleSubmitRating = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        setSubmitting(true);
        try {
            if (rating === 0) {
                alert('Please select a rating');
                setSubmitting(false);
                return;
            }
            await api.submitRating({
                law_firm_id: selectedAppointment.law_firm_id,
                appointment_id: selectedAppointment.id,
                rating,
                review
            });
            setShowRatingModal(false);
            loadAppointments(); // Refresh to hide the rate button
        } catch {
            alert('Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const upcomingAppointments = appointments.filter(apt => 
        apt.status === 'pending' || apt.status === 'confirmed'
    ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    const pastAppointments = appointments.filter(apt => 
        apt.status === 'completed' || apt.status === 'cancelled'
    ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

    const filteredAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    return (
        <ClientLayout>
            <div className="appointments-page">
                <div className="page-header">
                    <h2>📅 My Appointments</h2>
                    <p>Track and manage your legal consultations</p>
                </div>

                <div className="tabs-container">
                    <button 
                        className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming <span>({upcomingAppointments.length})</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                        onClick={() => setActiveTab('past')}
                    >
                        Past & Cancelled <span>({pastAppointments.length})</span>
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Loading appointments...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="empty-state">
                        <p>{activeTab === 'upcoming' ? "You don't have any upcoming appointments." : "No past appointments found."}</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {filteredAppointments.map((apt) => (
                            <div key={apt.id} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="firm-info">
                                        <div className="title-row">
                                            <h3>{apt.law_firm?.firm_name}</h3>
                                            <span className={`status-badge ${getStatusClass(apt.status)}`}>
                                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="specialization-group">
                                            <span className="specialization">{apt.specialization?.name || 'General Legal'}</span>
                                            {apt.law_firm?.phone && <span className="contact-mini">| {apt.law_firm.phone}</span>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="appointment-details-grid">
                                    <div className="detail-card">
                                        <div className="detail-icon date">📅</div>
                                        <div className="detail-text">
                                            <label>Date</label>
                                            <span>{new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z').toLocaleDateString(undefined, { 
                                                weekday: 'short', 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}</span>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <div className="detail-icon time">⏰</div>
                                        <div className="detail-text">
                                            <label>Time</label>
                                            <span>{new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z').toLocaleTimeString(undefined, { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}</span>
                                        </div>
                                    </div>
                                    <div className="detail-card full-width">
                                        <div className="detail-icon location">📍</div>
                                        <div className="detail-text">
                                            <label>Location</label>
                                            <span>{apt.law_firm?.address || 'Office Address'}</span>
                                        </div>
                                    </div>
                                </div>

                                {(apt.notes || apt.cancellation_reason) && (
                                    <div className="context-footer">
                                        {apt.notes && (
                                            <div className="appointment-notes">
                                                <strong>Client Notes:</strong>
                                                <p>{apt.notes}</p>
                                            </div>
                                        )}

                                        {apt.cancellation_reason && (
                                            <div className="cancellation-info">
                                                <strong>Reason for cancellation:</strong>
                                                <p>{apt.cancellation_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {apt.status === 'completed' && !apt.rating && (
                                    <div className="appointment-footer-actions">
                                        <div className="rate-prompt-text">
                                            <span>How was your consultation?</span>
                                        </div>
                                        <button 
                                            className="btn-rate-appointment"
                                            onClick={() => handleRateClick(apt)}
                                        >
                                            ⭐ Rate Now
                                        </button>
                                    </div>
                                )}

                                {apt.rating && (
                                    <div className="appointment-rating-display">
                                        <div className="rating-display-header">
                                            <strong>Your Rating & Review</strong>
                                            <div className="rating-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < apt.rating!.rating ? "star active" : "star"}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        {apt.rating.review && <p className="rating-review">"{apt.rating.review}"</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showRatingModal && selectedAppointment && (
                <div className="modal-overlay">
                    <div className="modal-content rating-modal">
                        <div className="modal-header">
                            <h2>Rate Your Consultation</h2>
                            <button className="close-btn" onClick={() => setShowRatingModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmitRating}>
                            <div className="modal-body">
                                <p>How was your experience with <strong>{selectedAppointment.law_firm?.firm_name}</strong>?</p>
                                
                                <div className="rating-input">
                                    <label>Rating</label>
                                    <div className="star-selector">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <span 
                                                key={num} 
                                                className={num <= rating ? "star-btn active" : "star-btn"}
                                                onClick={() => setRating(num)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="review-input">
                                    <label htmlFor="review">Your Review (Optional)</label>
                                    <textarea 
                                        id="review"
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        placeholder="Share your thoughts about the consultation..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowRatingModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}
