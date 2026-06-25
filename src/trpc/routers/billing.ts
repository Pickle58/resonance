import { ResourceNotFound } from "@polar-sh/sdk/models/errors/resourcenotfound";
import { TRPCError } from "@trpc/server";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { createTRPCRouter, orgProcedure } from "../init";

export const billingRouter = createTRPCRouter({
  createCheckout: orgProcedure.mutation(async ({ ctx }) => {
    try {
      const result = await polar.checkouts.create({
        products: [env.POLAR_PRODUCT_ID],
        externalCustomerId: ctx.orgId,
        successUrl: env.APP_URL,
      });

      if (!result.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }

      return { checkoutUrl: result.url };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      console.error("Failed to create checkout session", {
        orgId: ctx.orgId,
        error: err,
      });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          err instanceof Error ? err.message : "Failed to create checkout session",
      });
    }
  }),

  createPortalSession: orgProcedure.mutation(async ({ ctx }) => {
    try {
      const result = await polar.customerSessions.create({
        externalCustomerId: ctx.orgId,
      });

      if (!result.customerPortalUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create customer portal session",
        });
      }

      return { portalUrl: result.customerPortalUrl };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      console.error("Failed to create customer portal session", {
        orgId: ctx.orgId,
        error: err,
      });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          err instanceof Error
            ? err.message
            : "Failed to create customer portal session",
      });
    }
  }),

  getStatus: orgProcedure.query(async ({ ctx }) => {
    try {
      const customerState = await polar.customers.getStateExternal({
        externalId: ctx.orgId,
      });

      const hasActiveSubscription =
        (customerState.activeSubscriptions ?? []).length > 0;

      // Sum up estimated costs from all meters across active subscriptions
      let estimatedCostCents = 0;
      for (const sub of customerState.activeSubscriptions ?? []) {
        for (const meter of sub.meters ?? []) {
          estimatedCostCents += meter.amount ?? 0;
        }
      }

      return {
        hasActiveSubscription,
        customerId: customerState.id,
        estimatedCostCents,
      };
    } catch (err) {
      if (err instanceof ResourceNotFound) {
        // Customer doesn't exist yet in Polar
        return {
          hasActiveSubscription: false,
          customerId: null,
          estimatedCostCents: 0,
        };
      }
      console.error("Failed to fetch billing status", { orgId: ctx.orgId, error: err });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch billing status",
      });
    }
  }),
});
