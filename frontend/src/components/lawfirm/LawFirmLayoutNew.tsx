import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Star,
    Settings,
    LogOut,
    Scale,
    Menu,
    X,
    Search,
    Bell,
    CheckCircle,
    Clock
} from 'lucide-react';

interface LawFirmLayoutProps {
    children: React.ReactNode;
}

export default function LawFirmLayoutNew({ children }: LawFirmLayoutProps) {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const lawFirm = user?.law_firm;
    const isApproved = lawFirm?.verification_status === 'approved';
    const isPending = lawFirm?.verification_status === 'pending';

    // Poll for approval status changes when pending
    useEffect(() => {
        if (isPending) {
            const statusCheckInterval = setInterval(async () => {
                await refreshUser();
            }, 10000);

            return () => clearInterval(statusCheckInterval);
        }
    }, [isPending, refreshUser]);

    const navigation = [
        {
            name: 'Dashboard',
            href: '/law-firm/dashboard',
            icon: LayoutDashboard,
            show: true
        },
        {
            name: 'Appointments',
            href: '/law-firm/appointments',
            icon: ClipboardList,
            show: isApproved
        },
        {
            name: 'Calendar',
            href: '/law-firm/calendar',
            icon: Calendar,
            show: isApproved
        },
        {
            name: 'Reviews',
            href: '/law-firm/reviews',
            icon: Star,
            show: isApproved
        },
        {
            name: 'Settings',
            href: '/law-firm/settings',
            icon: Settings,
            show: true
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar for desktop */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border hidden lg:block">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 h-16 px-6 border-b border-border">
                        <Scale className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">LegalKonect</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navigation.filter(item => item.show).map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                    {lawFirm?.firm_name?.substring(0, 2).toUpperCase() || 'LF'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {lawFirm?.firm_name || 'Law Firm'}
                                </p>
                                {isApproved ? (
                                    <Badge variant="outline" className="text-xs gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-xs gap-1">
                                        <Clock className="h-3 w-3" />
                                        Pending
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile sidebar */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:hidden">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Scale className="h-6 w-6 text-primary" />
                                    <span className="font-bold text-xl">LegalKonect</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <nav className="flex-1 px-3 py-4 space-y-1">
                                {navigation.filter(item => item.show).map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            }`
                                        }
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-border">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-primary">
                                            {lawFirm?.firm_name?.substring(0, 2).toUpperCase() || 'LF'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {lawFirm?.firm_name || 'Law Firm'}
                                        </p>
                                        {isApproved ? (
                                            <Badge variant="outline" className="text-xs gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs gap-1">
                                                <Clock className="h-3 w-3" />
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </aside>
                </>
            )}

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Status Badge */}
                    <div className="flex-1">
                        {isApproved ? (
                            <Badge className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Verified Account
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Verification Pending
                            </Badge>
                        )}
                    </div>

                    {/* User info */}
                    <div className="hidden lg:flex items-center gap-2">
                        <div className="text-right">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">Law Firm</p>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
