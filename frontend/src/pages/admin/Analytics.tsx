import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminDashboard.css';

export default function Analytics() {
    const [topSpecs, setTopSpecs] = useState<{ name: string; count: number }[]>([]);
    const [descriptive, setDescriptive] = useState<{
        most_performing: { id: number; firm_name: string; completed_appointments: number } | null;
        most_rated: { id: number; firm_name: string; average_rating: number; rating_count: number } | null;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dashboardData, appointmentData] = await Promise.all([
                api.getAdminDashboard(),
                api.getAppointmentAnalytics()
            ]);
            setTopSpecs(dashboardData.top_specializations);
            setDescriptive(appointmentData.descriptive);
        } catch {
            console.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="page-header">
                    <h2>📈 System Analytics</h2>
                    <p>Insights into system usage and legal trends</p>
                </div>

                {loading ? (
                    <div className="loading">Loading analytics...</div>
                ) : (
                    <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
                        {/* Descriptive Analytics */}
                        <section className="descriptive-analytics">
                            <div className="analytics-card highlight">
                                <div className="card-icon">🏆</div>
                                <div className="card-content">
                                    <h4>Most Performing Law Firm</h4>
                                    {descriptive?.most_performing ? (
                                        <>
                                            <p className="firm-name">{descriptive.most_performing.firm_name}</p>
                                            <p className="stat-desc">Completed <strong>{descriptive.most_performing.completed_appointments}</strong> appointments</p>
                                        </>
                                    ) : (
                                        <p className="no-data">Insufficient data</p>
                                    )}
                                </div>
                            </div>
                            <div className="analytics-card highlight">
                                <div className="card-icon">⭐</div>
                                <div className="card-content">
                                    <h4>Most Rated Law Firm</h4>
                                    {descriptive?.most_rated ? (
                                        <>
                                            <p className="firm-name">{descriptive.most_rated.firm_name}</p>
                                            <p className="stat-desc">
                                                Rating: <strong>{descriptive.most_rated.average_rating}</strong> ({descriptive.most_rated.rating_count} reviews)
                                            </p>
                                        </>
                                    ) : (
                                        <p className="no-data">Insufficient data</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="analytics-section">
                            <h3>📊 Top Requested Specializations</h3>
                            <div className="specialization-chart">
                                {topSpecs.map((spec, index) => (
                                    <div key={spec.name} className="spec-bar-item">
                                        <div className="spec-label">
                                            <span className="rank">#{index + 1}</span>
                                            <span className="name">{spec.name}</span>
                                            <span className="count">{spec.count}</span>
                                        </div>
                                        <div className="spec-bar">
                                            <div
                                                className="spec-fill"
                                                style={{
                                                    width: `${(spec.count / (topSpecs[0]?.count || 1)) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {topSpecs.length === 0 && (
                                    <p className="no-data">No data available</p>
                                )}
                            </div>
                        </section>
                        
                        {/* Future Analytics Sections could go here */}
                        <section className="analytics-section" style={{ marginTop: '2rem' }}>
                            <h3>📅 System Activity</h3>
                            <p className="no-data">More detailed analytics coming soon...</p>
                        </section>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
