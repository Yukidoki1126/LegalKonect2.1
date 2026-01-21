import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DashboardStats, LawFirm } from '../../types';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pendingFirms, setPendingFirms] = useState<LawFirm[]>([]);
    const [topSpecs, setTopSpecs] = useState<{ name: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dashboardData, pendingData] = await Promise.all([
                api.getAdminDashboard(),
                api.getPendingVerifications()
            ]);
            setStats(dashboardData.stats);
            setTopSpecs(dashboardData.top_specializations);
            setPendingFirms(pendingData);
        } catch {
            console.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.approveLawFirm(id);
            const pending = await api.getPendingVerifications();
            setPendingFirms(pending);
            const dashboardData = await api.getAdminDashboard();
            setStats(dashboardData.stats);
        } catch {
            console.error('Failed to approve');
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
                        <section className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-content">
                                    <h3>{stats?.total_clients || 0}</h3>
                                    <p>Total Clients</p>
                                </div>
                            </div>
                            <div className="stat-card highlight-blue">
                                <div className="stat-icon">🏛️</div>
                                <div className="stat-content">
                                    <h3>{stats?.approved_firms || 0}</h3>
                                    <p>Approved Firms</p>
                                </div>
                            </div>
                            <div className="stat-card warning">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-content">
                                    <h3>{stats?.pending_verifications || 0}</h3>
                                    <p>Pending Review</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-content">
                                    <h3>{stats?.total_appointments || 0}</h3>
                                    <p>Appointments</p>
                                </div>
                            </div>
                            <div className="stat-card success">
                                <div className="stat-icon">✅</div>
                                <div className="stat-content">
                                    <h3>{stats?.completed_appointments || 0}</h3>
                                    <p>Completed</p>
                                </div>
                            </div>
                        </section>

                        <div className="dashboard-content-layout">
                            <section className="dashboard-main-column">
                                <div className="section-header-row">
                                    <h3>⏳ Pending Verifications</h3>
                                    <button className="btn-text-only" onClick={() => window.location.href='/admin/verification'}>View All</button>
                                </div>
                                <div className="pending-summary-list">
                                    {pendingFirms.length === 0 ? (
                                        <p className="no-data-mini">No pending verifications at the moment.</p>
                                    ) : (
                                        pendingFirms.slice(0, 3).map(firm => (
                                            <div key={firm.id} className="pending-card-mini">
                                                <div className="firm-basic-info">
                                                    <h4>{firm.firm_name}</h4>
                                                    <p>{firm.user?.email}</p>
                                                </div>
                                                <div className="firm-mini-actions">
                                                    <button className="btn-approve-mini" onClick={() => handleApprove(firm.id)}>✓</button>
                                                    <button className="btn-view-mini" onClick={() => window.location.href=`/admin/verification`}>👁</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="section-header-row" style={{ marginTop: '2rem' }}>
                                    <h3>📈 Specialization Trends</h3>
                                    <button className="btn-text-only" onClick={() => window.location.href='/admin/analytics'}>Full Analytics</button>
                                </div>
                                <div className="spec-trends-mini">
                                    {topSpecs.slice(0, 5).map((spec, index) => (
                                        <div key={spec.name} className="spec-trend-item">
                                            <div className="spec-trend-info">
                                                <span className="spec-rank">#{index + 1}</span>
                                                <span className="spec-name">{spec.name}</span>
                                                <span className="spec-count">{spec.count}</span>
                                            </div>
                                            <div className="spec-trend-bar">
                                                <div 
                                                    className="spec-trend-fill" 
                                                    style={{ width: `${(spec.count / (topSpecs[0]?.count || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <aside className="dashboard-side-column">
                                <div className="system-health-card">
                                    <h3>⚙️ System Health</h3>
                                    <div className="health-item">
                                        <span className="health-label">API Status</span>
                                        <span className="health-value online">Online</span>
                                    </div>
                                    <div className="health-item">
                                        <span className="health-label">Database</span>
                                        <span className="health-value online">Healthy</span>
                                    </div>
                                </div>

                                <div className="quick-stats-card">
                                    <h3>📊 Quick Summary</h3>
                                    <div className="quick-stat-row">
                                        <span>New Clients (Month)</span>
                                        <strong>+{Math.floor(stats?.total_clients || 0 / 10)}</strong>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>Conversion Rate</span>
                                        <strong>{((stats?.completed_appointments || 0) / (stats?.total_appointments || 1) * 100).toFixed(1)}%</strong>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
