import prisma from "../db.server";
import { logger } from "../utils/logger.server";

/**
 * Checks if a postback has already been sent for this order (idempotency)
 */
export async function isPostbackAlreadySent(
  orderId: string,
  shop: string,
): Promise<boolean> {
  const existing = await prisma.postbackLog.findUnique({
    where: { orderId },
  });

  if (existing && existing.shop === shop) {
    logger.info("Duplicate order detected, skipping postback", {
      orderId,
      shop,
    });
    return true;
  }

  return false;
}

/**
 * Records that a postback was sent (or attempted) for idempotency
 */
export async function recordPostbackAttempt(
  orderId: string,
  shop: string,
  postbackUrl: string,
  status: "success" | "failed",
  responseStatus?: number,
): Promise<void> {
  try {
    await prisma.postbackLog.upsert({
      where: { orderId },
      create: {
        orderId,
        shop,
        postbackUrl,
        status,
        responseStatus: responseStatus ?? null,
      },
      update: {
        status,
        responseStatus: responseStatus ?? null,
      },
    });
  } catch (err) {
    logger.error("Failed to record postback log", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
