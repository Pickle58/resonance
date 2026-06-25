import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export function useCheckout() {
    const trpc = useTRPC();
    const mutation = useMutation(
      trpc.billing.createCheckout.mutationOptions({})
    );

    const checkout = useCallback(async () => {
        try {
            const data = await mutation.mutateAsync(undefined);
            window.location.href = data.checkoutUrl;
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to start checkout",
            );
        }
    }, [mutation]);

    return {
        checkout,
        isPending: mutation.isPending,
    };
}
