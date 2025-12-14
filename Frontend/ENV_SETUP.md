# Environment Setup Guide

## Google OAuth Configuration (Optional)

The 403 error and "client ID not found" message occur when Google OAuth is not properly configured.

### Error Messages
```
Failed to load resource: the server responded with a status of 403 ()
[GSI_LOGGER]: The given client ID is not found.
```

### Solution

#### Step 1: Get Google Client ID
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs** → **Web Application**
5. Add authorized origins:
   - `http://localhost:5173` (development)
   - `http://localhost:3000` (if using different port)
   - Your production domain
6. Copy the **Client ID**

#### Step 2: Configure Environment Variables
Create a `.env.local` file in the `Frontend/` directory:

```env
# .env.local
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=your-stripe-key-here
```

#### Step 3: Restart Dev Server
```powershell
cd Frontend
npm run dev
```

## What These Variables Do

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Enables Google OAuth login | Optional (OAuth will be disabled if missing) |
| `VITE_API_BASE_URL` | Backend API endpoint | Required (defaults to `http://localhost:8000`) |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe payment integration | Optional |

## Testing Without Google OAuth

If you don't have a Google Client ID yet, the app will still work:
- ✅ Regular username/password login works
- ✅ All features except Google OAuth work
- ❌ Google OAuth button will be disabled

## Common Issues

### Issue: Still getting 403 error after setup
- **Solution:** Clear browser cache and restart dev server
  ```powershell
  npm run dev
  ```

### Issue: "localhost refused to connect"
- **Solution:** Ensure backend is running on `http://localhost:8000`
  - Update `VITE_API_BASE_URL` if backend is on different port

### Issue: `.env.local` not being read
- **Solution:** File must be in `Frontend/` directory (not `Frontend/src/`)
  - Restart dev server after creating `.env.local`
  - Use `VITE_` prefix for variables (Vite only exposes these)

## Production Deployment

For production, set environment variables in your hosting platform:
- **Vercel:** Settings → Environment Variables
- **Netlify:** Site settings → Build & deploy → Environment
- **Docker:** Use `--env` or `.env` file
- **Traditional servers:** Set in `.env` or system environment

Example for production:
```env
VITE_GOOGLE_CLIENT_ID=your-prod-client-id
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLIC_KEY=your-prod-stripe-key
```
