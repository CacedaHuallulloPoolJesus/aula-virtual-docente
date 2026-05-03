"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import type { SystemConfig } from "@prisma/client";
import { Button, Card, Input } from "@/components/ui";
import { apiJson } from "@/lib/api-client";
import { buildAcademicPdf } from "@/lib/pdf-export";

type GeneratedSession = {
  title: string;
  grade: string;
  section: string;
  area: string;
  competence: string;
  capacity: string;
  performance: string;
  learningPurpose: string;
  evidence: string;
  start: string;
  development: string;
  closure: string;
  resources: string;
  evaluation: string;
  instrument: string;
  duration: string;
};

export function IaSessionForm() {
  const { data: session } = useSession();
  const [result, setResult] = useState<GeneratedSession | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session?.user?.teacherId) {
      alert("Solo usuarios con perfil docente pueden generar sesiones con IA.");
      return;
    }
    setLoading(true);
    const formData = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const apiRes = await fetch("/api/sessions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          grade: formData.grade,
          area: formData.area,
          topic: formData.topic,
          competence: formData.competence,
          duration: formData.duration,
          purpose: formData.purpose,
        }),
      });
      if (!apiRes.ok) {
        alert(await apiRes.text());
        setLoading(false);
        return;
      }
      const gen = (await apiRes.json()) as Record<string, string>;
      setResult({
        title: String(gen.title ?? `Sesión IA: ${formData.topic as string}`),
        grade: String(formData.grade ?? ""),
        section: String(formData.section ?? ""),
        area: String(formData.area ?? ""),
        competence: String(gen.competence ?? formData.competence ?? ""),
        capacity: String(gen.capacity ?? ""),
        performance: String(gen.performance ?? ""),
        learningPurpose: String(gen.learningPurpose ?? formData.purpose ?? ""),
        evidence: String(gen.learningEvidence ?? ""),
        start: String(gen.startActivity ?? ""),
        development: String(gen.development ?? ""),
        closure: String(gen.closure ?? ""),
        resources: String(gen.resources ?? ""),
        evaluation: String(gen.evaluation ?? ""),
        instrument: "Lista de cotejo / rúbrica",
        duration: String(formData.duration ?? "90 minutos"),
      });
    } catch {
      alert("Error al generar sesión");
    }
    setLoading(false);
  }

  async function saveSession() {
    if (!result || !session?.user?.teacherId) return;
    try {
      await apiJson("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          title: result.title,
          grade: result.grade,
          section: result.section,
          area: result.area,
          competence: result.competence,
          capacity: result.capacity,
          performance: result.performance,
          learningPurpose: result.learningPurpose,
          learningEvidence: result.evidence,
          startActivity: result.start,
          development: result.development,
          closure: result.closure,
          resources: result.resources,
          evaluation: result.evaluation,
          date: new Date().toISOString().slice(0, 10),
          duration: result.duration,
          generatedByIa: true,
        }),
      });
      alert("Sesión IA guardada correctamente.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    }
  }

  async function exportPdf() {
    if (!result || !session?.user?.teacherId) return;
    try {
      const config = await apiJson<SystemConfig | null>("/api/system-config");
      const doc = buildAcademicPdf({
        config,
        title: result.title,
        subtitle: `${result.area} · ${result.grade} ${result.section}`,
        teacherName: session.user.name ?? session.user.email ?? "",
        gradeSection: `${result.grade} — ${result.section}`,
        columns: [
          { header: "Sección", dataKey: "k" },
          { header: "Contenido", dataKey: "v" },
        ],
        rows: [
          { k: "Propósito", v: result.learningPurpose },
          { k: "Competencia", v: result.competence },
          { k: "Inicio", v: result.start },
          { k: "Desarrollo", v: result.development },
          { k: "Cierre", v: result.closure },
          { k: "Evaluación", v: result.evaluation },
        ],
      });
      doc.save("sesion-ia.pdf");
    } catch {
      alert("No se pudo exportar PDF");
    }
  }

  function updateField<K extends keyof GeneratedSession>(key: K, value: GeneratedSession[K]) {
    setResult((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-primary">Generador inteligente de sesiones</h2>
        <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
          <Input label="Grado" name="grade" placeholder="3ro primaria" defaultValue={session?.user?.assignedGradeName ?? ""} required />
          <Input label="Sección" name="section" placeholder="A" defaultValue={session?.user?.assignedSectionName ?? ""} required />
          <Input label="Área curricular" name="area" placeholder="Comunicación" required />
          <Input label="Tema" name="topic" placeholder="Comprensión lectora inferencial" required />
          <Input label="Competencia" name="competence" placeholder="Lee diversos tipos de textos" required />
          <Input label="Duración" name="duration" placeholder="90 minutos" defaultValue="90 minutos" required />
          <Input label="Propósito de aprendizaje" name="purpose" placeholder="Inferir información implícita" required />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Generando propuesta…" : "Generar sesión inteligente"}
          </Button>
        </form>
      </Card>
      <Card>
        <h3 className="mb-3 font-semibold text-primary">Resultado editable</h3>
        {result ? (
          <div className="space-y-2 text-sm text-foreground/90">
            <Input label="Título" value={result.title} onChange={(e) => updateField("title", e.target.value)} />
            <Input label="Propósito" value={result.learningPurpose} onChange={(e) => updateField("learningPurpose", e.target.value)} />
            <Input label="Competencia" value={result.competence} onChange={(e) => updateField("competence", e.target.value)} />
            <Input label="Capacidad" value={result.capacity} onChange={(e) => updateField("capacity", e.target.value)} />
            <Input label="Desempeño" value={result.performance} onChange={(e) => updateField("performance", e.target.value)} />
            <Input label="Evidencia" value={result.evidence} onChange={(e) => updateField("evidence", e.target.value)} />
            <Input label="Inicio" value={result.start} onChange={(e) => updateField("start", e.target.value)} />
            <Input label="Desarrollo" value={result.development} onChange={(e) => updateField("development", e.target.value)} />
            <Input label="Cierre" value={result.closure} onChange={(e) => updateField("closure", e.target.value)} />
            <Input label="Recursos" value={result.resources} onChange={(e) => updateField("resources", e.target.value)} />
            <Input label="Evaluación" value={result.evaluation} onChange={(e) => updateField("evaluation", e.target.value)} />
            <Input label="Instrumento" value={result.instrument} onChange={(e) => updateField("instrument", e.target.value)} />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="secondary" onClick={() => void saveSession()}>
                Guardar sesión
              </Button>
              <Button variant="secondary" onClick={() => void exportPdf()}>
                Exportar PDF
              </Button>
              <Button variant="secondary" onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}>
                Copiar contenido
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/60">Complete el formulario para generar una propuesta de sesión.</p>
        )}
      </Card>
    </div>
  );
}
