import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    ArrowLeft,
    MessageSquare,
    Clock,
    CheckCircle,
    Loader2,
    AlertCircle,
    HelpCircle,
    Bug,
    UserPlus,
    Shield,
} from 'lucide-react';
import logo from '@/assets/legalkonect.png';

type IssueCategory = 'general' | 'login' | 'account' | 'bug' | 'verification' | 'other';

const issueCategories: { value: IssueCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'general', label: 'General Inquiry', icon: <HelpCircle className="h-4 w-4" />, desc: 'Questions about our platform' },
    { value: 'login', label: 'Login Issues', icon: <Shield className="h-4 w-4" />, desc: "Can't access your account" },
    { value: 'account', label: 'Account Help', icon: <UserPlus className="h-4 w-4" />, desc: 'Registration or profile issues' },
    { value: 'bug', label: 'Report a Bug', icon: <Bug className="h-4 w-4" />, desc: 'Something not working right' },
    { value: 'verification', label: 'Verification', icon: <CheckCircle className="h-4 w-4" />, desc: 'Law firm verification help' },
    { value: 'other', label: 'Other', icon: <MessageSquare className="h-4 w-4" />, desc: 'Anything else' },
];

export default function ContactUs() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState<IssueCategory>('general');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.submitContactMessage({
                name,
                email,
                category,
                subject,
                message,
            });
            setSubmitted(true);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setName('');
        setEmail('');
        setCategory('general');
        setSubject('');
        setMessage('');
        setSubmitted(false);
        setError('');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-card border-b border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <Link to="/login" className="flex items-center gap-2 sm:gap-3 group">
                        <img src={logo} alt="LegalKonect" className="h-8 w-8 sm:h-9 sm:w-9" />
                    <span className="text-lg sm:text-xl font-bold text-foreground">LegalKonect</span>
                    </Link>
                    <Link
                        to="/login"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back to Login</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-14">
                {/* Page Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium mb-4">
                        <MessageSquare className="h-3.5 w-3.5" />
                        We're here to help
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                        Contact Us
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                        Having trouble or need assistance? Send us a message and we'll get back to you as soon as possible.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Contact Info Sidebar */}
                    <div className="lg:col-span-1 space-y-4 sm:space-y-5 order-2 lg:order-1">
                        {/* Contact Cards */}
                        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-5">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base">Get in Touch</h3>

                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="text-sm font-medium text-foreground">support@legalkonect.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="text-sm font-medium text-foreground">+63 912 345 6789</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Office</p>
                                    <p className="text-sm font-medium text-foreground">Davao City, Philippines</p>
                                </div>
                            </div>
                        </div>

                        {/* Response Time */}
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 sm:p-6 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-5 w-5" />
                                <h3 className="font-semibold text-sm sm:text-base">Response Time</h3>
                            </div>
                            <p className="text-sm text-white/80 mb-4">
                                We typically respond within 24 hours during business days.
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                                    <span className="text-white/70">Mon–Fri: 8AM–5PM</span>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Hint */}
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5 sm:p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Quick Tip</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400/80">
                                For login issues, try resetting your password first using the "Forgot Password?" link on the login page.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        <div className="bg-card rounded-2xl border border-border p-5 sm:p-8 shadow-sm">
                            {submitted ? (
                                /* Success State */
                                <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
                                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
                                        <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                                        Message Sent!
                                    </h2>
                                    <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-6">
                                        Thank you for reaching out. We'll review your message and get back to you within 24 hours.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleReset}
                                            className="px-5 py-2.5 text-sm font-medium border-2 border-border text-foreground rounded-xl hover:bg-accent transition-colors"
                                        >
                                            Send Another
                                        </button>
                                        <Link
                                            to="/login"
                                            className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                /* Form */
                                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                                            Send us a Message
                                        </h2>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            Fill out the form below and we'll respond as soon as we can.
                                        </p>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Name & Email */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-foreground">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                placeholder="Juan Dela Cruz"
                                                className="w-full px-4 py-3 bg-accent/50 border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background focus:ring-4 focus:ring-blue-500/20 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-foreground">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder="you@example.com"
                                                className="w-full px-4 py-3 bg-accent/50 border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background focus:ring-4 focus:ring-blue-500/20 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Issue Category */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">
                                            What do you need help with?
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {issueCategories.map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setCategory(cat.value)}
                                                    className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all text-xs sm:text-sm ${
                                                        category === cat.value
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                            : 'border-border hover:border-blue-300 dark:hover:border-blue-700 text-foreground'
                                                    }`}
                                                >
                                                    <span className={`flex-shrink-0 ${category === cat.value ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                                        {cat.icon}
                                                    </span>
                                                    <span className="font-medium truncate">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">
                                            Subject <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                            placeholder="Brief description of your issue"
                                            className="w-full px-4 py-3 bg-accent/50 border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background focus:ring-4 focus:ring-blue-500/20 transition-all text-sm"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                            rows={5}
                                            placeholder="Please describe your issue or question in detail..."
                                            className="w-full px-4 py-3 bg-accent/50 border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background focus:ring-4 focus:ring-blue-500/20 transition-all text-sm resize-none"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-10 sm:mt-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} LegalKonect. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link>
                        <Link to="/register/client" className="hover:text-blue-600 transition-colors">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
