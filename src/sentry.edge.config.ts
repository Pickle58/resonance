import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  sendDefaultPii: true,
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  enableLogs: true,

  beforeSendLog: (log) => {
    if (!isDevelopment && (log.level === "debug" || log.level === "trace")) {
      return null;
    }
    return log;
  },
});
