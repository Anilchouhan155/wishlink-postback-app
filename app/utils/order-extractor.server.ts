/**
 * Extracts order data for Wishlink postback from Shopify order webhook payload
 * Supports Wishlink's atgSessionId + utm_campaign (from wishlink.com/share links)
 */

export interface OrderPostbackData {
  order_id: string;
  transaction_id: string;
  amount: string;
  currency: string;
  goal_id: string;
  campaign_id: string;
  creative_id: string;
  click_id: string;
}

interface ShopifyOrder {
  id: number;
  total_price: string;
  currency: string;
  transactions?: Array<{ id: number }>;
  note_attributes?: Array<{ name: string; value: string }>;
}

interface EnvConfig {
  goalId: string;
  campaignId: string;
  creativeId: string;
}

function getNoteAttribute(
  order: ShopifyOrder,
  key: string,
): string | null {
  const attrs = order?.note_attributes;
  if (!Array.isArray(attrs)) return null;
  const item = attrs.find((a) => a && a.name === key);
  return item && typeof item.value === "string" ? item.value : null;
}

export function extractClickId(order: ShopifyOrder): string | null {
  return (
    getNoteAttribute(order, "atgSessionId") ||
    getNoteAttribute(order, "utm_campaign") ||
    getNoteAttribute(order, "clickid") ||
    null
  );
}

/** True if order has Wishlink tracking params (should fire postback) */
export function hasWishlinkTracking(order: ShopifyOrder): boolean {
  return extractClickId(order) != null;
}

export function extractOrderData(
  order: ShopifyOrder,
  env: EnvConfig,
): OrderPostbackData {
  const orderId = String(order.id);
  const transactionId =
    order.transactions?.[0]?.id != null
      ? String(order.transactions[0].id)
      : orderId;

  const clickId = extractClickId(order) ?? orderId;

  return {
    order_id: orderId,
    transaction_id: transactionId,
    amount: order.total_price ?? "0",
    currency: order.currency ?? "USD",
    goal_id: env.goalId,
    campaign_id: env.campaignId,
    creative_id: env.creativeId,
    click_id: clickId,
  };
}
