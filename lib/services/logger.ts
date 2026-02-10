type LogLevel = "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  };

  if (level === "error") {
    console.error(JSON.stringify(logData));
  } else {
    console.log(JSON.stringify(logData));
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
};
