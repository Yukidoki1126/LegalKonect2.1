import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, FileCheck, TrendingUp, LogOut, Scale } from '../icons/Icons';
import './AdminLayout.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Scale className="logo-icon" size={24} />
                    <span className="logo-text">LegalKonect</span>
                </div>
                
                <nav className="sidebar-nav">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <LayoutDashboard className="icon" size={20} />
                        <span className="label">Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/verification" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FileCheck className="icon" size={20} />
                        <span className="label">Verification</span>
                    </NavLink>
                    <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <TrendingUp className="icon" size={20} />
                        <span className="label">Analytics</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">AD</div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || 'Admin'}</span>
                            <span className="user-role">System Admin</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut className="icon" size={20} />
                        <span className="label">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main-content">
                <header className="admin-top-header">
                    <div className="header-search">
                        {/* Could add a search bar here if needed */}
                    </div>
                    <div className="header-actions">
                        {/* Notifications, etc. */}
                    </div>
                </header>
                <div className="admin-page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
