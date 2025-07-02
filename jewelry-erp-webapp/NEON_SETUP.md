# Neon Database Setup Guide

This guide will help you set up Neon PostgreSQL database for the Jewelry ERP application.

## Step 1: Create Neon Database

1. **Sign up for Neon**: Go to [https://neon.tech](https://neon.tech) and create an account
2. **Create a new project**: Click "Create Project" and choose a name like "jewelry-erp"
3. **Get connection string**: Copy the connection string from the dashboard

Your connection string will look like:
```
postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/jewelry_erp?sslmode=require
```

## Step 2: Environment Configuration

### Local Development

1. **Backend Environment** - Create `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/jewelry_erp?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/jewelry_erp?sslmode=require"
ENVIRONMENT="development"
DEBUG=True
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

2. **Frontend Environment** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Vercel Production

**Method 1: Vercel Dashboard** (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**, **Preview**, and **Development**:
   - `DATABASE_URL`: Your Neon connection string
   - `DIRECT_URL`: Same as DATABASE_URL for Neon
   - `JWT_SECRET`: Secure random string

**Method 2: Vercel CLI**
```bash
# Add environment variables for all environments
vercel env add DATABASE_URL production
# Paste your Neon connection string when prompted

vercel env add DIRECT_URL production
# Paste the same Neon connection string

vercel env add JWT_SECRET production
# Enter a secure random string

# Repeat for preview and development environments
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
# ... etc for DIRECT_URL and JWT_SECRET
```

**Method 3: Using .env files with Vercel**
```bash
# Pull environment variables to local .env files
vercel env pull .env

# This creates .env.local with your Vercel environment variables
```

## Step 3: Database Setup

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Generate Prisma Client

```bash
prisma generate
```

### Run Database Migrations

```bash
prisma db push
```

### Seed Initial Data

```bash
python seed.py
```

## Step 4: Verify Connection

### Test Database Connection

```bash
cd backend
python -c "
import asyncio
from database import connect_db, check_db_connection

async def test():
    await connect_db()
    healthy = await check_db_connection()
    print(f'Database healthy: {healthy}')

asyncio.run(test())
"
```

### Start Backend Server

```bash
uvicorn main:app --reload
```

Visit `http://localhost:8000/health` to check the health endpoint.

## Step 5: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Neon-Specific Features

### Connection Pooling
Neon automatically handles connection pooling, so no additional configuration is needed.

### Branching (Optional)
Neon supports database branching for development:

```bash
# Create a development branch
neon branches create dev-branch

# Get the connection string for the branch
neon connection-string dev-branch
```

### Monitoring
- Monitor database usage in the Neon dashboard
- Set up alerts for connection limits
- Track query performance

## Troubleshooting

### Common Issues

1. **SSL Connection Error**:
   - Ensure `?sslmode=require` is in your connection string
   - Neon requires SSL connections

2. **Connection Timeout**:
   - Check if your IP is allowlisted (Neon allows all by default)
   - Verify the connection string is correct

3. **Database Not Found**:
   - Ensure the database name in the connection string matches your Neon database

4. **Migration Errors**:
   ```bash
   # Reset and re-apply schema
   prisma db push --force-reset
   python seed.py
   ```

### Connection String Format
```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
```

Example:
```
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Production Deployment

### Vercel Deployment

```bash
# Deploy to Vercel
vercel --prod

# Run migrations on production
vercel env pull
prisma db push
```

### Environment Variables Checklist

- [ ] `DATABASE_URL` set in Vercel
- [ ] `DIRECT_URL` set in Vercel  
- [ ] `JWT_SECRET` set in Vercel
- [ ] Frontend `NEXT_PUBLIC_API_URL` configured
- [ ] CORS origins updated for production domain

## Security Best Practices

1. **Rotate Passwords**: Regularly rotate database passwords in Neon dashboard
2. **Environment Variables**: Never commit `.env` files to git
3. **Connection Limits**: Monitor connection usage in Neon dashboard
4. **SSL Only**: Always use SSL connections in production

## Performance Tips

1. **Connection Pooling**: Neon handles this automatically
2. **Query Optimization**: Use Prisma's query optimization features
3. **Indexing**: Add database indexes for frequently queried fields
4. **Monitoring**: Use Neon's built-in monitoring tools

---

**Need Help?**
- Neon Documentation: [https://neon.tech/docs](https://neon.tech/docs)
- Prisma Documentation: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- FastAPI Documentation: [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com)