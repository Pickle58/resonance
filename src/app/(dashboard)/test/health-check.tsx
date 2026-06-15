"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function HealthCheck() {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.health.queryOptions());
    
    return (
        <div>
            <div className="rounded-lg border p-6 text-center">
                <p className="text-muted-foreground text-sm">tRPC Status</p>
                <p className="mt-2 text-lg font-semibold">{data.status}</p>
                <p className="mt-2 text-lg font-semibold">{data.code}</p>
            </div>
        </div>
    );
};