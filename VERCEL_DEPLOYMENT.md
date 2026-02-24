# Deploying to Vercel

This guide walks you through deploying the SaaS Recovery Management app to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database (or other MongoDB provider)
- Git repository (recommended for easy deployments)

## Step 1: Prepare Your Database

1. Create a MongoDB database (MongoDB Atlas offers a free tier).
2. Get your connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname`).
3. Ensure your IP is whitelisted in MongoDB Atlas (or use `0.0.0.0/0` for Vercel's dynamic IPs).

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket.

2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.

3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (project root)
   - **Build Command**: `cd backend && npm run prisma:generate && cd ../frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm run install:all`

4. Add Environment Variables (Settings → Environment Variables):

   | Variable        | Value                           | Required |
   |----------------|----------------------------------|----------|
   | `DATABASE_URL` | Your MongoDB connection string   | Yes      |
   | `JWT_SECRET`   | Secret for signing JWT tokens    | Yes      |
   | `CRON_SECRET`  | Random secret for cron endpoint  | Yes*     |

   \* Generate a random string for `CRON_SECRET` (e.g. `openssl rand -hex 32`). Vercel automatically sends this when triggering cron jobs.

5. Click **Deploy**.

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (run from project root)
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add CRON_SECRET
```

## Step 3: Verify Deployment

After deployment:

1. **Frontend**: Visit your Vercel URL (e.g. `https://your-app.vercel.app`).
2. **API Health**: Check `https://your-app.vercel.app/api/health` — should return `{"success":true,"message":"Server is running"}`.
3. **Cron Job**: Runs daily at midnight UTC. You can manually trigger it via the Vercel dashboard (Deployments → your project → Cron Jobs).

## Environment Variables Reference

| Variable       | Description                                      |
|----------------|--------------------------------------------------|
| `DATABASE_URL` | MongoDB connection string                        |
| `JWT_SECRET`   | Secret for JWT authentication tokens             |
| `CRON_SECRET`  | Protects the cron endpoint from unauthorized access |

## Troubleshooting

### Build fails with Prisma errors
- Ensure `DATABASE_URL` is set (Prisma needs it at build time for `prisma generate`).
- Check that your MongoDB connection string is valid.

### API returns 404
- Verify the deployment completed successfully.
- Check that the `api/` folder and `api/[[...path]].js` exist in your project.

### Cron job not running
- Vercel Cron requires a paid (Pro) plan for production cron jobs.
- On Hobby plan, crons run only on the latest deployment.
- Ensure `CRON_SECRET` is set — Vercel sends it in the `Authorization: Bearer <CRON_SECRET>` header.

### CORS or API connection issues
- The frontend uses relative URLs (`/api`), so same-origin requests should work.
- If you deploy frontend and backend separately, set `VITE_API_URL` and update the frontend API config.
