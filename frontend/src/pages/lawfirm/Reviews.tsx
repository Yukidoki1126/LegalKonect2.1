import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LawFirm } from '../../types';
import LawFirmLayout from '../../components/lawfirm/LawFirmLayout';
import './LawFirmDashboard.css';

export default function Reviews() {
    const [lawFirm, setLawFirm] = useState<LawFirm | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getLawFirmProfile();
            setLawFirm(data);
        } catch {
            console.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const averageRating = lawFirm?.ratings && lawFirm.ratings.length > 0
        ? (lawFirm.ratings.reduce((acc, r) => acc + r.rating, 0) / lawFirm.ratings.length).toFixed(1)
        : '0.0';

    return (
        <LawFirmLayout>
            <div className="law-firm-reviews">
                <div className="page-header">
                    <h2>⭐ Client Reviews</h2>
                    <p>Feedback and ratings from your clients</p>
                </div>

                {loading ? (
                    <div className="loading">Loading reviews...</div>
                ) : (
                    <div className="reviews-container">
                        <section className="rating-summary">
                            <div className="summary-card">
                                <span className="big-rating">{averageRating}</span>
                                <div className="stars">
                                    {'⭐'.repeat(Math.round(Number(averageRating)))}
                                </div>
                                <span className="total-reviews">{lawFirm?.ratings?.length || 0} Total Reviews</span>
                            </div>
                        </section>

                        <section className="reviews-list-section">
                            <h3>All Reviews</h3>
                            <div className="reviews-list">
                                {lawFirm?.ratings && lawFirm.ratings.length > 0 ? (
                                    lawFirm.ratings
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .map((rating) => (
                                        <div key={rating.id} className="review-card">
                                            <div className="review-header">
                                                <div className="client-info">
                                                    <div className="client-avatar">
                                                        {rating.client?.user?.name?.[0] || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="client-name">{rating.client?.user?.name || 'Anonymous'}</p>
                                                        <p className="review-date">{new Date(rating.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="rating-stars">
                                                    {'⭐'.repeat(rating.rating)}
                                                </div>
                                            </div>
                                            {rating.review && <p className="review-text">{rating.review}</p>}
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">No reviews received yet.</p>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </LawFirmLayout>
    );
}
