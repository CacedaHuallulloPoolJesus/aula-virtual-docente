"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { AlertTriangle, BarChart3, Bot, Lightbulb, Loader2, MessageCircle, Sparkles, X } from "lucide-react";
import { AgentAlertPreview } from "@/components/agents/AgentAlertPreview";
import { AgentCard } from "@/components/agents/AgentCard";
import { AgentResultPanel } from "@/components/agents/AgentResultPanel";
import { Button, Input } from "@/components/ui";
import { areas } from "@/constants/academic";
import { apiJson } from "@/lib/api-client";
import type { AgentsDataContext } from "@/lib/agents";
import type { AttendanceRecord } from "@/types/attendance";
import type { GradeRecord } from "@/types/grades";
import type { LearningSession } from "@/types/session";
import type { Student } from "@/types/student";
import {
  analyzeAcademicPerformance,
  generateLearningSession,
  generatePedagogicalAlerts,
  recommendActivities,
  teacherAssistantResponse,
} from "@/lib/agents";

type AgentId = "session" | "performance" | "alerts" | "activities" | "assistant";

const COLORS = {
  navy: "#0B1F3A",
  blue: "#0F4C81",
  gold: "#F2B705",
  cream: "#F6E7C1",
  red: "#D62828",
  green: "#15803d",
};

async function logAgentRun(agentName: string, input: unknown, output: string, userId: string | null) {
  try {
    await fetch("/api/agents/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentName,
        input: typeof input === "string" ? input : JSON.stringify(input),
        output,
        userId,
      }),
    });
  } catch {
    /* opcional: BD puede no estar migrada */
  }
}

type ApiStudent = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  dni: string | null;
  birthDate: string | null;
  guardian: string | null;
  guardianPhone: string | null;
  address: string | null;
  status: Student["status"];
  grade: { name: string };
  section: { name: string };
};

type ApiGrade = {
  id: string;
  studentId: string;
  area: string;
  note1: number;
  note2: number;
  note3: number;
  course: { period: { name: string } };
};

type ApiAttendance = {
  id: string;
  date: string;
  studentId: string;
  status: string;
  justification: string | null;
  teacherId: string;
};

type ApiSession = {
  id: string;
  teacherId: string;
  title: string;
  grade: string;
  section: string;
  area: string;
  competence: string;
  capacity: string;
  performance: string;
  learningPurpose: string;
  learningEvidence: string;
  startActivity: string;
  development: string;
  closure: string;
  resources: string;
  evaluation: string;
  date: string;
  duration: string;
  generatedByIa: boolean;
};

