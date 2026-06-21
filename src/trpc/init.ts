import { auth } from '@clerk/nextjs/server';
import { TRPCError, initTRPC } from '@trpc/server';
import * as Sentry from '@sentry/nextjs';
import superjson from 'superjson';

/**
 * This context creator accepts `headers` so it can be reused in both
 * the RSC server caller (where you pass `next/headers`) and the
 * API route handler (where you pass the request headers).
 */
export async function createTRPCContext(opts: {
  headers: Headers;
}) {
  return {
    headers: opts.headers,
  };
}

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
       * @see https://trpc.io/docs/server/data-transformers
       */
  transformer: superjson,

});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const baseProcedure = t.procedure.use(sentryMiddleware);

// Authenticated procedure - calls auth() only when needed
export const authProcedure = baseProcedure.use(async ({ next }) => {
  const { userId } = await auth();

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  Sentry.getIsolationScope().setAttributes({ user_id: userId });
  Sentry.setUser({ id: userId });

  return next({
    ctx: { userId },
  });
});

// Organization procedure - requires userId and orgId
export const orgProcedure = baseProcedure.use(async ({ next }) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!orgId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Organization required",
    });
  }

  Sentry.getIsolationScope().setAttributes({
    user_id: userId,
    org_id: orgId,
  });
  Sentry.setUser({ id: userId });

  return next({ ctx: { userId, orgId } });
});