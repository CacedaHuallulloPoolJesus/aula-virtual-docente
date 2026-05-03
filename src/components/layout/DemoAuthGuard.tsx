"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";

export function DemoAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { auth } = useAppData();

  useEffect(() => {
    if (!auth.user) {
      router.replace("/login");
    }
  }, [router, auth.user]);

  if (!auth.user) {
    return <div className="p-6 text-sm text-slate-600">Validando sesión...</div>;
  }

  return <>{children}</>;
}
