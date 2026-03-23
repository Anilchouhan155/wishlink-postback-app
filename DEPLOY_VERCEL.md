# Deploy to Vercel

## Prerequisites

- [Vercel account](https://vercel.com/signup) (free)
- [Neon account](https://neon.tech) (free PostgreSQL)
- Code pushed to GitHub

---

## Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Create a new project (e.g. "wishlink-postback")
3. Copy both connection strings from the dashboard:
   - **Pooled connection** → use for `DATABASE_URL`
   - **Direct connection** → use for `DIRECT_URL` (or use pooled for both)

---

## Step 2: Push to GitHub

```bash
cd wishlink-postback-app
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/wishlink-postback-app.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your `wishlink-postback-app` repo (or the parent repo and set root to `wishlink-postback-app`)
3. If the app is inside another repo, set **Root Directory** to `wishlink-postback-app`
4. Add **Environment Variables** (before deploying):

| Name | Value |
|------|-------|
| `DATABASE_URL` | **Required** – Neon pooled connection string. Add `?connection_limit=1` for serverless |
| `DIRECT_URL` | **Required** – Neon direct connection string |
| `SHOPIFY_API_KEY` | From your `.env` |
| `SHOPIFY_API_SECRET` | From your `.env` |
| `SHOPIFY_APP_URL` | `https://YOUR-PROJECT.vercel.app` (update after first deploy) |
| `SCOPES` | `read_orders` |
| `WISHLINK_POSTBACK_BASE_URL` | `http://wishlink.com` |
| `WISHLINK_GOAL_ID` | `default_goal` |
| `WISHLINK_CAMPAIGN_ID` | `default_campaign` |
| `WISHLINK_CREATIVE_ID` | `default_creative` |

5. Click **Deploy**

---

## Step 4: Update SHOPIFY_APP_URL

After the first deploy, Vercel gives you a URL (e.g. `https://wishlink-postback-app-xxx.vercel.app`).

1. Go to Vercel → your project → **Settings** → **Environment Variables**
2. Edit `SHOPIFY_APP_URL` and set it to your Vercel URL
3. Redeploy (Deployments → ⋮ → Redeploy)

---

## Step 5: Update Shopify (Dev Dashboard)

1. Go to [Dev Dashboard](https://dev.shopify.com/dashboard) → **Apps** → your app
2. Open **Configuration** or **App setup** → **URLs**
3. Set **App URL** to `https://wishlink-postback-app.vercel.app`
4. Run locally: `shopify app deploy`

---

## Step 6: Install & Test

1. Install the app on your dev store
2. Place a test order
3. Check Vercel logs: Project → **Logs** or **Functions**

---

## Local Development

You need a Neon database for local dev too (free):

1. Create a Neon project if you haven't
2. Add `DATABASE_URL` and `DIRECT_URL` to `.env` (from Neon dashboard)
3. Add the rest from `.env.example` (Shopify keys, Wishlink config)
4. Run `npm run dev`

---

## Troubleshooting

- **Build fails:** Ensure `DATABASE_URL` and `DIRECT_URL` are set in Vercel
- **Migrations fail:** Run `npx prisma migrate deploy` locally with your Neon URL to apply migrations first
- **Webhooks not firing:** Confirm `SHOPIFY_APP_URL` in Vercel matches the URL in Partner Dashboard
