import { TRPCError } from "@trpc/server";
import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

const IGNORED_TRPC_CODES: TRPCError["code"][] = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "BAD_REQUEST",
  "PRECONDITION_FAILED",
];

const tracePropagationTargets: (string | RegExp)[] = [
  "localhost",
  /^\//,
];

if (process.env.CHATTERBOX_API_URL) {
  tracePropagationTargets.push(process.env.CHATTERBOX_API_URL);
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  sendDefaultPii: true,
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,
  tracePropagationTargets,

  includeLocalVariables: true,

  enableLogs: true,

  beforeSend(event, hint) {
    if (
      hint.originalException instanceof TRPCError &&
      IGNORED_TRPC_CODES.includes(hint.originalException.code)
    ) {
      return null;
    }
    return event;
  },

  beforeSendLog: (log) => {
    if (!isDevelopment && (log.level === "debug" || log.level === "trace")) {
      return null;
    }
    return log;
  },
});
