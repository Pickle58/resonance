import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,

  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  replaysSessionSampleRate: isDevelopment ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],

  beforeSendLog: (log) => {
    if (!isDevelopment && (log.level === "debug" || log.level === "trace")) {
      return null;
    }
    return log;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
