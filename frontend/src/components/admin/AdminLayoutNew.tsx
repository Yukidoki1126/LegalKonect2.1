import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    LayoutDashboard,
    FileCheck,
    TrendingUp,
    LogOut,
    Scale,
    Bell,
    Search,
    Menu,
    FileSearch,
    Sun,
    Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import api from '@/services/api';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState<number>(0);

    useEffect(() => {
        loadPendingCount();
        const interval = setInterval(loadPendingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadPendingCount = async () => {
        try {
            const pending = await api.getPendingVerifications();
            setPendingCount(pending.length);
        } catch {
            console.error('Failed to load pending count');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        {
            to: '/admin/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
            badge: null
        },
        {
            to: '/admin/verification',
            icon: FileCheck,
            label: 'Verification',
            badge: pendingCount > 0 ? pendingCount.toString() : null
        },
        {
            to: '/admin/dti-verification',
            icon: FileSearch,
            label: 'DTI Verification',
            badge: null
        },
        {
            to: '/admin/analytics',
            icon: TrendingUp,
            label: 'Analytics',
            badge: null
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-8 py-6 border-b border-border">
                        <div className="p-1.5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg shadow-md shadow-blue-500/20">
                            <Scale className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-foreground">LegalKonect</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="flex-1 font-medium">{item.label}</span>
                                {item.badge && (
                                    <Badge variant="destructive" className="ml-auto">
                                        {item.badge}
                                    </Badge>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-md shadow-blue-500/20">
                                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-foreground">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-muted-foreground">System Administrator</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full text-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                    <div className="flex items-center justify-between gap-4 px-8 py-4">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-foreground"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>

                        {/* Spacer for mobile */}
                        <div className="flex-1 lg:hidden"></div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="text-foreground"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
