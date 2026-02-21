import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isClient: boolean;
    isLawFirm: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                try {
                    // Add additional timeout wrapper (10 seconds max for initial auth)
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        setTimeout(() => reject(new Error('Authentication timeout')), 10000);
                    });
                    
                    const userData = await Promise.race([
                        api.getUser(),
                        timeoutPromise
                    ]);
                    
                    setUser(userData as User);
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    // Clear invalid/expired token
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
    };

    const logout = async () => {
        // Clear local state immediately
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        
        // Try to notify backend (don't wait for response)
        try {
            // Use a short timeout and don't wait for completion
            api.logout().catch(() => {
                // Silently ignore backend errors
            });
        } catch {
            // Ignore any errors
        }
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const userData = await api.getUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        loading,
        login,
        logout,
        setUser,
        refreshUser,
        isAuthenticated: !!user,
        isClient: user?.role === 'client',
        isLawFirm: user?.role === 'law_firm',
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
