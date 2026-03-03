<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LegalKonect Support Reply</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 28px 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .greeting { font-size: 16px; color: #1a1a1a; margin: 0 0 16px; }
        .intro { font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 24px; }
        .original-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .original-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px; }
        .original-subject { font-size: 14px; font-weight: 600; color: #334155; margin: 0 0 6px; }
        .original-message { font-size: 13px; color: #64748b; line-height: 1.5; margin: 0; white-space: pre-wrap; }
        .reply-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .reply-label { font-size: 11px; font-weight: 600; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px; }
        .reply-text { font-size: 14px; color: #1e3a5f; line-height: 1.6; margin: 0; white-space: pre-wrap; }
        .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer p { font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5; }
        .footer a { color: #2563eb; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>LegalKonect</h1>
                <p>Support Team Response</p>
            </div>
            <div class="body">
                <p class="greeting">Hi {{ $contactMessage->name }},</p>
                <p class="intro">Thank you for reaching out to us. Our support team has reviewed your inquiry and provided a response below.</p>

                <div class="original-box">
                    <p class="original-label">Your Original Message</p>
                    <p class="original-subject">{{ $contactMessage->subject }}</p>
                    <p class="original-message">{{ $contactMessage->message }}</p>
                </div>

                <div class="reply-box">
                    <p class="reply-label">Our Response</p>
                    <p class="reply-text">{{ $replyText }}</p>
                </div>

                <p class="intro">If you have any further questions or need additional assistance, feel free to reach out to us again through our contact page.</p>
            </div>
            <div class="footer">
                <p>This email was sent by <a href="#">LegalKonect</a> Support Team.<br>Please do not reply directly to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
