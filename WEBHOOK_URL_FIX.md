# Fix 503 Webhook Errors – Wrong URL

## Run database migration first

Before deploying, run the new migration for the Order model:

```bash
cd wishlink-postback-app
npx prisma migrate deploy
```

(Use `prisma migrate dev` for local development.)

---

## Why 503?

If your **Partner Dashboard → Logs → Webhooks** shows `503` errors and the URI is:

```
https://shopify.dev/apps/default-app-home/webhooks/orders/create
```

then Shopify is sending webhooks to the wrong endpoint (Shopify’s default, not your app).

---

## Fix in Partner Dashboard

1. Go to **[partners.shopify.com](https://partners.shopify.com)** → **Apps** → **wishlink-postback-app**
2. Open **App setup** (or **Configuration**)
3. Set **App URL** to:
   ```
   https://wishlink-postback-app.vercel.app
   ```
4. Set **Allowed redirection URL(s)** to:
   ```
   https://wishlink-postback-app.vercel.app/api/auth
   ```
5. Save the changes

---

## Re-register webhooks

After updating the App URL, webhooks must be re-registered:

1. **Reinstall the app** on your store:  
   - Uninstall the app from the store  
   - Install it again from the Partner Dashboard  

   or

2. **Use Shopify CLI**:
   ```bash
   cd wishlink-postback-app
   shopify app deploy
   ```
   Then reinstall the app on the store if needed.

---

## Expected webhook URI

After the fix, the webhook URI should be:

```
https://wishlink-postback-app.vercel.app/webhooks/orders/create
```

Webhooks should return **200** instead of **503**.

---

## Verify

1. Place a test order in your store
2. In Partner Dashboard → Logs → Webhooks, confirm `orders/create` shows **200**
3. In your app, open the **Orders** dashboard and confirm the order appears
