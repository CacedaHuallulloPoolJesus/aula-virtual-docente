"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { useAppData } from "@/components/providers/AppDataProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/insignia.png");
  const { login } = useAppData();
  const router = useRouter();
  const isDisabled = loading || !email.trim() || !password.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Completa correo y contraseña.");
      return;
    }

    setLoading(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);

    const result = login(email.trim(), password);
    if (!result.ok) {
      setError(result.message ?? "Credenciales incorrectas");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#0F4C81] to-[#0B1F3A] p-4">
      <div className="pointer-events-none absolute -top-16 -left-10 h-44 w-44 rounded-full bg-[#F2B705]/20 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 bottom-10 h-36 w-36 rounded-full bg-[#D62828]/20 blur-2xl" />

      <Card className="w-full max-w-md rounded-3xl border border-[#F2B705]/40 bg-white/95 p-8 shadow-2xl backdrop-blur-md transition-all duration-300">
        <div className="mb-6 space-y-3 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#F2B705]/60 bg-[#F6E7C1] shadow-md">
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
              <span className="text-xl font-bold text-[#0B1F3A]">VC</span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A]">Aula Virtual Docente</h1>
          <p className="text-sm text-[#0F4C81]">Institución Educativa Virgen del Carmen - Huayucachi</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Correo"
            type="email"
            placeholder="admin@aula.com"
            icon={<Mail size={18} />}
            className="border-[#0F4C81]/30 focus:border-[#F2B705] focus:ring-[#F2B705]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="123456"
            icon={<Lock size={18} />}
            className="border-[#0F4C81]/30 focus:border-[#F2B705] focus:ring-[#F2B705]"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer text-[#0F4C81] transition hover:text-[#D62828]"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="rounded-lg border border-[#D62828]/30 bg-[#D62828]/10 px-3 py-2 text-sm font-medium text-[#D62828]">{error}</p>}
          <div className="rounded-xl border border-[#0F4C81]/20 bg-[#F6E7C1]/40 p-3 text-xs text-slate-700">
            <p>Admin: admin@aula.com / 123456</p>
            <p>Docente 1: docente1@aula.com / 123456</p>
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-[#0F4C81] via-[#0B1F3A] to-[#D62828] py-2.5 text-white shadow-lg hover:from-[#0B1F3A] hover:to-[#D62828]"
            disabled={isDisabled}
          >
            {loading ? "Validando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
