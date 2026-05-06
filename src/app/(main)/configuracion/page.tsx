"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { ForbiddenSection } from "@/components/layout/ForbiddenSection";
import { Button, Card, Input, useToast } from "@/components/ui";
import { apiJson } from "@/lib/api-client";

type Config = {
  id: string;
  institutionName: string;
  modularCode: string | null;
  address: string | null;
  district: string | null;
  province: string | null;
  region: string | null;
  academicYear: string | null;
  directorName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  periodsJson: string | null;
};

export default function ConfiguracionPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [cfg, setCfg] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiJson<Config>("/api/system-config")
      .then(setCfg)
      .catch(() => setCfg(null));
  }, []);

  if (session?.user?.role !== Role.ADMIN) {
    return <ForbiddenSection />;
  }

  if (!cfg) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Configuración Institucional</h2>
        <Card>Cargando configuración…</Card>
      </section>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiJson<Config>("/api/system-config", { method: "PUT", body: JSON.stringify(cfg) });
      setCfg(updated);
      toast("Configuración guardada correctamente.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Configuración Institucional</h2>
      <Card>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => void save(e)}>
          <Input label="Nombre de la institución" value={cfg.institutionName} onChange={(e) => setCfg({ ...cfg, institutionName: e.target.value })} required />
          <Input label="Código modular" value={cfg.modularCode ?? ""} onChange={(e) => setCfg({ ...cfg, modularCode: e.target.value || null })} />
          <Input label="Dirección" value={cfg.address ?? ""} onChange={(e) => setCfg({ ...cfg, address: e.target.value || null })} className="md:col-span-2" />
          <Input label="Distrito" value={cfg.district ?? ""} onChange={(e) => setCfg({ ...cfg, district: e.target.value || null })} />
          <Input label="Provincia" value={cfg.province ?? ""} onChange={(e) => setCfg({ ...cfg, province: e.target.value || null })} />
          <Input label="Región" value={cfg.region ?? ""} onChange={(e) => setCfg({ ...cfg, region: e.target.value || null })} />
          <Input label="Año académico" value={cfg.academicYear ?? ""} onChange={(e) => setCfg({ ...cfg, academicYear: e.target.value || null })} />
          <Input label="Nombre del director" value={cfg.directorName ?? ""} onChange={(e) => setCfg({ ...cfg, directorName: e.target.value || null })} />
          <Input label="URL del logo" value={cfg.logoUrl ?? ""} onChange={(e) => setCfg({ ...cfg, logoUrl: e.target.value || null })} className="md:col-span-2" />
          <Input label="Color primario (hex)" value={cfg.primaryColor ?? ""} onChange={(e) => setCfg({ ...cfg, primaryColor: e.target.value || null })} />
          <Input label="Color secundario (hex)" value={cfg.secondaryColor ?? ""} onChange={(e) => setCfg({ ...cfg, secondaryColor: e.target.value || null })} />
          <Input label="Períodos (JSON opcional)" value={cfg.periodsJson ?? ""} onChange={(e) => setCfg({ ...cfg, periodsJson: e.target.value || null })} className="md:col-span-2" />
          <div className="md:col-span-2">
            <Button type="submit" variant="primary" className="cursor-pointer" disabled={saving}>
              {saving ? "Guardando..." : "Guardar configuración"}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
