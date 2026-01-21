import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Calendar, ClipboardList, Star, Settings, LogOut, Scale } from '../icons/Icons';
import './LawFirmLayout.css';

interface LawFirmLayoutProps {
    children: React.ReactNode;
}

export default function LawFirmLayout({ children }: LawFirmLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const lawFirm = user?.law_firm;
    const isApproved = lawFirm?.verification_status === 'approved';

    return (
        <div className="law-firm-layout">
            <aside className="law-firm-sidebar">
                <div className="sidebar-header">
                    <Scale className="logo-icon" size={24} />
                    <span className="logo-text">LegalKonect</span>
                </div>
                
                <nav className="sidebar-nav">
                    <NavLink to="/law-firm/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <LayoutDashboard className="icon" size={20} />
                        <span className="label">Dashboard</span>
                    </NavLink>
                    {isApproved && (
                        <>
                            <NavLink to="/law-firm/appointments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                <ClipboardList className="icon" size={20} />
                                <span className="label">Appointments</span>
                            </NavLink>
                            <NavLink to="/law-firm/calendar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                <Calendar className="icon" size={20} />
                                <span className="label">Calendar</span>
                            </NavLink>
                            <NavLink to="/law-firm/reviews" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                <Star className="icon" size={20} />
                                <span className="label">Reviews</span>
                            </NavLink>
                        </>
                    )}
                    <NavLink to="/law-firm/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Settings className="icon" size={20} />
                        <span className="label">Profile Setting</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">{lawFirm?.firm_name?.substring(0, 2).toUpperCase() || 'LF'}</div>
                        <div className="user-details">
                            <span className="user-name">{lawFirm?.firm_name || 'Law Firm'}</span>
                            <span className="user-role">{isApproved ? 'Verified Firm' : 'Pending Verification'}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut className="icon" size={20} />
                        <span className="label">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="law-firm-main-content">
                <header className="law-firm-top-header">
                    <div className="header-status">
                        {isApproved ? (
                            <span className="status-badge verified">✓ Verified Account</span>
                        ) : (
                            <span className="status-badge pending">⏳ Verification Pending</span>
                        )}
                    </div>
                    <div className="header-actions">
                        <span className="user-welcome">Welcome, {user?.name}</span>
                    </div>
                </header>
                <div className="law-firm-page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
