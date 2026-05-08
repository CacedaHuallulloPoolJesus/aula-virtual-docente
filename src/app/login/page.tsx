"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { institutionDefaults } from "@/constants/institution";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      if (res.error === "AccountInactive") {
        setError("Cuenta inactiva, comuníquese con el administrador.");
      } else if (res.error === "UserNotFound") {
        setError("Usuario no encontrado.");
      } else if (res.error === "IncorrectPassword") {
        setError("Contraseña incorrecta.");
      } else {
        setError("Credenciales incorrectas.");
      }
      return;
    }

    if (!res?.ok) {
      setError("No se pudo iniciar sesión. Verifique su conexión o ejecute la carga de datos (seed) si es la primera vez.");
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
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent/70 bg-cream shadow-md ring-2 ring-secondary/20">
            <Image src={institutionDefaults.logoPath} alt="Insignia institucional" width={78} height={78} className="rounded-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Aula Virtual Docente</h1>
          <p className="text-sm font-medium text-secondary">{institutionDefaults.fullLegalName}</p>
          <p className="text-xs uppercase tracking-wide text-foreground/55">Sistema Integral</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Correo institucional"
            type="email"
            placeholder="correo@institución.edu.pe"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
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
