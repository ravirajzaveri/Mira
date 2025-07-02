# Quick Deployment Guide for Vercel

## Step-by-Step Deployment

### 1. Fork/Clone Repository
```bash
git clone <your-repo-url>
cd jewelry-erp-webapp
```

### 2. Set Up Neon Database
1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project: "jewelry-erp"
3. Copy the connection string (it will look like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/jewelry_erp?sslmode=require
   ```

### 3. Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. In project settings → Environment Variables, add:
   - `DATABASE_URL` = your Neon connection string
   - `DIRECT_URL` = same as DATABASE_URL
   - `JWT_SECRET` = any secure random string (e.g., `my-super-secret-jwt-key-2024`)
3. Deploy!

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy and add environment variables when prompted
vercel

# Or deploy directly to production
vercel --prod
```

### 4. Set Environment Variables (CLI Method)
```bash
# Add environment variables
vercel env add DATABASE_URL
# When prompted, paste: postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/jewelry_erp?sslmode=require

vercel env add DIRECT_URL
# When prompted, paste the same connection string

vercel env add JWT_SECRET
# When prompted, enter: my-super-secret-jwt-key-2024

# Redeploy with new environment variables
vercel --prod
```

### 5. Initialize Database
After successful deployment:

```bash
# Clone the repo locally (if not already)
git clone <your-repo-url>
cd jewelry-erp-webapp/backend

# Create local .env file
echo 'DATABASE_URL="your-neon-connection-string-here"' > .env
echo 'DIRECT_URL="your-neon-connection-string-here"' >> .env

# Install dependencies
pip install -r requirements.txt

# Generate Prisma client
prisma generate

# Push database schema
prisma db push

# Seed initial data
python seed.py
```

### 6. Test Your Deployment
Visit your Vercel URL and check:
- Frontend loads correctly
- API health check: `your-app.vercel.app/api/health`
- Database connection works

## Environment Variables Checklist

Make sure these are set in Vercel:

- [ ] `DATABASE_URL` - Your Neon PostgreSQL connection string
- [ ] `DIRECT_URL` - Same as DATABASE_URL (required for Prisma + Neon)
- [ ] `JWT_SECRET` - Any secure random string

## Common Issues & Solutions

### Issue: "Environment Variable DATABASE_URL references Secret database_url"
**Solution**: Don't reference secrets in vercel.json. Set environment variables directly in Vercel dashboard or CLI.

### Issue: Database connection fails
**Solution**: 
1. Ensure connection string includes `?sslmode=require`
2. Check that DATABASE_URL is set correctly in Vercel
3. Verify Neon database is active

### Issue: Prisma client not found
**Solution**: 
```bash
cd backend
prisma generate
prisma db push
```

### Issue: CORS errors
**Solution**: The app is configured for production domains. Update CORS_ORIGINS if needed.

## Production URLs

After deployment, your app will be available at:
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`
- **API Docs**: `https://your-app.vercel.app/api/docs`
- **Health Check**: `https://your-app.vercel.app/api/health`

## Need Help?

1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test API endpoints individually
4. Check Neon database status

---

**That's it!** Your jewelry ERP application should now be live on Vercel with Neon PostgreSQL. 🚀