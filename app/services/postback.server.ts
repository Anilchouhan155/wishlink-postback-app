import axios, { AxiosError } from "axios";
import type { OrderPostbackData } from "../utils/order-extractor.server";
import { getEnv } from "../utils/env.server";
import { logger } from "../utils/logger.server";

export interface PostbackResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  url: string;
}

/**
 * Constructs the Wishlink postback URL with proper encoding
 */
export function buildPostbackUrl(data: OrderPostbackData): string {
  const env = getEnv();
  const baseUrl = env.wishlinkBaseUrl;
  const path = "/postback";

  const params = new URLSearchParams();
  params.set("clickid", data.click_id);
  params.set("transaction_id", data.transaction_id);
  params.set("payout", data.amount);
  params.set("currency", data.currency);
  params.set("goal_id", data.goal_id);
  params.set("campaign_id", data.campaign_id);
  params.set("creative_id", data.creative_id);

  const queryString = params.toString();
  const url = `${baseUrl}${path}?${queryString}`;

  return url;
}

/**
 * Fires GET request to Wishlink postback URL with retry logic
 */
export async function firePostback(
  data: OrderPostbackData,
): Promise<PostbackResult> {
  const url = buildPostbackUrl(data);
  const env = getEnv();
  const { postbackTimeout, postbackMaxRetries } = env;

  logger.info("Firing postback", { url, data });

  let lastError: Error | null = null;
  let lastStatusCode: number | undefined;

  for (let attempt = 1; attempt <= postbackMaxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: postbackTimeout,
        validateStatus: () => true, // Accept any status to capture it
        maxRedirects: 3,
      });

      lastStatusCode = response.status;

      if (response.status >= 200 && response.status < 400) {
        logger.info("Postback success", {
          url,
          statusCode: response.status,
          attempt,
        });
        return {
          success: true,
          statusCode: response.status,
          url,
        };
      }

      logger.warn("Postback returned non-success status", {
        url,
        statusCode: response.status,
        attempt,
      });

      if (attempt < postbackMaxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logger.info("Retrying postback", { attempt, delayMs: delay });
        await sleep(delay);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const axiosError = err as AxiosError;
      lastStatusCode = axiosError.response?.status;

      logger.error("Postback request failed", {
        url,
        error: lastError.message,
        attempt,
        statusCode: lastStatusCode,
      });

      if (attempt < postbackMaxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logger.info("Retrying postback after error", { attempt, delayMs: delay });
        await sleep(delay);
      }
    }
  }

  const errorMessage = lastError?.message ?? "Unknown error";
  logger.error("Postback failed after all retries", {
    url,
    error: errorMessage,
    attempts: postbackMaxRetries,
  });

  return {
    success: false,
    statusCode: lastStatusCode,
    error: errorMessage,
    url,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
