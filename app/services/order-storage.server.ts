import type { Prisma } from "@prisma/client";
import prisma from "../db.server";
import { logger } from "../utils/logger.server";

interface OrderPayload {
  id?: number;
  name?: string;
  total_price?: string;
  currency?: string;
  email?: string;
  note_attributes?: Array<{ name: string; value: string }>;
}

/**
 * Builds attribution object from order note_attributes (user journey / affiliate tracking)
 */
function buildAttributionData(
  noteAttributes: Array<{ name: string; value: string }> | undefined,
): Prisma.JsonObject | null {
  if (!Array.isArray(noteAttributes) || noteAttributes.length === 0) return null;
  const obj: Record<string, string> = {};
  for (const a of noteAttributes) {
    if (a && a.name && typeof a.value === "string") {
      obj[a.name] = a.value;
    }
  }
  return Object.keys(obj).length > 0 ? obj : null;
}

/**
 * Saves or updates order in app database (App Dashboard channel)
 * Stores full attribution data (URL params, referrer, session) for creator/affiliate marketing
 */
export async function saveOrderForDashboard(
  orderId: string,
  shop: string,
  payload: OrderPayload,
  wishlinkSent: boolean = false,
): Promise<void> {
  const attributionData = buildAttributionData(payload.note_attributes);
  try {
    await prisma.order.upsert({
      where: { orderId },
      create: {
        orderId,
        shop,
        orderName: payload.name ?? null,
        totalPrice: payload.total_price ?? "0",
        currency: payload.currency ?? "USD",
        customerEmail: payload.email ?? null,
        wishlinkSent,
        attributionData: attributionData as Prisma.JsonObject | undefined,
      },
      update: {
        orderName: payload.name ?? undefined,
        totalPrice: payload.total_price ?? "0",
        currency: payload.currency ?? "USD",
        customerEmail: payload.email ?? undefined,
        wishlinkSent,
        attributionData: attributionData as Prisma.JsonObject | undefined,
      },
    });
    logger.info("Order saved for app dashboard", {
      orderId,
      shop,
      hasAttribution: !!attributionData,
    });
  } catch (err) {
    logger.error("Failed to save order for dashboard", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
