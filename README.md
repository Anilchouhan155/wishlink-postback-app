# Wishlink Postback - Shopify App

Automatically sends order data to Wishlink whenever a new order is created in your Shopify store. Uses Shopify webhooks for reliable, backend-driven postback delivery.

## Features

- **Webhook-driven**: Subscribes to `orders/create` via Shopify API
- **Postback URL**: GET request to `http://wishlink.com/postback` with order data
- **Idempotency**: Prevents duplicate postbacks for the same order
- **Retry logic**: Configurable retries with exponential backoff
- **Logging**: Full webhook payload, constructed URL, and response logging
- **Configurable**: Environment variables for goal_id, campaign_id, creative_id

## Postback URL Format

```
http://wishlink.com/postback?clickid={order_id}&transaction_id={transaction_id}&payout={amount}&currency={currency}&goal_id={goal_id}&campaign_id={campaign_id}&creative_id={creative_id}
```

## Prerequisites

- Node.js 20.19+ or 22.12+
- Shopify Partner account
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) installed

## Setup

### 1. Install dependencies

```bash
cd wishlink-postback-app
npm install
```

### 2. Link to your Shopify app

```bash
shopify app config link
```

This links the project to your Shopify Partner app (or creates a new one). Follow the prompts to select or create an app.

### 3. Configure environment

Copy `.env.example` to `.env` (Shopify CLI auto-generates `.env` when you run `shopify app dev`):

```bash
cp .env.example .env
```

Edit `.env` and set Wishlink-specific values:

```env
WISHLINK_POSTBACK_BASE_URL=http://wishlink.com
WISHLINK_GOAL_ID=your_goal_id
WISHLINK_CAMPAIGN_ID=your_campaign_id
WISHLINK_CREATIVE_ID=your_creative_id
```

### 4. Run database migrations

```bash
npm run setup
```

### 5. Start development server

```bash
npm run dev
```

This starts the app with Shopify CLI, opens a tunnel, and registers webhooks. Install the app on your dev store when prompted.

## Testing

### Trigger a test order webhook

```bash
shopify app webhook trigger --topic orders/create --address http://localhost:3000/webhooks/orders/create
```

Or place a real order in your dev store. The webhook fires automatically.

### Sample success logs

```
[2025-03-23T12:00:00.000Z] [INFO] [WishlinkPostback] Received orders/create webhook {"shop":"your-store.myshopify.com","orderId":"5678901234"}
[2025-03-23T12:00:00.001Z] [INFO] [WishlinkPostback] Constructed postback data {"order_id":"5678901234","transaction_id":"5678901234","amount":"99.99","currency":"USD","goal_id":"default_goal","campaign_id":"default_campaign","creative_id":"default_creative"}
[2025-03-23T12:00:00.002Z] [INFO] [WishlinkPostback] Firing postback {"url":"http://wishlink.com/postback?clickid=5678901234&transaction_id=5678901234&payout=99.99&currency=USD&goal_id=default_goal&campaign_id=default_campaign&creative_id=default_creative","data":{...}}
[2025-03-23T12:00:00.500Z] [INFO] [WishlinkPostback] Postback success {"url":"...","statusCode":200,"attempt":1}
[2025-03-23T12:00:00.501Z] [INFO] [WishlinkPostback] Postback result {"success":true,"statusCode":200,"url":"..."}
```

### Sample failure logs

```
[2025-03-23T12:00:00.000Z] [ERROR] [WishlinkPostback] Postback request failed {"url":"...","error":"timeout of 10000ms exceeded","attempt":1}
[2025-03-23T12:00:05.000Z] [INFO] [WishlinkPostback] Retrying postback {"attempt":2,"delayMs":1000}
[2025-03-23T12:00:10.000Z] [ERROR] [WishlinkPostback] Postback failed after all retries {"url":"...","error":"timeout of 10000ms exceeded","attempts":3}
```

### Enable debug logging

Set `DEBUG=1` in `.env` to log full webhook payloads.

## Deploy

### Deploy to Vercel (recommended)

See **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** for step-by-step instructions. Uses Vercel + Neon (free tier).

### Deploy Shopify config

After your app is live:

```bash
shopify app deploy
```

### Production environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WISHLINK_POSTBACK_BASE_URL` | Wishlink base URL | `http://wishlink.com` |
| `WISHLINK_GOAL_ID` | Static goal ID | `default_goal` |
| `WISHLINK_CAMPAIGN_ID` | Static campaign ID | `default_campaign` |
| `WISHLINK_CREATIVE_ID` | Static creative ID | `default_creative` |
| `POSTBACK_TIMEOUT_MS` | Request timeout (ms) | `10000` |
| `POSTBACK_MAX_RETRIES` | Max retry attempts | `3` |
| `DEBUG` | Verbose logging | (unset) |

## Code structure

```
wishlink-postback-app/
├── app/
│   ├── routes/
│   │   ├── webhooks.orders.create.tsx   # orders/create webhook handler
│   │   ├── webhooks.app.uninstalled.tsx
│   │   └── webhooks.app.scopes_update.tsx
│   ├── services/
│   │   ├── postback.server.ts           # Postback URL builder & HTTP client
│   │   └── idempotency.server.ts        # Duplicate prevention
│   ├── utils/
│   │   ├── order-extractor.server.ts    # Extract order fields
│   │   ├── env.server.ts                # Env config
│   │   └── logger.server.ts             # Logging
│   ├── shopify.server.ts
│   └── db.server.ts
├── prisma/
│   └── schema.prisma                    # Session + PostbackLog models
├── shopify.app.toml                     # Webhook subscriptions
└── package.json
```

## License

MIT
