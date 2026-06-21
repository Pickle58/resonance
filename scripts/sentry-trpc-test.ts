import dotenv from "dotenv";
import { TRPCError, initTRPC } from "@trpc/server";
import * as Sentry from "@sentry/nextjs";
import superjson from "superjson";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  if (!process.env.SENTRY_DSN) {
    console.error("SENTRY_DSN is not set in .env.local");
    process.exit(1);
  }

  await import("../src/sentry.server.config");

  const t = initTRPC.create({ transformer: superjson });
  const sentryMiddleware = t.middleware(
    Sentry.trpcMiddleware({ attachRpcInput: true }),
  );
  const procedure = t.procedure.use(sentryMiddleware);

  const router = t.router({
    sentryTest: procedure.query(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Sentry tRPC test error — delete me",
        cause: new Error("Sentry tRPC test error — delete me"),
      });
    }),
  });

  const caller = router.createCaller({});

  try {
    await caller.sentryTest();
  } catch (error) {
    console.log(
      "Triggered expected tRPC error:",
      error instanceof Error ? error.message : error,
    );
  }

  const flushed = await Sentry.flush(5000);
  console.log(`Sentry flush complete (${flushed ? "sent" : "timeout"})`);
  console.log("Check Sentry Issues for: Sentry tRPC test error — delete me");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