export default function AgentesIaPage() {
  const { data: session } = useSession();
  const [rawStudents, setRawStudents] = useState<ApiStudent[]>([]);
  const [rawGrades, setRawGrades] = useState<ApiGrade[]>([]);
  const [rawAttendance, setRawAttendance] = useState<ApiAttendance[]>([]);
  const [rawSessions, setRawSessions] = useState<ApiSession[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [stu, gr, att, ses] = await Promise.all([
          apiJson<ApiStudent[]>("/api/students"),
          apiJson<ApiGrade[]>("/api/grades"),
          apiJson<ApiAttendance[]>("/api/attendance"),
          apiJson<ApiSession[]>("/api/sessions"),
        ]);
        setRawStudents(stu);
        setRawGrades(gr);
        setRawAttendance(att);
        setRawSessions(ses);
      } catch {
        setRawStudents([]);
        setRawGrades([]);
        setRawAttendance([]);
        setRawSessions([]);
      }
    })();
  }, []);

  const agentCtx: AgentsDataContext = useMemo(() => {
    const students: Student[] = rawStudents.map((s) => ({
      id: s.id,
      code: s.code,
      firstName: s.firstName,
      lastName: s.lastName,
      dni: s.dni ?? "",
      birthDate: s.birthDate ? s.birthDate.slice(0, 10) : "",
      grade: s.grade.name,
      section: s.section.name,
      guardian: s.guardian ?? "",
      guardianPhone: s.guardianPhone ?? "",
      address: s.address ?? "",
      status: s.status,
    }));

    const grades: GradeRecord[] = rawGrades.map((g) => ({
      id: g.id,
      studentId: g.studentId,
      area: g.area,
      period: g.course.period.name,
      note1: g.note1,
      note2: g.note2,
      note3: g.note3,
    }));

    const attendance: AttendanceRecord[] = rawAttendance.map((a) => ({
      id: a.id,
      date: new Date(a.date).toISOString().slice(0, 10),
      studentId: a.studentId,
      status: a.status,
      justification: a.justification ?? undefined,
      teacherId: a.teacherId,
    }));

    const sessions: LearningSession[] = rawSessions.map((s) => ({
      id: s.id,
      teacherId: s.teacherId,
      title: s.title,
      grade: s.grade,
      section: s.section,
      area: s.area,
      competence: s.competence,
      capacity: s.capacity,
      performance: s.performance,
      purpose: s.learningPurpose,
      evidence: s.learningEvidence,
      start: s.startActivity,
      development: s.development,
      closure: s.closure,
      resources: s.resources,
      evaluation: s.evaluation,
      date: s.date.slice(0, 10),
      duration: s.duration,
      generatedByIa: s.generatedByIa,
    }));

    if (session?.user?.role === Role.ADMIN) {
      return { students, grades, attendance, sessions };
    }
    const scoped = students.filter(
      (s) => s.grade === session?.user?.assignedGradeName && s.section === session?.user?.assignedSectionName,
    );
    const ids = new Set(scoped.map((s) => s.id));
    return {
      students: scoped,
      grades: grades.filter((g) => ids.has(g.studentId)),
      attendance: attendance.filter((a) => a.teacherId === session?.user?.teacherId),
      sessions: sessions.filter((s) => s.teacherId === session?.user?.teacherId),
    };
  }, [rawStudents, rawGrades, rawAttendance, rawSessions, session?.user]);

  const [open, setOpen] = useState<AgentId | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState("");
  const [copyOk, setCopyOk] = useState(false);

  /* Formularios */
  const [sessionForm, setSessionForm] = useState({
    grade: "3ro Primaria",
    area: areas[1],
    topic: "",
    competence: "",
    capacity: "",
    performance: "",
    duration: "90 minutos",
    purpose: "",
  });

  useEffect(() => {
    const g = session?.user?.assignedGradeName;
    if (g) setSessionForm((p) => ({ ...p, grade: g }));
  }, [session?.user?.assignedGradeName]);
  const [activityForm, setActivityForm] = useState({
    area: areas[0],
    nivelLogro: "B" as "AD" | "A" | "B" | "C",
    dificultad: "media",
  });
  const [chatQuestion, setChatQuestion] = useState("");

  const closeModal = () => {
    setOpen(null);
    setLoading(false);
    setCopyOk(false);
  };

  const copyResult = useCallback(async () => {
    await navigator.clipboard.writeText(resultText);
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 2000);
  }, [resultText]);

  const agents = [
    {
      id: "session" as const,
      title: "Generador de sesiones de aprendizaje",
      desc: "Planifica inicio, desarrollo, cierre, recursos, evidencia e instrumentos a partir de competencias y propósito de aprendizaje.",
      icon: Sparkles,
      accent: COLORS.gold,
    },
    {
      id: "performance" as const,
      title: "Analizador de rendimiento académico",
      desc: "Interpreta las notas del aula: promedios por área, estudiantes en situación de riesgo y recomendaciones pedagógicas.",
      icon: BarChart3,
      accent: COLORS.blue,
    },
    {
      id: "alerts" as const,
      title: "Alertas pedagógicas",
      desc: "Cruza asistencia y evaluaciones para priorizar intervenciones (faltas, bajo promedio, tardanzas).",
      icon: AlertTriangle,
      accent: COLORS.red,
    },
    {
      id: "activities" as const,
      title: "Recomendador de actividades",
      desc: "Sugiere actividades de refuerzo según área, nivel de logro (AD–C) y dificultad declarada.",
      icon: Lightbulb,
      accent: COLORS.green,
    },
    {
      id: "assistant" as const,
      title: "Asistente docente",
      desc: "Consultas breves sobre riesgo académico, actividades, sesiones de aprendizaje o asistencia, con base en los datos registrados.",
      icon: MessageCircle,
      accent: COLORS.blue,
    },
  ];

  async function runSession() {
    setLoading(true);
    setResultText("");
    const input = { ...sessionForm };
    const out = await generateLearningSession(input);
    const text = [
      `## Inicio\n${out.inicio}`,
      `## Desarrollo\n${out.desarrollo}`,
      `## Cierre\n${out.cierre}`,
      `## Recursos\n${out.recursos}`,
      `## Evidencia\n${out.evidencia}`,
      `## Evaluación\n${out.evaluacion}`,
      `## Instrumento de evaluación\n${out.instrumentoEvaluacion}`,
    ].join("\n\n");
    setResultText(text);
    void logAgentRun("Generador de Sesiones", input, text, session?.user?.email ?? null);
    setLoading(false);
  }

  async function runPerformance() {
    setLoading(true);
    setResultText("");
    const out = await analyzeAcademicPerformance(agentCtx);
    const text = JSON.stringify(out, null, 2);
    setResultText(text);
    void logAgentRun("Analizador de Rendimiento", { scope: session?.user?.role }, text, session?.user?.email ?? null);
    setLoading(false);
  }

  async function runAlerts() {
    setLoading(true);
    setResultText("");
    const out = await generatePedagogicalAlerts(agentCtx);
    const text = JSON.stringify(out, null, 2);
    setResultText(text);
    void logAgentRun("Alertas Pedagógicas", { scope: session?.user?.role }, text, session?.user?.email ?? null);
    setLoading(false);
  }

  async function runActivities() {
    setLoading(true);
    setResultText("");
    const input = { ...activityForm };
    const out = await recommendActivities(input);
    const text = JSON.stringify(out, null, 2);
    setResultText(text);
    void logAgentRun("Recomendador de Actividades", input, text, session?.user?.email ?? null);
    setLoading(false);
  }

  async function runAssistant() {
    setLoading(true);
    setResultText("");
    const q = chatQuestion.trim();
    if (!q) {
      setResultText("Escribe una pregunta para el asistente.");
      setLoading(false);
      return;
    }
    const out = await teacherAssistantResponse(q, agentCtx);
    setResultText(out);
    void logAgentRun("Asistente Docente", { question: q }, out, session?.user?.email ?? null);
    setLoading(false);
  }

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-b from-background to-white pb-12">
      <header
        className="rounded-3xl border border-[#0F4C81]/20 p-8 text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.blue} 55%, ${COLORS.navy} 100%)`,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/90">Módulo innovador</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
              <Bot className="h-9 w-9 text-accent" aria-hidden />
              Agentes de Inteligencia Artificial
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">
              Asistentes para planificación pedagógica, análisis de rendimiento y decisiones basadas en los datos del aula
              (estudiantes, notas, asistencia y sesiones de aprendizaje). Las respuestas son simuladas de forma coherente; puede conectarse
              a un servicio externo mediante la variable <code className="rounded bg-black/20 px-1">NEXT_PUBLIC_AI_API_URL</code>.
            </p>
          </div>
          <div
            className="rounded-2xl border border-accent/40 bg-cream px-4 py-3 text-xs text-primary shadow-sm"
          >
            <p className="font-semibold text-primary">Contexto de datos</p>
            <p className="mt-1 text-secondary">
              {agentCtx.students.length} estudiantes · {agentCtx.grades.length} registros de notas · {agentCtx.attendance.length}{" "}
              registros de asistencia · {agentCtx.sessions.length} sesiones de aprendizaje
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => (
          <AgentCard
            key={a.id}
            title={a.title}
            description={a.desc}
            icon={a.icon}
            accentColor={a.accent}
            blue={COLORS.blue}
            onUse={() => setOpen(a.id)}
          />
        ))}
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/60 p-4 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal
            className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
          >
            <div
              className="flex items-center justify-between gap-3 border-b border-white/15 px-5 py-4 text-white"
              style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.blue})` }}
            >
              <h3 className="text-lg font-semibold">{agents.find((x) => x.id === open)?.title}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-white/90 transition hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid max-h-[calc(92vh-4rem)] gap-4 overflow-y-auto p-5 lg:grid-cols-2">
              <div className="space-y-4">
                {open === "session" && (
                  <>
                    <Input label="Grado" value={sessionForm.grade} onChange={(e) => setSessionForm((p) => ({ ...p, grade: e.target.value }))} />
                    <label className="block text-sm font-medium text-primary/85">
                      Área curricular
                      <select
                        className="mt-1 w-full rounded-xl border border-secondary/20 bg-white px-3 py-2 text-sm text-foreground"
                        value={sessionForm.area}
                        onChange={(e) => setSessionForm((p) => ({ ...p, area: e.target.value }))}
                      >
                        {areas.map((ar) => (
                          <option key={ar} value={ar}>
                            {ar}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input label="Tema" value={sessionForm.topic} onChange={(e) => setSessionForm((p) => ({ ...p, topic: e.target.value }))} required />
                    <Input label="Competencia" value={sessionForm.competence} onChange={(e) => setSessionForm((p) => ({ ...p, competence: e.target.value }))} />
                    <Input label="Capacidad" value={sessionForm.capacity} onChange={(e) => setSessionForm((p) => ({ ...p, capacity: e.target.value }))} />
                    <Input label="Desempeño" value={sessionForm.performance} onChange={(e) => setSessionForm((p) => ({ ...p, performance: e.target.value }))} />
                    <Input label="Duración" value={sessionForm.duration} onChange={(e) => setSessionForm((p) => ({ ...p, duration: e.target.value }))} />
                    <Input label="Propósito" value={sessionForm.purpose} onChange={(e) => setSessionForm((p) => ({ ...p, purpose: e.target.value }))} />
                    <Button variant="primary" disabled={loading} onClick={runSession}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generar sesión"}
                    </Button>
                  </>
                )}

                {open === "performance" && (
                  <>
                    <p className="text-sm text-foreground/70">
                      Se usarán las notas y estudiantes visibles para su rol ({session?.user?.role === Role.ADMIN ? "toda la institución" : "su aula"}).
                    </p>
                    <Button variant="primary" disabled={loading} onClick={runPerformance}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analizar rendimiento"}
                    </Button>
                  </>
                )}

                {open === "alerts" && (
                  <>
                    <p className="text-sm text-foreground/70">
                      Cruza asistencia y notas del contexto actual. Prioridades: alta (rojo), media (dorado), baja (azul suave).
                    </p>
                    <Button variant="danger" disabled={loading} onClick={runAlerts}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generar alertas"}
                    </Button>
                  </>
                )}

                {open === "activities" && (
                  <>
                    <label className="block text-sm font-medium text-primary/85">
                      Área
                      <select
                        className="mt-1 w-full rounded-xl border border-secondary/20 bg-white px-3 py-2 text-sm text-foreground"
                        value={activityForm.area}
                        onChange={(e) => setActivityForm((p) => ({ ...p, area: e.target.value }))}
                      >
                        {areas.map((ar) => (
                          <option key={ar} value={ar}>
                            {ar}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-primary/85">
                      Nivel de logro
                      <select
                        className="mt-1 w-full rounded-xl border border-secondary/20 bg-white px-3 py-2 text-sm text-foreground"
                        value={activityForm.nivelLogro}
                        onChange={(e) => setActivityForm((p) => ({ ...p, nivelLogro: e.target.value as "AD" | "A" | "B" | "C" }))}
                      >
                        {(["AD", "A", "B", "C"] as const).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input
                      label="Dificultad del estudiante"
                      value={activityForm.dificultad}
                      onChange={(e) => setActivityForm((p) => ({ ...p, dificultad: e.target.value }))}
                      placeholder="Ej. alta, lectora incipiente…"
                    />
                    <Button variant="success" disabled={loading} onClick={runActivities}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sugerir actividades"}
                    </Button>
                  </>
                )}

                {open === "assistant" && (
                  <>
                    <p className="text-xs text-foreground/55">
                      Ejemplos: ¿Qué estudiantes están en riesgo? ¿Qué actividades puedo aplicar? ¿Qué estudiantes faltaron más?
                    </p>
                    <label className="block text-sm font-medium text-primary/85">
                      Pregunta
                      <textarea
                        className="mt-1 min-h-[120px] w-full rounded-xl border border-secondary/20 bg-white px-3 py-2 text-sm text-foreground"
                        value={chatQuestion}
                        onChange={(e) => setChatQuestion(e.target.value)}
                        placeholder="Escribe tu consulta…"
                      />
                    </label>
                    <Button variant="primary" disabled={loading} onClick={runAssistant}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Consultar"}
                    </Button>
                  </>
                )}
              </div>

              <AgentResultPanel
                resultText={resultText}
                setResultText={setResultText}
                onCopy={copyResult}
                copyLabel={copyOk ? "Copiado" : "Copiar"}
                showAlertPreview={open === "alerts"}
              >
                <AgentAlertPreview json={resultText} />
              </AgentResultPanel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
