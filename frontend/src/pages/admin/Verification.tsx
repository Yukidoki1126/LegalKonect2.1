import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LawFirm } from '../../types';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminDashboard.css';

export default function Verification() {
    const [pendingFirms, setPendingFirms] = useState<LawFirm[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
    const [viewingFirm, setViewingFirm] = useState<LawFirm | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const pending = await api.getPendingVerifications();
            setPendingFirms(pending);
        } catch {
            console.error('Failed to load pending verifications');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.approveLawFirm(id);
            loadData();
        } catch {
            console.error('Failed to approve');
        }
    };

    const handleReject = async (id: number) => {
        if (!rejectReason.trim()) return;
        try {
            await api.rejectLawFirm(id, rejectReason);
            setShowRejectModal(null);
            setRejectReason('');
            loadData();
        } catch {
            console.error('Failed to reject');
        }
    };

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="page-header">
                    <h2>📜 Law Firm Verification</h2>
                    <p>Review and approve new law firm registrations</p>
                </div>

                {loading ? (
                    <div className="loading">Loading verifications...</div>
                ) : (
                    <section className="pending-section">
                        <h3>⏳ Pending Verifications ({pendingFirms.length})</h3>
                        {pendingFirms.length === 0 ? (
                            <p className="no-data">No pending verifications</p>
                        ) : (
                            <div className="pending-list">
                                {pendingFirms.map((firm) => (
                                    <div key={firm.id} className="pending-card">
                                        <div className="firm-info">
                                            <h4>{firm.firm_name}</h4>
                                            <p className="contact">{firm.user?.name} • {firm.user?.email}</p>
                                            {firm.license_number && (
                                                <p className="license">License: {firm.license_number}</p>
                                            )}
                                            <div className="specializations">
                                                {firm.specializations?.map((s) => (
                                                    <span key={s.id} className="tag">{s.name}</span>
                                                ))}
                                            </div>
                                            {firm.description && (
                                                <p className="description">{firm.description}</p>
                                            )}
                                        </div>
                                        <div className="firm-actions">
                                            <button
                                                className="btn-view"
                                                onClick={() => setViewingFirm(firm)}
                                            >
                                                👁 View
                                            </button>
                                            <button
                                                className="btn-approve"
                                                onClick={() => handleApprove(firm.id)}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                className="btn-reject"
                                                onClick={() => setShowRejectModal(firm.id)}
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Reject Law Firm</h3>
                            <p>Please provide a reason for rejection:</p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                rows={4}
                            />
                            <div className="modal-actions">
                                <button onClick={() => setShowRejectModal(null)}>Cancel</button>
                                <button
                                    className="btn-reject"
                                    onClick={() => handleReject(showRejectModal)}
                                    disabled={!rejectReason.trim()}
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Application Modal */}
                {viewingFirm && (
                    <div className="modal-overlay">
                        <div className="modal view-modal">
                            <div className="modal-header">
                                <h3>Law Firm Application</h3>
                                <button className="close-btn" onClick={() => setViewingFirm(null)}>×</button>
                            </div>
                            
                            <div className="view-content">
                                <section className="view-section">
                                    <h4>👤 Account Information</h4>
                                    <div className="info-row">
                                        <span className="label">Contact Person:</span>
                                        <span className="value">{viewingFirm.user?.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Account Email:</span>
                                        <span className="value">{viewingFirm.user?.email}</span>
                                    </div>
                                </section>

                                <section className="view-section">
                                    <h4>🏛️ Firm Information</h4>
                                    <div className="info-row">
                                        <span className="label">Firm Name:</span>
                                        <span className="value">{viewingFirm.firm_name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Firm Email:</span>
                                        <span className="value">{viewingFirm.email || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Phone:</span>
                                        <span className="value">{viewingFirm.phone || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Address:</span>
                                        <span className="value">{viewingFirm.address || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">License Number:</span>
                                        <span className="value">{viewingFirm.license_number || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Description:</span>
                                        <p className="value description">{viewingFirm.description || 'No description provided.'}</p>
                                    </div>
                                </section>

                                <section className="view-section">
                                    <h4>⚖️ Specializations</h4>
                                    <div className="specializations-list">
                                        {viewingFirm.specializations && viewingFirm.specializations.length > 0 ? (
                                            viewingFirm.specializations.map(s => (
                                                <span key={s.id} className="tag">{s.name}</span>
                                            ))
                                        ) : (
                                            <span className="no-data">No specializations selected.</span>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setViewingFirm(null)}>Close</button>
                                <div className="action-group">
                                    <button 
                                        className="btn-reject" 
                                        onClick={() => {
                                            setShowRejectModal(viewingFirm.id);
                                            setViewingFirm(null);
                                        }}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        className="btn-approve" 
                                        onClick={() => {
                                            handleApprove(viewingFirm.id);
                                            setViewingFirm(null);
                                        }}
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
