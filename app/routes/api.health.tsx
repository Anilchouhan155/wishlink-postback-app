import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

/**
 * Health check - verifies database connection.
 * GET /api/health
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const sessionCount = await prisma.session.count();
    return new Response(
      JSON.stringify({
        status: "ok",
        database: "connected",
        sessionTableExists: true,
        sessionCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        status: "error",
        database: "disconnected",
        error: message,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
