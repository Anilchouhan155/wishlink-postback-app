import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  extractOrderData,
  hasWishlinkTracking,
} from "../utils/order-extractor.server";
import { getEnv } from "../utils/env.server";
import { firePostback } from "../services/postback.server";
import {
  isPostbackAlreadySent,
  recordPostbackAttempt,
} from "../services/idempotency.server";
import { saveOrderForDashboard } from "../services/order-storage.server";
import { logger } from "../utils/logger.server";

/**
 * Webhook handler for orders/create
 * CHANNEL 1 (App Dashboard): Always save order for display in app
 * CHANNEL 2 (Wishlink): Fire postback only when order has Wishlink tracking (atgSessionId, utm_campaign, clickid)
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let topic: string;
  let shop: string;
  let payload: Record<string, unknown>;

  try {
    const webhookContext = await authenticate.webhook(request);
    topic = webhookContext.topic;
    shop = webhookContext.shop;
    payload = webhookContext.payload as Record<string, unknown>;
  } catch (err) {
    logger.error("Webhook authentication failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return new Response("Unauthorized", { status: 401 });
  }

  if (topic !== "ORDERS_CREATE") {
    logger.debug("Ignoring non-orders webhook", { topic });
    return new Response();
  }

  logger.info("Received orders/create webhook", {
    shop,
    orderId: payload?.id,
  });

  const order = payload as {
    id?: number;
    name?: string;
    total_price?: string;
    currency?: string;
    email?: string;
    transactions?: Array<{ id: number }>;
    note_attributes?: Array<{ name: string; value: string }>;
  };

  if (!order?.id) {
    logger.error("Invalid order payload: missing id", { payload });
    return new Response("Invalid payload", { status: 400 });
  }

  const orderId = String(order.id);

  // CHANNEL 1: Always save order for app dashboard
  let wishlinkSent = false;

  // CHANNEL 2: Wishlink postback only when order has tracking params
  if (hasWishlinkTracking(order)) {
    const alreadySent = await isPostbackAlreadySent(orderId, shop);
    if (!alreadySent) {
      const env = getEnv();
      const postbackData = extractOrderData(order, {
        goalId: env.goalId,
        campaignId: env.campaignId,
        creativeId: env.creativeId,
      });

      logger.info("Firing Wishlink postback", { postbackData });
      const result = await firePostback(postbackData);
      wishlinkSent = result.success;

      await recordPostbackAttempt(
        orderId,
        shop,
        result.url,
        result.success ? "success" : "failed",
        result.statusCode,
      );
    } else {
      wishlinkSent = true; // Already sent in a previous attempt
    }
  } else {
    logger.debug("Order has no Wishlink tracking, skipping postback", {
      orderId,
    });
  }

  await saveOrderForDashboard(orderId, shop, order, wishlinkSent);

  return new Response();
};
