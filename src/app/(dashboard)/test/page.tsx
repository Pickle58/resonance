import { trpc, prefetch, HydrateClient } from "@/trpc/server";
import { HealthCheck } from "./health-check";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function TestPage() {

   prefetch(trpc.health.queryOptions());
   return (
      <HydrateClient>
         <div className="flex flex-col items-center justify-center gap-4 p-8">
            <h1 className="text-2xl font-bold">Test Page</h1>
            <p className="text-sm text-muted-foreground">
               This is a test page to check the tRPC connection.
            </p>
            <ErrorBoundary fallback={<div>Error</div>}>
               <Suspense fallback={<div>Loading...</div>}>
                  <HealthCheck />
               </Suspense>
            </ErrorBoundary>
         </div>
      </HydrateClient>
   )
}