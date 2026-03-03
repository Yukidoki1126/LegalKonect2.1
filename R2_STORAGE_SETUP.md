# R2 Storage Configuration Guide

## Issue
Images from Cloudflare R2 were returning `net::ERR_NAME_NOT_RESOLVED` errors because the R2 public URL was not properly configured or accessible.

## Solution Implemented

### Automatic Fallback System
The application now automatically handles R2 storage in two ways:

1. **Primary**: Uses R2 public URL (if configured and accessible)
2. **Fallback**: Uses backend proxy to serve files from R2

This means images will work automatically, even if R2 public access is not configured.

### How It Works

#### Image URLs Generated:
- **With R2 Public URL**: `https://pub-xxx.r2.dev/law-firms/1/image.jpg`
- **Without Public URL**: `http://localhost:8000/api/storage/law-firms/1/image.jpg`

The backend proxy (`/api/storage/{path}`) fetches files from R2 and serves them to the frontend.

## To Enable R2 Public Access (Optional)

If you want to use direct R2 URLs (faster, no backend load), follow these steps:

### Step 1: Enable Public Access in Cloudflare Dashboard

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** → Select your bucket (`lawfirmlocate`)
3. Click on **Settings** tab
4. Scroll to **Public Access** section
5. Click **"Allow Access"** button
6. Copy the public R2.dev URL provided (e.g., `https://pub-xxxxx.r2.dev`)

### Step 2: Update Environment Variable

Update your `backend/.env` file:

```env
# Replace with the actual public URL from Cloudflare
CLOUDFLARE_R2_URL=https://pub-xxxxx.r2.dev
```

### Step 3: Clear Cache

```bash
cd backend
php artisan config:clear
```

### Step 4: Restart Backend Server

Stop and restart your Laravel development server.

## Using Custom Domain (Advanced)

For production, you should use a custom domain instead of the default R2.dev domain:

### Step 1: Add Custom Domain in Cloudflare

1. In your R2 bucket settings, go to **Custom Domains**
2. Click **"Connect Domain"**
3. Enter your subdomain (e.g., `cdn.yourdomain.com`)
4. Follow the DNS setup instructions

### Step 2: Update Environment Variable

```env
CLOUDFLARE_R2_URL=https://cdn.yourdomain.com
```

## Current Configuration

Your current `.env` settings:

```env
CLOUDFLARE_R2_ACCESS_KEY_ID=7b4b630597cc516c833d65337ffa6e37
CLOUDFLARE_R2_SECRET_ACCESS_KEY=c3d6638ae8b2aee99c6419d9635eb331710708a3db79dc2839d161b84bde4d4a
CLOUDFLARE_R2_BUCKET=lawfirmlocate
CLOUDFLARE_R2_ENDPOINT=https://7c8aa0054834101276af1ca3a45f6a28.r2.cloudflarestorage.com
CLOUDFLARE_R2_URL=https://pub-2bd5d8c8a41e4bd48ee92e81ced58875.r2.dev
```

### Current Status
✅ **R2 uploads working** (via private endpoint)  
❌ **R2 public URL not accessible** (DNS error)  
✅ **Backend proxy serving files** (automatic fallback working)

## Testing

### Test Backend Proxy
Try accessing an image through the backend:
```
http://localhost:8000/api/storage/law-firms/1/gallery/697662f94def6.jpg
```

### Test R2 Public URL
Try accessing directly (this will fail until public access is enabled):
```
https://pub-2bd5d8c8a41e4bd48ee92e81ced58875.r2.dev/law-firms/1/gallery/697662f94def6.jpg
```

## Troubleshooting

### Images Still Not Loading

1. **Check backend is running**: The backend must be running for proxy to work
2. **Verify CORS settings**: Ensure frontend URL is allowed in `backend/config/cors.php`
3. **Check browser console**: Look for specific error messages
4. **Test API endpoint directly**: Try accessing `http://localhost:8000/api/storage/test.jpg` to see detailed errors

### Enable R2 Debug Mode

Temporarily enable debugging in `backend/config/filesystems.php`:

```php
'r2' => [
    'driver' => 's3',
    // ... other settings
    'throw' => true,  // Change to true
    'report' => true,  // Change to true
],
```

This will show detailed error messages if R2 operations fail.

## Performance Considerations

### Backend Proxy
- **Pros**: Works immediately, no R2 configuration needed, single source of truth
- **Cons**: Adds backend load, slower than direct CDN access
- **Best for**: Development, small-scale deployments

### R2 Public URL
- **Pros**: Fast CDN delivery, offloads backend, better for production
- **Cons**: Requires public access configuration, URLs exposed
- **Best for**: Production deployments with high traffic

### Custom Domain
- **Pros**: Professional, better caching, can use your own SSL cert
- **Cons**: Requires domain and DNS setup
- **Best for**: Production with custom branding

## Security Notes

1. **Never commit R2 credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable CORS** only for your frontend domain in production
4. **Consider signed URLs** for sensitive content (not implemented by default)
5. **Set appropriate cache headers** in production

## Next Steps

1. ✅ Images now working via backend proxy (completed)
2. ⏭️ Enable R2 public access (optional, for better performance)
3. ⏭️ Configure custom domain (recommended for production)
4. ⏭️ Update frontend URLs in production deployment
