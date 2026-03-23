type LogLevel = "info" | "warn" | "error" | "debug";

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [WishlinkPostback]`;
  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(formatLog("info", message, data));
  },
  warn: (message: string, data?: unknown) => {
    console.warn(formatLog("warn", message, data));
  },
  error: (message: string, data?: unknown) => {
    console.error(formatLog("error", message, data));
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.DEBUG) {
      console.debug(formatLog("debug", message, data));
    }
  },
};
