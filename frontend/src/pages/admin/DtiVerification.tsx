import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, FileSearch, AlertCircle, Loader2 } from 'lucide-react';

export default function DtiVerification() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const DTI_URL = 'https://bnrs.dti.gov.ph/search';

    const handleIframeLoad = () => {
        setLoading(false);
    };

    const handleIframeError = () => {
        setLoading(false);
        setError(true);
    };

    const openInNewTab = () => {
        window.open(DTI_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <AdminLayout>
            <div className="h-full">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            The DTI website cannot be embedded.
                            <Button
                                variant="link"
                                size="sm"
                                onClick={openInNewTab}
                                className="ml-2 h-auto p-0 text-destructive underline"
                            >
                                Click here to open in a new tab
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* DTI Verification Iframe */}
                <Card className="overflow-hidden border-0 shadow-none">
                    <CardContent className="p-0 relative">
                        {loading && !error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Loading DTI verification portal...</p>
                                </div>
                            </div>
                        )}
                        <iframe
                            src={DTI_URL}
                            className="w-full border-0"
                            style={{ height: 'calc(100vh - 180px)', minHeight: '700px' }}
                            title="DTI Business Name Registration Search"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
