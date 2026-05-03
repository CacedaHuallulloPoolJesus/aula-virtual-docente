"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/insignia.png");
  const router = useRouter();
  const { status } = useSession();
  const isDisabled = loading || !email.trim() || !password.trim();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Ingrese correo institucional y contraseña.");
      return;
    }

    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("Credenciales incorrectas o usuario inactivo.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary p-4">
      <div className="pointer-events-none absolute -top-16 -left-10 h-44 w-44 rounded-full bg-accent/25 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 bottom-10 h-36 w-36 rounded-full bg-danger/20 blur-2xl" />

      <Card className="w-full max-w-md rounded-3xl border border-accent/45 bg-white/98 p-8 shadow-2xl shadow-primary/25 backdrop-blur-md transition-all duration-300">
        <div className="mb-6 space-y-3 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent/70 bg-cream shadow-md">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt="Insignia Institución Educativa Virgen del Carmen"
                width={78}
                height={78}
                className="rounded-full object-cover"
                onError={() => {
                  setLogoSrc("");
                }}
              />
            ) : (
              <span className="text-xl font-bold text-primary">VC</span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Sistema Integral de Aula Virtual Docente</h1>
          <p className="text-sm text-secondary">Institución Educativa Virgen del Carmen — Huayucachi</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Correo institucional"
            type="email"
            placeholder="Ingrese su correo institucional"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="Ingrese su contraseña"
            icon={<Lock size={18} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer text-secondary transition hover:text-danger"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
          <div className="space-y-1 rounded-xl border border-secondary/25 bg-cream/50 p-3 text-xs text-foreground/85">
            <p className="font-semibold text-primary">Cuentas de demostración</p>
            <p className="text-secondary">Tras la carga inicial de datos con <code className="rounded bg-white/90 px-1">npx prisma db seed</code>:</p>
            <p>Administrador (demostración): admin@aula.com — contraseña 123456</p>
            <p>Administrador institucional: admin@virgendelcarmen.edu.pe — contraseña Admin123*</p>
            <p>Docente 1: docente1@aula.com — contraseña 123456</p>
            <p>Docente 2: docente2@aula.com — contraseña 123456</p>
            <p className="pt-1 text-secondary">
              Si no puede acceder, verifique la variable <code className="rounded bg-white/80 px-1">DATABASE_URL</code> y ejecute nuevamente la carga de datos indicada.
            </p>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-xl bg-gradient-to-r from-primary via-secondary to-accent py-2.5 font-semibold text-white shadow-lg ring-2 ring-accent/40 hover:brightness-105"
            disabled={isDisabled}
          >
            {loading ? "Validando credenciales…" : "Iniciar sesión"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
