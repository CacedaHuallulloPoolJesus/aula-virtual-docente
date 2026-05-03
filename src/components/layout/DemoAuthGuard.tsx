"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function DemoAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return <div className="p-6 text-sm text-secondary">Verificando la sesión, espere un momento…</div>;
  }

  if (status === "unauthenticated") {
    return <div className="p-6 text-sm text-secondary">Redirigiendo al inicio de sesión…</div>;
  }

  return <>{children}</>;
}
