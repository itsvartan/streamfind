# Deployment Guide for StreamFind 🚀

Follow these steps to deploy your StreamFind app to Vercel:

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name your repository: `streamfind`
3. Make it public or private (your choice)
4. Don't initialize with README (we already have one)
5. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/streamfind.git

# Push your code
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your `streamfind` repository
5. Configure your project:
   - Framework Preset: Vite (should auto-detect)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)

## Step 4: Add Environment Variables

In Vercel's project settings, add these environment variables:

1. Click on "Environment Variables"
2. Add:
   - Name: `VITE_WATCHMODE_API_KEY`
   - Value: Your Watchmode API key from [api.watchmode.com](https://api.watchmode.com)
   
3. (Optional) Add:
   - Name: `VITE_TMDB_API_KEY`
   - Value: Your TMDB API key from [themoviedb.org](https://www.themoviedb.org/settings/api)

## Step 5: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at: `https://streamfind-YOUR_USERNAME.vercel.app`

## Getting API Keys

### Watchmode API (Required)
1. Go to [api.watchmode.com](https://api.watchmode.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 1,000 requests/month

### TMDB API (Recommended)
1. Go to [themoviedb.org](https://www.themoviedb.org)
2. Create an account
3. Go to Settings → API
4. Request an API key (instant approval)
5. Use the "API Key" (not "API Read Access Token")

## Troubleshooting

### Build Fails
- Check the build logs in Vercel
- Make sure all dependencies are in package.json
- Verify environment variables are set correctly

### API Not Working
- Double-check API keys are correct
- Ensure you're not exceeding rate limits
- Check browser console for errors

### Performance Issues
- Enable Vercel Analytics to monitor performance
- Check if API requests are being cached properly
- Verify lazy loading is working

## Next Steps

After deployment:
1. Test the search functionality
2. Share your link!
3. Monitor usage in Vercel dashboard
4. Consider adding a custom domain

---

Need help? Check the build logs in Vercel or the browser console for errors.