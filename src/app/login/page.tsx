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
      setError("No se pudo iniciar sesión.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B3B70] via-[#0F4C81] to-[#0B3B70] p-4">
      <div className="pointer-events-none absolute -top-16 -left-10 h-44 w-44 rounded-full bg-[#F2B705]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-10 h-36 w-36 rounded-full bg-[#D72638]/20 blur-3xl" />

      <Card className="w-full max-w-md rounded-[32px] border border-[#F2B705]/40 bg-white p-8 shadow-2xl shadow-[#0B3B70]/30 backdrop-blur-md">
        <div className="mb-6 space-y-3 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#F2B705] bg-white p-2 shadow-xl">
            <Image
              src="/insignia.png"
              alt="Insignia Institución Educativa Virgen del Carmen"
              width={120}
              height={120}
              priority
              unoptimized
              className="h-full w-full rounded-full object-contain"
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#0B1F3A]">
            Aula Virtual Docente
          </h1>

          <p className="text-sm font-semibold text-[#0F4C81]">
            {institutionDefaults.fullLegalName}
          </p>

          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Sistema Integral
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Correo institucional"
            type="email"
            placeholder="correo@institucion.edu.pe"
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
                className="cursor-pointer text-[#0F4C81] transition hover:text-[#D72638]"
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isDisabled}
            className="w-full rounded-xl bg-gradient-to-r from-[#0B3B70] via-[#2F5D8C] to-[#F2B705] py-3 text-base font-bold text-white shadow-lg ring-2 ring-[#F2B705]/40 transition-all hover:scale-[1.01] hover:brightness-105"
          >
            {loading ? "Validando credenciales..." : "Iniciar sesión"}
          </Button>
        </form>
      </Card>
    </main>
  );
}