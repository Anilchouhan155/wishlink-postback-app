/**
 * Extracts order data for Wishlink postback from Shopify order webhook payload
 */

export interface OrderPostbackData {
  order_id: string;
  transaction_id: string;
  amount: string;
  currency: string;
  goal_id: string;
  campaign_id: string;
  creative_id: string;
}

interface ShopifyOrder {
  id: number;
  total_price: string;
  currency: string;
  transactions?: Array<{ id: number }>;
}

interface EnvConfig {
  goalId: string;
  campaignId: string;
  creativeId: string;
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

  return {
    order_id: orderId,
    transaction_id: transactionId,
    amount: order.total_price ?? "0",
    currency: order.currency ?? "USD",
    goal_id: env.goalId,
    campaign_id: env.campaignId,
    creative_id: env.creativeId,
  };
}
