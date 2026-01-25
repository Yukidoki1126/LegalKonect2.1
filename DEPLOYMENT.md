# LegalKonect Deployment Guide

## Prerequisites
- GitHub account with the repository pushed
- Vercel account (free tier works)
- Render account (free tier works)

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com) and sign up/login

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the repository and configure:
   - **Name**: `legalkonect-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
In the Render dashboard, add these environment variables:

```
APP_NAME=LegalKonect
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app-name.onrender.com
APP_KEY=base64:generate_a_new_key_here

LOG_CHANNEL=stderr
LOG_LEVEL=error

DB_CONNECTION=sqlite
DB_DATABASE=/var/data/database/database.sqlite

SESSION_DRIVER=cookie
SESSION_LIFETIME=120
CACHE_STORE=array
QUEUE_CONNECTION=sync

FRONTEND_URL=https://your-frontend.vercel.app

SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app,localhost:5173

# Add your Cloudflare R2 credentials for file storage
CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret
CLOUDFLARE_R2_BUCKET=your_bucket
CLOUDFLARE_R2_ENDPOINT=your_endpoint
CLOUDFLARE_R2_URL=your_public_url

# Add Resend for emails
MAIL_MAILER=resend
RESEND_API_KEY=your_resend_key
```

### Step 4: Add Persistent Disk
1. In the service settings, go to **"Disks"**
2. Add a disk:
   - **Name**: `legalkonect-data`
   - **Mount Path**: `/var/data`
   - **Size**: 1 GB

### Step 5: Generate APP_KEY
Run this locally and copy the output to Render's APP_KEY:
```bash
cd backend
php artisan key:generate --show
```

### Step 6: Deploy
Click **"Create Web Service"** - Render will build and deploy automatically.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up/login

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables
Add these in the Vercel project settings:

```
VITE_API_URL=https://your-backend-name.onrender.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Step 4: Deploy
Click **"Deploy"** - Vercel will build and deploy automatically.

---

## Part 3: Post-Deployment Configuration

### Update CORS and URLs
After both services are deployed, update:

1. **On Render** (Backend):
   - Set `FRONTEND_URL` to your Vercel URL (e.g., `https://legalkonect.vercel.app`)
   - Set `SANCTUM_STATEFUL_DOMAINS` to include your Vercel domain

2. **On Vercel** (Frontend):
   - Set `VITE_API_URL` to your Render URL (e.g., `https://legalkonect-api.onrender.com/api`)

### Run Migrations (First Time)
After the first deploy on Render, you may need to run migrations:
1. Go to your Render service
2. Click **"Shell"** tab
3. Run: `php artisan migrate --force`

### Seed Database (Optional)
If you want to seed the production database:
```bash
php artisan db:seed --class=ComprehensiveSeeder --force
```

---

## Local Development (Still Works!)

### Backend
```bash
cd backend
cp .env.example .env  # If not exists
php artisan serve
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local to use localhost:
# VITE_API_URL=http://localhost:8000/api
npm run dev
```

---

## Troubleshooting

### Backend Issues on Render
- Check logs in the Render dashboard
- Ensure APP_KEY is set correctly
- Verify disk is mounted at `/var/data`
- Check that all environment variables are set

### Frontend Issues on Vercel
- Verify `VITE_API_URL` points to correct Render URL
- Check browser console for CORS errors
- Ensure API URL includes `/api` at the end

### CORS Errors
- Make sure `FRONTEND_URL` on Render matches your Vercel URL exactly
- Check that `allowed_origins_patterns` in `cors.php` allows Vercel domains

### Database Issues
- SQLite database is stored on persistent disk at `/var/data/database/database.sqlite`
- Run migrations via Render Shell if tables are missing

---

## Free Tier Limitations

### Render Free Tier
- Service spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- 750 hours/month of free usage

### Vercel Free Tier
- Unlimited static deployments
- 100GB bandwidth/month
- Automatic HTTPS

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Go to Service Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed

Remember to update `FRONTEND_URL` and `VITE_API_URL` with your custom domains!
