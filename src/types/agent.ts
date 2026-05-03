import type { AppData } from "./app";

export type AgentsDataContext = Pick<AppData, "students" | "grades" | "attendance" | "sessions">;

export type SessionGeneratorInput = {
  grade: string;
  area: string;
  topic: string;
  competence: string;
  capacity: string;
  performance: string;
  duration: string;
  purpose: string;
};

export type SessionGeneratorOutput = {
  inicio: string;
  desarrollo: string;
  cierre: string;
  recursos: string;
  evidencia: string;
  evaluacion: string;
  instrumentoEvaluacion: string;
};

export type PerformanceAnalysisOutput = {
  resumen: string;
  estudiantesEnRiesgo: { codigo: string; nombre: string; promedio: number; area: string }[];
  promedioPorArea: { area: string; promedio: number }[];
  recomendaciones: string[];
};

export type PedagogicalAlert = {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
};

export type ActivityRecommendationOutput = {
  actividades: string[];
  materiales: string[];
  estrategias: string[];
};
