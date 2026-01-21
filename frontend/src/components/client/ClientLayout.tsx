import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Calendar, Settings, LogOut, Scale } from '../icons/Icons';
import './ClientLayout.css';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="client-layout">
            <main className="client-main-content">
                <header className="client-top-header">
                    <div className="header-left">
                        <div className="header-logo">
                            <Scale className="logo-icon" size={24} />
                            <span className="logo-text">LegalKonect</span>
                        </div>
                    </div>

                    <div className="header-center">
                        <nav className="header-nav">
                            <NavLink to="/client/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Dashboard">
                                <Home className="icon" size={20} />
                                <span className="label">Dashboard</span>
                            </NavLink>
                            <NavLink to="/client/appointments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Appointments">
                                <Calendar className="icon" size={20} />
                                <span className="label">Appointments</span>
                            </NavLink>
                        </nav>
                    </div>
                    
                    <div className="header-right">
                        <span className="user-welcome">Welcome, {user?.name}</span>
                        <div className="header-actions">
                            <NavLink to="/client/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Profile Setting">
                                <Settings className="icon" size={20} />
                                <span className="label">Settings</span>
                            </NavLink>
                            <button onClick={handleLogout} className="btn-logout-header" title="Logout">
                                <LogOut className="icon" size={20} />
                                <span className="label">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>
                <div className="client-page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
