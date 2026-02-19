"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
// Optional:
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function Providers({ children }) {
  // Create one stable QueryClient per browser session
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        {/* Optional devtools */}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
