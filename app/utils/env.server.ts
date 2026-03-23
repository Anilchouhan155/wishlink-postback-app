/**
 * Validates required environment variables at startup
 */
export function getEnv() {
  const wishlinkBaseUrl =
    process.env.WISHLINK_POSTBACK_BASE_URL || "http://wishlink.com";
  const goalId = process.env.WISHLINK_GOAL_ID || "default_goal";
  const campaignId = process.env.WISHLINK_CAMPAIGN_ID || "default_campaign";
  const creativeId = process.env.WISHLINK_CREATIVE_ID || "default_creative";

  return {
    wishlinkBaseUrl: wishlinkBaseUrl.replace(/\/$/, ""),
    goalId,
    campaignId,
    creativeId,
    postbackTimeout: parseInt(process.env.POSTBACK_TIMEOUT_MS || "10000", 10),
    postbackMaxRetries: parseInt(
      process.env.POSTBACK_MAX_RETRIES || "3",
      10,
    ),
  };
}
