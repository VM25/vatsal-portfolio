// components/providers.tsx
"use client";

import { ReactNode, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster as SonnerToaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  // ensure a single client-side QueryClient
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>

      <SonnerToaster />
    </QueryClientProvider>
  );
}