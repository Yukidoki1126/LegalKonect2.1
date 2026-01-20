import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DashboardStats } from '../../types';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const dashboardData = await api.getAdminDashboard();
            setStats(dashboardData.stats);
        } catch {
            console.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="page-header">
                    <h2>📊 System Overview</h2>
                    <p>Key performance indicators and system statistics</p>
                </div>

                {loading ? (
                    <div className="loading">Loading dashboard...</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <section className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-content">
                                    <h3>{stats?.total_clients || 0}</h3>
                                    <p>Total Clients</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🏛️</div>
                                <div className="stat-content">
                                    <h3>{stats?.approved_firms || 0}</h3>
                                    <p>Approved Law Firms</p>
                                </div>
                            </div>
                            <div className="stat-card warning">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-content">
                                    <h3>{stats?.pending_verifications || 0}</h3>
                                    <p>Pending Verifications</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-content">
                                    <h3>{stats?.total_appointments || 0}</h3>
                                    <p>Total Appointments</p>
                                </div>
                            </div>
                            <div className="stat-card success">
                                <div className="stat-icon">✅</div>
                                <div className="stat-content">
                                    <h3>{stats?.completed_appointments || 0}</h3>
                                    <p>Completed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⭐</div>
                                <div className="stat-content">
                                    <h3>{stats?.average_rating?.toFixed(1) || '0.0'}</h3>
                                    <p>Average Rating</p>
                                </div>
                            </div>
                        </section>
                        
                        <div className="info-grid">
                            <div className="info-card">
                                <h3>🚀 Quick Actions</h3>
                                <div className="action-buttons">
                                    <button className="btn-primary" onClick={() => window.location.href='/admin/verification'}>
                                        Review Pending Firms
                                    </button>
                                    <button className="btn-secondary" onClick={() => window.location.href='/admin/analytics'}>
                                        View Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
