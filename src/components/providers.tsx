"use client";

import { SessionProvider } from "next-auth/react";
import { AppDataProvider } from "@/components/providers/AppDataProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppDataProvider>{children}</AppDataProvider>
    </SessionProvider>
  );
}
