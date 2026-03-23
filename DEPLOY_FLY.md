# Deploy to Fly.io

## Prerequisites

- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Fly.io account (sign up at [fly.io](https://fly.io))

## Step 0: Git + GitHub (for connecting repo to Fly)

```bash
cd wishlink-postback-app
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/wishlink-postback-app.git
git branch -M main
git push -u origin main
```

## Step 1: Login to Fly

```bash
fly auth login
```

## Step 2: Launch App (creates Fly app)

```bash
cd wishlink-postback-app
fly launch --no-deploy
```

When prompted:
- **App name:** `wishlink-postback-app` (or choose another)
- **Region:** Pick one close to you (e.g. `ord` for Chicago)
- **Postgres:** No
- **Redis:** No

## Step 3: Create Volume (for SQLite persistence)

```bash
fly volumes create wishlink_data --region ord --size 1
```

Use the same region you picked in Step 2. Run `fly platform regions` to list regions.

## Step 4: Set Secrets (env vars) (Environment Variables)

Set your secrets from `.env`:

```bash
fly secrets set \
  SHOPIFY_API_KEY="<from .env>" \
  SHOPIFY_API_SECRET="<from .env>" \
  SHOPIFY_APP_URL="https://YOUR-APP-NAME.fly.dev" \
  SCOPES="read_orders" \
  DATABASE_URL="file:/data/dev.sqlite" \
  WISHLINK_POSTBACK_BASE_URL="http://wishlink.com" \
  WISHLINK_GOAL_ID="default_goal" \
  WISHLINK_CAMPAIGN_ID="default_campaign" \
  WISHLINK_CREATIVE_ID="default_creative"
```

Copy values from your `.env`. Set `SHOPIFY_APP_URL` to your Fly app URL (e.g. `https://wishlink-postback-app.fly.dev`).

## Step 5: Deploy

```bash
fly deploy
```

## Step 6: Update Shopify

1. Go to [Partner Dashboard](https://partners.shopify.com) → your app → **App setup** → **URLs**
2. Set **App URL** to `https://wishlink-postback-app.fly.dev` (or your Fly URL)
3. Run `shopify app deploy` to push the updated config

## Step 7: Install & Test

1. Install the app on your dev store
2. Create a test order
3. Check logs: `fly logs`

---

## Connect GitHub (Optional - for auto-deploy)

1. Push your code to GitHub
2. Go to [Fly Dashboard](https://fly.io/dashboard) → your app → **Settings** → **Source**
3. Connect your GitHub repo and enable auto-deploy on push

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `fly status` | App status |
| `fly logs` | View logs |
| `fly ssh console` | SSH into the VM |
| `fly secrets list` | List secrets |
