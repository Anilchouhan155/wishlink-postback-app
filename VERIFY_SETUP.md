# Verify Wishlink Postback Setup

After placing an order, use this checklist to confirm everything works.

---

## 1. Check Vercel Logs (Recommended)

1. Go to [vercel.com](https://vercel.com) → your project **wishlink-postback-app**
2. Click **Logs** (or **Deployments** → latest → **View Function Logs**)
3. Filter or scroll for recent entries

**Success logs to look for:**
```
[INFO] [WishlinkPostback] Received orders/create webhook {"shop":"...","orderId":"..."}
[INFO] [WishlinkPostback] Constructed postback data {"order_id":"...","transaction_id":"...","amount":"...","currency":"..."}
[INFO] [WishlinkPostback] Firing postback {"url":"http://wishlink.com/postback?clickid=..."}
[INFO] [WishlinkPostback] Postback success {"statusCode":200,"attempt":1}
[INFO] [WishlinkPostback] Postback result {"success":true,"statusCode":200}
```

**If you see errors:**
- `Webhook authentication failed` → Check SHOPIFY_API_SECRET in Vercel
- `Postback request failed` → Wishlink URL may be unreachable; check network/timeout
- `Duplicate order detected` → Idempotency working (same order was already sent)

---

## 2. Check Shopify Webhook Delivery

1. Go to [Dev Dashboard](https://dev.shopify.com/dashboard) → **Apps** → **wishlink-postback-app**
2. Click **Monitoring** or **Logs**
3. Look for **Webhooks** / **Delivery logs** or similar
4. Find `orders/create` deliveries — status should be **200 OK**

---

## 3. Check Wishlink (If You Have Access)

If Wishlink provides a dashboard or reporting:

1. Log in and check for new conversions/transactions
2. Look for the order amount (₹3,869.22) or order ID
3. Verify `goal_id`, `campaign_id`, `creative_id` match your config

---

## 4. Optional: Query PostbackLog in Neon

Your app stores each postback attempt in the `PostbackLog` table.

1. Go to [Neon Console](https://console.neon.tech) → your project → **SQL Editor**
2. Run:

```sql
SELECT * FROM "PostbackLog" ORDER BY "createdAt" DESC LIMIT 10;
```

You should see rows with:
- `orderId` = your Shopify order ID
- `status` = `success` or `failed`
- `postbackUrl` = the full Wishlink URL that was called

---

## Summary Checklist

| Step | Status | Notes |
|------|--------|-------|
| Order placed | ✅ | Order #LJAIK05QZ |
| Webhook sent by Shopify | ⬜ | Check Dev Dashboard |
| Webhook received by Vercel | ⬜ | Check Vercel Logs |
| Postback fired to Wishlink | ⬜ | Check Vercel Logs |
| Wishlink received conversion | ⬜ | Check Wishlink dashboard |

---

## Postback URL Format (What Gets Sent)

```
http://wishlink.com/postback?clickid={order_id}&transaction_id={transaction_id}&payout={amount}&currency={currency}&goal_id={goal_id}&campaign_id={campaign_id}&creative_id={creative_id}
```

For your order, it would look like:
- `clickid` = Shopify order ID
- `transaction_id` = Same or from transactions
- `payout` = 3869.22 (or formatted amount)
- `currency` = INR
