import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    LayoutDashboard, 
    Calendar, 
    Settings, 
    LogOut, 
    Scale,
    Menu,
    X,
    Search,
    Bell,
    User,
    ChevronDown
} from 'lucide-react';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayoutNew({ children }: ClientLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Find Lawfirms', href: '/client/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', href: '/client/appointments', icon: Calendar }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border">
                <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Scale className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">LegalKonect</span>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <nav className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <Button variant="ghost" size="sm" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                        </Button>

                        {/* User Menu - Desktop */}
                        <div className="hidden md:block relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">Client</p>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </Button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                                        <div className="p-3 border-b border-border">
                                            <p className="text-sm font-medium">{user?.name}</p>
                                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start gap-2"
                                                onClick={() => {
                                                    setUserMenuOpen(false);
                                                    navigate('/client/settings');
                                                }}
                                            >
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start gap-2"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-card">
                        {/* Navigation Links */}
                        <nav className="p-2">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
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

                        {/* User Info - Mobile */}
                        <div className="p-4 border-t border-border">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        navigate('/client/settings');
                                    }}
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main content */}
            <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
