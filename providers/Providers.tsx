"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MuiProvider from "./MuiProvider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MuiProvider>{children}</MuiProvider>
    </QueryClientProvider>
  );
}
