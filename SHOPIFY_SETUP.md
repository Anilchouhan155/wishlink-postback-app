# Shopify App Setup (Dev Dashboard)

Shopify has moved app configuration to the **Dev Dashboard** (dev.shopify.com). Use these steps to get your app listed and configured.

---

## Step 1: Link Your Project & Create the App

From your terminal, run:

```bash
cd wishlink-postback-app
shopify app config link
```

When prompted:

1. **"Create this project as a new app on Shopify?"** → Choose **Yes** to create a new app
2. Or **"Connect to an existing app?"** → Choose **No** first time to create new, then name it `wishlink-postback-app`

This creates the app in your Dev Dashboard. After it finishes, the app should appear at [dev.shopify.com/dashboard](https://dev.shopify.com/dashboard) → **Apps**.

---

## Step 2: Find Your App in the Dev Dashboard

1. Go to [dev.shopify.com/dashboard](https://dev.shopify.com/dashboard)
2. Click **Apps** in the sidebar
3. You should now see **wishlink-postback-app** in the list

---

## Step 3: Update URLs in the App Configuration

1. Click on **wishlink-postback-app**
2. Go to **Configuration** or **App setup** (or **URLs** if visible)
3. Set these values:

| Field | Value |
|-------|-------|
| **App URL** | `https://wishlink-postback-app.vercel.app` |
| **Allowed redirection URL(s)** | `https://wishlink-postback-app.vercel.app/api/auth` |

4. Save

---

## Step 4: Deploy the Config (Optional)

From your project folder:

```bash
shopify app deploy
```

This pushes your `shopify.app.toml` (webhooks, scopes) to Shopify.

---

## Step 5: Install on a Dev Store

1. In the Dev Dashboard, go to **Dev stores**
2. Create or select a dev store
3. Go back to **Apps** → click your app
4. Use **Test your app** or **Install** to add it to your dev store

---

## If the App Still Doesn't Appear

- Ensure you're logged into the same Shopify account you used when running `shopify app config link`
- Try `shopify app config link --reset` to re-link and create a fresh app
- Check that your Shopify CLI is logged in: `shopify auth logout` then `shopify auth login`
