import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Recommendation, LawFirm } from '../../types';
import './Dashboard.css';

export default function ClientDashboard() {
    const { user, logout } = useAuth();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingFirm, setViewingFirm] = useState<LawFirm | null>(null);
    const [viewingData, setViewingData] = useState<{
        average_rating: number;
        rating_count: number;
        distance_km: number | null;
    } | null>(null);

    useEffect(() => {
        loadRecommendations();
    }, []);

    const handleViewFirm = async (id: number) => {
        try {
            const data = await api.viewLawFirm(id);
            setViewingFirm(data.law_firm);
            setViewingData({
                average_rating: data.average_rating,
                rating_count: data.rating_count,
                distance_km: data.distance_km
            });
        } catch {
            setError('Failed to load firm details');
        }
    };

    const loadRecommendations = async () => {
        try {
            const data = await api.getRecommendations();
            setRecommendations(data);
        } catch {
            setError('Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleGetDirections = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>⚖️ LawFirm Locator</h1>
                    <div className="user-info">
                        <span>Welcome, {user?.name}</span>
                        <button onClick={logout} className="btn-logout">Logout</button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-welcome">
                    <h2>Find Your Legal Assistance</h2>
                    <p>Based on your location and legal needs, here are our recommended law firms:</p>
                    {user?.client?.specializations && user.client.specializations.length > 0 && (
                        <div className="user-needs">
                            <span>Looking for: </span>
                            {user.client.specializations.map((s) => (
                                <span key={s.id} className="tag">{s.name}</span>
                            ))}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="loading">Loading recommendations...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : recommendations.length === 0 ? (
                    <div className="empty-state">
                        <p>No law firms found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="recommendations-grid">
                        {recommendations.map((rec, index) => (
                            <div key={rec.law_firm.id} className="firm-card">
                                <div className="firm-rank">#{index + 1}</div>
                                <div className="firm-header">
                                    <h3>{rec.law_firm.firm_name}</h3>
                                    <div className="firm-rating">
                                        <span className="stars">⭐ {rec.average_rating.toFixed(1)}</span>
                                        <span className="count">({rec.rating_count} reviews)</span>
                                    </div>
                                </div>

                                <div className="firm-specializations">
                                    {rec.law_firm.specializations?.map((s) => (
                                        <span
                                            key={s.id}
                                            className={`spec-tag ${rec.matching_specializations.includes(s.name) ? 'match' : ''}`}
                                        >
                                            {s.name}
                                        </span>
                                    ))}
                                </div>

                                <div className="firm-details">
                                    <div className="detail">
                                        <span className="icon">📍</span>
                                        <span>{rec.distance_km} km away</span>
                                    </div>
                                    {rec.law_firm.phone && (
                                        <div className="detail">
                                            <span className="icon">📞</span>
                                            <a href={`tel:${rec.law_firm.phone}`}>{rec.law_firm.phone}</a>
                                        </div>
                                    )}
                                    {rec.law_firm.email && (
                                        <div className="detail">
                                            <span className="icon">📧</span>
                                            <a href={`mailto:${rec.law_firm.email}`}>{rec.law_firm.email}</a>
                                        </div>
                                    )}
                                    {rec.law_firm.address && (
                                        <div className="detail">
                                            <span className="icon">🏢</span>
                                            <span>{rec.law_firm.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="firm-score">
                                    <div className="score-bar">
                                        <div className="score-fill" style={{ width: `${rec.total_score * 100}%` }}></div>
                                    </div>
                                    <span className="score-value">Match Score: {(rec.total_score * 100).toFixed(0)}%</span>
                                </div>

                                <div className="firm-actions">
                                    <button 
                                        className="btn-primary"
                                        onClick={() => handleViewFirm(rec.law_firm.id)}
                                    >
                                        👁 View Law Firm
                                    </button>
                                    {rec.law_firm.latitude && rec.law_firm.longitude && (
                                        <button
                                            className="btn-directions"
                                            onClick={() => handleGetDirections(rec.law_firm.latitude!, rec.law_firm.longitude!)}
                                        >
                                            🗺️ Get Directions
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* View Firm Modal */}
            {viewingFirm && viewingData && (
                <div className="modal-overlay" onClick={() => { setViewingFirm(null); setViewingData(null); }}>
                    <div className="modal-content maps-style" onClick={e => e.stopPropagation()}>
                        <div className="modal-hero">
                            <img src={`https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80&sig=${viewingFirm.id}`} alt={viewingFirm.firm_name} className="hero-image" />
                            <button className="close-button-circle" onClick={() => { setViewingFirm(null); setViewingData(null); }}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-main-info">
                                <h2>{viewingFirm.firm_name}</h2>
                                <div className="rating-overview">
                                    <span className="rating-score">{viewingData.average_rating.toFixed(1)}</span>
                                    <div className="rating-stars">
                                        {'⭐'.repeat(Math.round(viewingData.average_rating))}
                                    </div>
                                    <span className="rating-count">{viewingData.rating_count} reviews</span>
                                </div>
                                <div className="firm-status">
                                    <span className="category">Law Firm</span>
                                    {viewingData.distance_km && <span className="distance">• {viewingData.distance_km} km away</span>}
                                </div>
                            </div>

                            <div className="action-chips">
                                {viewingFirm.latitude && viewingFirm.longitude && (
                                    <button 
                                        className="action-chip primary"
                                        onClick={() => handleGetDirections(viewingFirm.latitude!, viewingFirm.longitude!)}
                                    >
                                        <span className="icon">🗺️</span>
                                        <span>Directions</span>
                                    </button>
                                )}
                                {viewingFirm.phone && (
                                    <a href={`tel:${viewingFirm.phone}`} className="action-chip">
                                        <span className="icon">📞</span>
                                        <span>Call</span>
                                    </a>
                                )}
                                {viewingFirm.email && (
                                    <a href={`mailto:${viewingFirm.email}`} className="action-chip">
                                        <span className="icon">📧</span>
                                        <span>Email</span>
                                    </a>
                                )}
                            </div>

                            <div className="info-list">
                                <div className="info-item">
                                    <span className="icon">📍</span>
                                    <p>{viewingFirm.address || 'Address not available'}</p>
                                </div>
                                {viewingFirm.phone && (
                                    <div className="info-item">
                                        <span className="icon">📞</span>
                                        <p>{viewingFirm.phone}</p>
                                    </div>
                                )}
                                <div className="info-item">
                                    <span className="icon">🕒</span>
                                    <p>Open • Closes 5:00 PM</p>
                                </div>
                            </div>

                            <section className="modal-section">
                                <h3>About the Firm</h3>
                                <p className="description-text">{viewingFirm.description || 'No description provided.'}</p>
                                <div className="modal-specializations">
                                    {viewingFirm.specializations?.map(s => (
                                        <span key={s.id} className="tag">{s.name}</span>
                                    ))}
                                </div>
                            </section>

                            <section className="modal-section reviews-section">
                                <div className="section-header">
                                    <h3>Reviews</h3>
                                    <button className="btn-text">Write a review</button>
                                </div>
                                <div className="reviews-list">
                                    {viewingFirm.ratings && viewingFirm.ratings.length > 0 ? (
                                        viewingFirm.ratings.map((rating) => (
                                            <div key={rating.id} className="review-item">
                                                <div className="review-header">
                                                    <div className="user-avatar">{rating.client?.user?.name?.[0] || 'U'}</div>
                                                    <div className="review-meta">
                                                        <span className="user-name">{rating.client?.user?.name || 'Anonymous User'}</span>
                                                        <div className="stars">
                                                            {'⭐'.repeat(rating.rating)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {rating.review && <p className="review-text">{rating.review}</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
