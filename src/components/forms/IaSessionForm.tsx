"use client";

import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { useAppData } from "@/components/providers/AppDataProvider";

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
  const [result, setResult] = useState<GeneratedSession | null>(null);
  const [loading, setLoading] = useState(false);
  const { auth, data, addSession } = useAppData();
  const teacher = data.teachers.find((t) => t.id === auth.user?.teacherId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = Object.fromEntries(new FormData(e.currentTarget).entries());

    await new Promise((resolve) => setTimeout(resolve, 700));
    setResult({
      title: `Sesión IA: ${formData.topic as string}`,
      grade: formData.grade as string,
      section: formData.section as string,
      area: formData.area as string,
      competence: formData.competence as string,
      capacity: formData.capacity as string,
      performance: `Resuelve situaciones del tema ${formData.topic as string} en nivel ${formData.level as string}.`,
      learningPurpose: formData.purpose as string,
      evidence: "Producto grupal, ficha resuelta y participación en plenaria.",
      start: "Activación de saberes previos y planteamiento del reto.",
      development: `Durante ${formData.duration as string}, los estudiantes desarrollan el tema ${
        formData.topic as string
      } con actividades guiadas, trabajo colaborativo y uso de ${formData.resources as string}.`,
      closure: "Metacognición, compromisos y retroalimentación formativa.",
      resources: formData.resources as string,
      evaluation: "Lista de cotejo con criterios de desempeño y participación.",
      instrument: "Rúbrica analítica",
      duration: formData.duration as string,
    });
    setLoading(false);
  }

  function saveSession() {
    if (!result || !auth.user?.teacherId) return;
    addSession({
      teacherId: auth.user.teacherId,
      title: result.title,
      grade: result.grade,
      section: result.section,
      area: result.area,
      competence: result.competence,
      capacity: result.capacity,
      performance: result.performance,
      purpose: result.learningPurpose,
      evidence: result.evidence,
      start: result.start,
      development: result.development,
      closure: result.closure,
      resources: result.resources,
      evaluation: result.evaluation,
      date: new Date().toISOString().slice(0, 10),
      duration: result.duration,
      generatedByIa: true,
    });
    alert("Sesión IA guardada correctamente.");
  }

  function updateField<K extends keyof GeneratedSession>(key: K, value: GeneratedSession[K]) {
    setResult((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-purple-100">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Generador inteligente de sesiones</h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input label="Grado" name="grade" placeholder="3ro primaria" defaultValue={teacher?.grade} required />
          <Input label="Sección" name="section" placeholder="A" defaultValue={teacher?.section} required />
          <Input label="Área curricular" name="area" placeholder="Comunicación" required />
          <Input label="Tema" name="topic" placeholder="Comprensión lectora inferencial" required />
          <Input label="Competencia" name="competence" placeholder="Lee diversos tipos de textos" required />
          <Input label="Capacidad" name="capacity" placeholder="Infiere e interpreta información" required />
          <Input label="Duración" name="duration" placeholder="90 minutos" required />
          <Input label="Propósito de aprendizaje" name="purpose" placeholder="Inferir información implícita" required />
          <Input label="Nivel de dificultad" name="level" placeholder="Intermedio" required />
          <Input label="Recursos disponibles" name="resources" placeholder="Pizarra, papelógrafos, fichas" required />
          <Button type="submit" variant="purple" className="w-full">
            {loading ? "Generando..." : "Generar sesión inteligente"}
          </Button>
        </form>
      </Card>
      <Card className="border-purple-100">
        <h3 className="mb-3 font-semibold text-slate-900">Resultado editable</h3>
        {result ? (
          <div className="space-y-2 text-sm text-slate-700">
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
              <Button variant="purple" onClick={saveSession}>
                Guardar sesión
              </Button>
              <Button variant="secondary" onClick={() => alert("Puedes editar los campos directamente arriba.")}>
                Editar resultado
              </Button>
              <Button variant="secondary" onClick={() => alert("Exportación a PDF preparada.")}>
                Exportar PDF
              </Button>
              <Button variant="secondary" onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}>
                Copiar contenido
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Completa el formulario para generar una propuesta de sesión.</p>
        )}
      </Card>
    </div>
  );
}
