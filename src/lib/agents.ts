/**
 * Agentes inteligentes — lógica local simulada.
 * Preparado para conectar con API externa: establecer process.env.NEXT_PUBLIC_AI_API_URL y enviar el payload.
 */
import { AttendanceStatus } from "@prisma/client";
import type {
  ActivityRecommendationOutput,
  AgentsDataContext,
  PedagogicalAlert,
  PerformanceAnalysisOutput,
  SessionGeneratorInput,
  SessionGeneratorOutput,
} from "@/types/agent";
import type { GradeRecord } from "@/types/grades";
import type { Student } from "@/types/student";

export type {
  ActivityRecommendationOutput,
  AgentsDataContext,
  PedagogicalAlert,
  PerformanceAnalysisOutput,
  SessionGeneratorInput,
  SessionGeneratorOutput,
} from "@/types/agent";

const AI_API_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_AI_API_URL : undefined;

async function tryExternalAi<T>(path: string, body: unknown): Promise<T | null> {
  if (!AI_API_URL) return null;
  try {
    const res = await fetch(`${AI_API_URL.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function studentName(s: Student) {
  return `${s.firstName} ${s.lastName}`;
}

function promedioNotas(g: GradeRecord) {
  return (g.note1 + g.note2 + g.note3) / 3;
}

function isAbsentStatus(status: string) {
  return status === "FALTA" || status === AttendanceStatus.ABSENT;
}

function isLateStatus(status: string) {
  return status === "TARDE" || status === AttendanceStatus.LATE;
}

/** Agente 1: Generador de sesiones de aprendizaje */
export async function generateLearningSession(input: SessionGeneratorInput): Promise<SessionGeneratorOutput> {
  const remote = await tryExternalAi<SessionGeneratorOutput>("/agents/session", input);
  if (remote) return remote;

  return {
    inicio: `Motivación breve sobre "${input.topic}" con preguntas disparadoras y material concreto relacionado con ${input.area}. Activación de saberes previos vinculados a la competencia: ${input.competence}.`,
    desarrollo: `Durante ${input.duration}, los estudiantes trabajan en el tema "${input.topic}" mediante secuencia didáctica guiada: (1) modelado docente, (2) práctica guiada en parejas, (3) práctica independiente con rúbrica. Se articula la capacidad "${input.capacity}" y el desempeño "${input.performance}".`,
    cierre: `Socialización de aprendizajes, metacognición sobre lo aprendido y compromisos para la siguiente sesión. Retroalimentación formativa alineada al propósito: ${input.purpose}.`,
    recursos: `Pizarra digital o tradicional, fichas de trabajo, material concreto según el área ${input.area}, y recurso audiovisual corto para reforzar el tema.`,
    evidencia: `Ficha resuelta individual o grupal, registro fotográfico de producto y participación en plenaria con criterios de desempeño visibles.`,
    evaluacion: `Evaluación formativa continua con lista de cotejo y observación directa durante la práctica guiada e independiente.`,
    instrumentoEvaluacion: `Lista de cotejo analítica + rúbrica de desempeño (escala 4 niveles) alineada a la competencia y capacidad declaradas.`,
  };
}

/** Agente 2: Analizador de rendimiento académico */
export async function analyzeAcademicPerformance(ctx: AgentsDataContext): Promise<PerformanceAnalysisOutput> {
  const remote = await tryExternalAi<PerformanceAnalysisOutput>("/agents/performance", ctx);
  if (remote) return remote;

  const byStudent = new Map<string, { sum: number; count: number; areas: Set<string> }>();
  for (const g of ctx.grades) {
    const p = promedioNotas(g);
    const cur = byStudent.get(g.studentId) ?? { sum: 0, count: 0, areas: new Set<string>() };
    cur.sum += p;
    cur.count += 1;
    cur.areas.add(g.area);
    byStudent.set(g.studentId, cur);
  }

  const estudiantesEnRiesgo: PerformanceAnalysisOutput["estudiantesEnRiesgo"] = [];
  for (const [studentId, agg] of byStudent) {
    const avg = agg.sum / agg.count;
    if (avg < 11) {
      const s = ctx.students.find((x) => x.id === studentId);
      const gradesOf = ctx.grades.filter((x) => x.studentId === studentId);
      const worst = gradesOf.reduce<{ area: string; p: number } | null>((acc, g) => {
        const p = promedioNotas(g);
        if (!acc || p < acc.p) return { area: g.area, p };
        return acc;
      }, null);
      estudiantesEnRiesgo.push({
        codigo: s?.code ?? studentId,
        nombre: s ? studentName(s) : "Desconocido",
        promedio: Number(avg.toFixed(1)),
        area: worst?.area ?? "—",
      });
    }
  }

  const areaMap = new Map<string, { sum: number; count: number }>();
  for (const g of ctx.grades) {
    const p = promedioNotas(g);
    const a = areaMap.get(g.area) ?? { sum: 0, count: 0 };
    a.sum += p;
    a.count += 1;
    areaMap.set(g.area, a);
  }
  const promedioPorArea = [...areaMap.entries()].map(([area, v]) => ({
    area,
    promedio: Number((v.sum / v.count).toFixed(1)),
  }));

  const areaMasBaja = promedioPorArea.sort((a, b) => a.promedio - b.promedio)[0];

  return {
    resumen: `Se analizaron ${ctx.grades.length} registros de evaluación de ${ctx.students.length} estudiantes. El promedio global aproximado es ${
      ctx.grades.length
        ? (
            ctx.grades.reduce((acc, g) => acc + promedioNotas(g), 0) / ctx.grades.length
          ).toFixed(1)
        : "N/D"
    }. ${areaMasBaja ? `El área con mayor dificultad relativa es ${areaMasBaja.area} (${areaMasBaja.promedio}).` : ""}`,
    estudiantesEnRiesgo,
    promedioPorArea,
    recomendaciones: [
      "Planificar sesiones de refuerzo diferenciadas para estudiantes con promedio menor a 11.",
      areaMasBaja ? `Reforzar estrategias metodológicas en ${areaMasBaja.area} con material concreto y evaluación formativa frecuente.` : "Mantener seguimiento formativo por áreas.",
      "Convocar a apoderados de estudiantes en riesgo para acuerdos de apoyo y tutoría.",
    ],
  };
}

/** Agente 3: Alertas pedagógicas (asistencia + notas) */
export async function generatePedagogicalAlerts(ctx: AgentsDataContext): Promise<PedagogicalAlert[]> {
  const remote = await tryExternalAi<PedagogicalAlert[]>("/agents/alerts", ctx);
  if (remote) return remote;

  const alerts: PedagogicalAlert[] = [];
  const faltasPorEstudiante = new Map<string, number>();
  const tardanzasPorEstudiante = new Map<string, number>();

  for (const a of ctx.attendance) {
    if (isAbsentStatus(a.status)) faltasPorEstudiante.set(a.studentId, (faltasPorEstudiante.get(a.studentId) ?? 0) + 1);
    if (isLateStatus(a.status)) tardanzasPorEstudiante.set(a.studentId, (tardanzasPorEstudiante.get(a.studentId) ?? 0) + 1);
  }

  for (const [studentId, count] of faltasPorEstudiante) {
    if (count >= 2) {
      const s = ctx.students.find((x) => x.id === studentId);
      alerts.push({
        id: `falta-${studentId}`,
        titulo: "Faltas frecuentes",
        descripcion: `${s ? studentName(s) : "Estudiante"} acumula ${count} faltas registradas. Se recomienda entrevista y seguimiento.`,
        prioridad: count >= 4 ? "alta" : "media",
      });
    }
  }

  for (const g of ctx.grades) {
    const p = promedioNotas(g);
    if (p < 11) {
      const s = ctx.students.find((x) => x.id === g.studentId);
      alerts.push({
        id: `bajo-${g.id}`,
        titulo: "Bajo promedio",
        descripcion: `${s ? studentName(s) : "Estudiante"} en ${g.area}: promedio ${p.toFixed(1)}. Riesgo académico.`,
        prioridad: p < 8 ? "alta" : "media",
      });
    }
  }

  for (const [studentId, t] of tardanzasPorEstudiante) {
    if (t >= 3) {
      const s = ctx.students.find((x) => x.id === studentId);
      alerts.push({
        id: `tarde-${studentId}`,
        titulo: "Tardanzas acumuladas",
        descripcion: `${s ? studentName(s) : "Estudiante"} con ${t} tardanzas. Revisar causas y acuerdos con familia.`,
        prioridad: "baja",
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "ok-general",
      titulo: "Sin alertas críticas",
      descripcion: "No se detectaron patrones graves de inasistencia o bajo rendimiento con los datos actuales. Mantenga el monitoreo habitual.",
      prioridad: "baja",
    });
  }

  return alerts;
}

/** Agente 4: Recomendador de actividades */
export async function recommendActivities(input: {
  area: string;
  nivelLogro: "AD" | "A" | "B" | "C";
  dificultad: string;
}): Promise<ActivityRecommendationOutput> {
  const remote = await tryExternalAi<ActivityRecommendationOutput>("/agents/activities", input);
  if (remote) return remote;

  const base = {
    AD: {
      actividades: [`Proyecto de investigación breve en ${input.area}`, "Juego de roles con rúbrica de autoevaluación", "Exposición peer tutoring"],
      materiales: ["Fichas avanzadas", "TIC educativas", "Rúbricas de alto nivel"],
      estrategias: ["Aprendizaje basado en problemas", "Tutoría entre pares", "Metacognición guiada"],
    },
    A: {
      actividades: [`Resolución de problemas contextualizados en ${input.area}`, "Trabajo colaborativo con roles rotativos"],
      materiales: ["Material concreto", "Pizarra", "Fichas graduadas"],
      estrategias: ["Modelado gradual", "Práctica distribuida", "Retroalimentación inmediata"],
    },
    B: {
      actividades: [`Ejercicios guiados paso a paso en ${input.area}`, "Manipulación de material concreto en parejas"],
      materiales: ["Bases diez", "Tarjetas de apoyo", "Secuencias visuales"],
      estrategias: ["Andamiaje", "Descomposición de tareas", "Refuerzo positivo"],
    },
    C: {
      actividades: [`Recuperación de saberes previos en ${input.area} con material manipulativo`, "Lectura guiada con preguntas explícitas"],
      materiales: ["Material concreto abundante", "Imágenes grandes", "Fichas con pistas"],
      estrategias: ["Enseñanza explícita", "Microenseñanzas cortas", "Evaluación formativa diaria"],
    },
  }[input.nivelLogro];

  return {
    actividades: base.actividades.map((a) => `${a} (nivel de dificultad declarado: ${input.dificultad}).`),
    materiales: base.materiales,
    estrategias: base.estrategias,
  };
}

/** Agente 5: Asistente docente (respuestas simuladas coherentes con datos) */
export async function teacherAssistantResponse(
  question: string,
  ctx: AgentsDataContext,
): Promise<string> {
  const q = question.toLowerCase().trim();
  const remote = await tryExternalAi<{ answer: string }>("/agents/assistant", { question, ctx });
  if (remote?.answer) return remote.answer;

  if (q.includes("riesgo") || q.includes("bajo rendimiento")) {
    const out = await analyzeAcademicPerformance(ctx);
    if (!out.estudiantesEnRiesgo.length) return "Con los datos actuales no hay estudiantes identificados bajo el umbral de riesgo (promedio < 11).";
    return `Estudiantes en riesgo (${out.estudiantesEnRiesgo.length}): ${out.estudiantesEnRiesgo.map((e) => `${e.nombre} (${e.codigo}) promedio ${e.promedio} en ${e.area}`).join("; ")}.`;
  }

  if (q.includes("actividad") || q.includes("refuerzo")) {
    const rec = await recommendActivities({ area: "Comunicación", nivelLogro: "B", dificultad: "media" });
    return `Sugerencias: ${rec.actividades.join(" ")} Materiales: ${rec.materiales.join(", ")}.`;
  }

  if (q.includes("sesión") && q.includes("comunicación")) {
    const ses = await generateLearningSession({
      grade: "3ro Primaria",
      area: "Comunicación",
      topic: "Comprensión lectora",
      competence: "Lee diversos tipos de textos",
      capacity: "Infiere información",
      performance: "Interpreta textos",
      duration: "90 minutos",
      purpose: "Comprender mensaje implícito",
    });
    return `Propuesta breve de sesión Comunicación: Inicio: ${ses.inicio.slice(0, 120)}... Desarrollo: ${ses.desarrollo.slice(0, 120)}...`;
  }

  if (q.includes("falt") || q.includes("asistencia")) {
    const counts = new Map<string, number>();
    for (const a of ctx.attendance) {
      if (isAbsentStatus(a.status)) counts.set(a.studentId, (counts.get(a.studentId) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (!top.length) return "No hay registros de faltas en los datos actuales.";
    return `Estudiantes con más faltas: ${top
      .map(([id, n]) => {
        const s = ctx.students.find((x) => x.id === id);
        return `${s ? studentName(s) : id}: ${n} falta(s)`;
      })
      .join("; ")}.`;
  }

  return "Puedo ayudarte con: estudiantes en riesgo, actividades de refuerzo, sesiones sugeridas o resumen de faltas. Reformula tu pregunta con más detalle o elige un agente especializado arriba.";
}

export function priorityStyles(p: PedagogicalAlert["prioridad"]) {
  if (p === "alta") return "border-[#D62828]/40 bg-[#D62828]/10 text-[#0B1F3A]";
  if (p === "media") return "border-[#F2B705]/50 bg-[#F6E7C1]/60 text-[#0B1F3A]";
  return "border-[#0F4C81]/30 bg-[#0F4C81]/5 text-[#0B1F3A]";
}
