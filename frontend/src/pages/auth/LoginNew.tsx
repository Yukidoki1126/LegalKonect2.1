import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/services/api';
import { Scale, Mail, Lock, ArrowRight, User, Building2, Shield, Star, CheckCircle, X, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const redirectByRole = useCallback((role: string) => {
        switch (role) {
            case 'client':
                navigate('/client/dashboard');
                break;
            case 'law_firm':
                navigate('/law-firm/dashboard');
                break;
            case 'admin':
                navigate('/admin/dashboard');
                break;
            default:
                navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        if (isAuthenticated && user) {
            redirectByRole(user.role);
        }
    }, [isAuthenticated, user, redirectByRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMessage({ type: '', text: '' });
        setForgotLoading(true);

        try {
            const response = await api.forgotPassword(forgotEmail);
            setForgotMessage({ type: 'success', text: response.message });
            setForgotEmail('');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setForgotMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to send reset email' 
            });
        } finally {
            setForgotLoading(false);
        }
    };

    const features = [
        { icon: Shield, title: 'Verified Law Firms', desc: 'All firms are verified and licensed' },
        { icon: Star, title: 'Smart Matching', desc: 'Find the best match for your needs' },
        { icon: CheckCircle, title: 'Easy Booking', desc: 'Schedule appointments instantly' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>
                
                {/* Floating Orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-500" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                            <Scale className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">LegalKonect</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                        Find the Right
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                            Legal Partner
                        </span>
                    </h1>
                    
                    <p className="text-lg text-white/80 mb-12 max-w-md">
                        Connect with verified law firms that match your specific needs. Get expert legal assistance with just a few clicks.
                    </p>

                    {/* Features */}
                    <div className="space-y-4">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 transform hover:scale-[1.02] transition-all duration-300"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-lg shadow-lg shadow-amber-500/30">
                                    <feature.icon className="h-5 w-5 text-blue-900" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{feature.title}</h3>
                                    <p className="text-sm text-white/70">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-12 flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 border-2 border-blue-600 flex items-center justify-center shadow-lg">
                                    <User className="h-5 w-5 text-blue-900" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-white font-semibold">Trusted Platform</p>
                            <p className="text-amber-200/80 text-sm">Connecting Clients & Lawyers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                            <Scale className="h-6 w-6 text-amber-300" />
                        </div>
                        <span className="text-2xl font-bold text-blue-900 dark:text-white">LegalKonect</span>
                    </div>

                    {/* Glassmorphism Card */}
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-white/50 dark:border-slate-700/50">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Welcome back
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Sign in to access your account
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-shake">
                                <div className="p-1 bg-red-100 dark:bg-red-800 rounded-full">
                                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <span className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Email Address
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-600' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                        placeholder="your.email@example.com"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Password
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                        placeholder="Enter your password"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden group"
                            >
                                <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                                    Sign In
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                {loading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-600" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-500 dark:text-slate-400">
                                    New to LegalKonect?
                                </span>
                            </div>
                        </div>

                        {/* Register Options */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                to="/register/client"
                                className="group flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-2 border-slate-200 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-600 rounded-xl transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg group-hover:scale-110 transition-transform">
                                    <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">As Client</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Find legal help</span>
                            </Link>
                            <Link
                                to="/register/law-firm"
                                className="group flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:scale-110 transition-transform">
                                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">As Law Firm</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Grow practice</span>
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowForgotPassword(false);
                            setForgotMessage({ type: '', text: '' });
                            setForgotEmail('');
                        }}
                    />
                    
                    {/* Modal */}
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 animate-modal-in">
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowForgotPassword(false);
                                setForgotMessage({ type: '', text: '' });
                                setForgotEmail('');
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
                                <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Enter your email and we'll send you a reset link
                            </p>
                        </div>

                        {/* Message */}
                        {forgotMessage.text && (
                            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                                forgotMessage.type === 'success' 
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            }`}>
                                <CheckCircle className={`h-5 w-5 ${
                                    forgotMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`} />
                                <span className={`text-sm font-medium ${
                                    forgotMessage.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                }`}>
                                    {forgotMessage.text}
                                </span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                        placeholder="your.email@example.com"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setForgotMessage({ type: '', text: '' });
                                        setForgotEmail('');
                                    }}
                                    className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {forgotLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        'Send Link'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modal-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-modal-in {
                    animation: modal-in 0.3s ease-out;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
