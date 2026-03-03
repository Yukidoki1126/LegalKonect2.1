import React, { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQItem {
    question: string;
    answer: string;
}

const faqItems: FAQItem[] = [
    {
        question: "How do I find a law firm that matches my needs?",
        answer: "Our system automatically recommends law firms based on your legal needs (specializations you selected), your location, the firm's ratings, and their years of experience. The match percentage shows how well a firm aligns with your requirements."
    },
    {
        question: "What does the Match Score mean?",
        answer: "The Match Score (0-100%) indicates how well a law firm matches your needs. It's calculated based on: Specialization Match (40%), Distance (20%), Ratings (25%), and Experience (15%). A higher score means the firm is a better fit for you."
    },
    {
        question: "How do I book an appointment?",
        answer: "Click the 'Book' button on any law firm card, then fill in the details about your legal matter. The law firm will review your request and confirm the appointment. You can track all your appointments in the 'My Appointments' section."
    },
    {
        question: "How do I update my location?",
        answer: "Go to 'Settings' from the sidebar menu. You can either click on the map to pin your exact location, use the address search bar, or click 'Use Current Location' to automatically detect your position."
    },
    {
        question: "How do I change my legal needs/specializations?",
        answer: "Visit the 'Settings' page and scroll to the 'Legal Needs' section. You can select or deselect any specialization that matches your current legal requirements. This will update your recommendations."
    },
    {
        question: "What do the appointment statuses mean?",
        answer: "• Pending: Your request is awaiting review by the law firm\n• Confirmed: The appointment has been accepted\n• Completed: The consultation has finished\n• Cancelled: The appointment was cancelled by either party\n• Rejected: The law firm declined the appointment"
    },
    {
        question: "How can I rate a law firm?",
        answer: "After your appointment is marked as 'Completed', you'll be able to leave a rating. Go to 'My Appointments', find the completed appointment, and click on the rating stars or 'Leave Review' button."
    },
    {
        question: "Why can't I see some law firms?",
        answer: "Only law firms that have been verified and approved by our admin team appear in recommendations. This ensures you're connected with legitimate legal service providers."
    },
    {
        question: "How is the distance calculated?",
        answer: "Distance is calculated as a straight line (as the crow flies) between your pinned location and the law firm's location. Actual travel distance may vary based on roads and traffic."
    },
    {
        question: "How do I get directions to a law firm?",
        answer: "Click the navigation arrow icon (➤) on any law firm card, or use the 'Get Directions' button when viewing a firm's details. This will open Google Maps with directions from your location."
    },
    {
        question: "Is my personal information secure?",
        answer: "Yes, we take your privacy seriously. Your personal information and location data are securely stored and only used to provide you with relevant law firm recommendations. We never share your data with third parties."
    },
    {
        question: "How do I change my password?",
        answer: "Go to 'Settings' and scroll down to find the 'Change Password' section. Enter your current password and your new password twice to confirm the change."
    }
];

export default function FloatingFAQ() {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <>
            {/* FAQ Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <Card className="shadow-2xl border-primary/20">
                        <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-primary" />
                                    Frequently Asked Questions
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Find answers to common questions
                            </p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[400px] max-h-[60vh] overflow-y-auto">
                                <div className="p-4 space-y-2">
                                    {faqItems.map((faq, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleExpand(index)}
                                                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                                            >
                                                <span className="font-medium text-sm pr-2">
                                                    {faq.question}
                                                </span>
                                                {expandedIndex === index ? (
                                                    <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                )}
                                            </button>
                                            {expandedIndex === index && (
                                                <div className="px-3 pb-3 text-sm text-muted-foreground whitespace-pre-line animate-in slide-in-from-top-2 duration-200">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
                    isOpen 
                        ? 'bg-muted hover:bg-muted/80 text-foreground' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
                size="icon"
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <HelpCircle className="h-6 w-6" />
                )}
            </Button>

            {/* Tooltip when closed */}
            {!isOpen && (
                <div className="fixed bottom-[5.5rem] right-6 z-40 pointer-events-none">
                    <div className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg opacity-0 hover:opacity-100 transition-opacity">
                        Need help?
                    </div>
                </div>
            )}
        </>
    );
}
