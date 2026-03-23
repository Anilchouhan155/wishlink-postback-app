import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { logger } from "../utils/logger.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session } = await authenticate.webhook(request);

  if (topic !== "APP_UNINSTALLED") {
    return new Response();
  }

  if (session) {
    try {
      await prisma.session.deleteMany({ where: { shop } });
      logger.info("App uninstalled, sessions cleaned", { shop });
    } catch (err) {
      logger.error("Failed to delete sessions on uninstall", {
        shop,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return new Response();
};
