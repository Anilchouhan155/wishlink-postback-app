# Test Results - Wishlink Postback

## Test 1: Webhook Trigger ✅

**Command run:**
```bash
shopify app webhook trigger --topic orders/create \
  --delivery-method http \
  --address "https://wishlink-postback-app.vercel.app/webhooks/orders/create" \
  --api-version 2026-01 \
  --client-id "YOUR_CLIENT_ID" \
  --client-secret "YOUR_CLIENT_SECRET"
```

**Result:** ✅ Success! Webhook has been enqueued for delivery.

---

## Test 2: Database Check

**PostbackLog entries after 8 seconds:** Empty `[]`

**Interpretation:** No new rows = either:
- Webhook returned 401 (auth failed) before reaching PostbackLog write
- OR credentials mismatch between trigger and Vercel

---

## Test 3: Endpoint Response

**Request:** `POST /webhooks/orders/create` (without valid HMAC)  
**Result:** `401 Unauthorized` (expected for invalid requests)

---

## Action Required: Verify Vercel Credentials

**Possible mismatch:** Your `shopify.app.toml` client_id may differ from `.env` SHOPIFY_API_KEY — these must match the same app.

**Fix:** Ensure Vercel env vars match the app that receives webhooks:
- Go to Dev Dashboard → wishlink-postback-app → Settings → Credentials
- Copy **Client ID** and **Client Secret**
- Set in Vercel: `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` (exact match)
- Redeploy Vercel
