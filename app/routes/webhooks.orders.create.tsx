import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { extractOrderData } from "../utils/order-extractor.server";
import { getEnv } from "../utils/env.server";
import { firePostback } from "../services/postback.server";
import {
  isPostbackAlreadySent,
  recordPostbackAttempt,
} from "../services/idempotency.server";
import { logger } from "../utils/logger.server";

/**
 * Webhook handler for orders/create
 * Receives order data from Shopify and triggers Wishlink postback
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

  // Only handle ORDERS_CREATE (Shopify uses SCREAMING_SNAKE_CASE for topics)
  if (topic !== "ORDERS_CREATE") {
    logger.debug("Ignoring non-orders webhook", { topic });
    return new Response();
  }

  logger.info("Received orders/create webhook", {
    shop,
    orderId: payload?.id,
  });

  // Log full payload for debugging (can be verbose in production)
  if (process.env.DEBUG) {
    logger.debug("Full webhook payload", { payload });
  }

  const order = payload as {
    id?: number;
    total_price?: string;
    currency?: string;
    transactions?: Array<{ id: number }>;
  };

  if (!order?.id) {
    logger.error("Invalid order payload: missing id", { payload });
    return new Response("Invalid payload", { status: 400 });
  }

  const orderId = String(order.id);

  // Idempotency check - avoid duplicate postbacks
  const alreadySent = await isPostbackAlreadySent(orderId, shop);
  if (alreadySent) {
    return new Response();
  }

  const env = getEnv();
  const postbackData = extractOrderData(order, {
    goalId: env.goalId,
    campaignId: env.campaignId,
    creativeId: env.creativeId,
  });

  logger.info("Constructed postback data", { postbackData });

  const result = await firePostback(postbackData);

  logger.info("Postback result", {
    success: result.success,
    statusCode: result.statusCode,
    url: result.url,
    error: result.error,
  });

  await recordPostbackAttempt(
    orderId,
    shop,
    result.url,
    result.success ? "success" : "failed",
    result.statusCode,
  );

  return new Response();
};
