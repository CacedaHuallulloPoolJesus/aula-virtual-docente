/** Áreas curriculares (CNEB primaria) */
export const CURRICULAR_AREAS = [
  "Matemática",
  "Comunicación",
  "Ciencia y Tecnología",
  "Personal Social",
  "Arte y Cultura",
  "Educación Física",
  "Educación Religiosa",
] as const;

/** Alias corto para compatibilidad con código existente */
export const areas = [...CURRICULAR_AREAS] as string[];

export const BIMESTER_PERIODS = ["I Bimestre", "II Bimestre", "III Bimestre", "IV Bimestre"] as const;

export const periods = [...BIMESTER_PERIODS] as string[];

/** Niveles de logro vigesimal (referencia pedagógica) */
export const ACHIEVEMENT_LEVELS = ["AD", "A", "B", "C"] as const;

export type AchievementLevel = (typeof ACHIEVEMENT_LEVELS)[number];

/** Grados y secciones de ejemplo para formularios (extensible desde admin) */
export const SAMPLE_GRADES = ["1ro Primaria", "2do Primaria", "3ro Primaria", "4to Primaria", "5to Primaria", "6to Primaria"] as const;

export const SAMPLE_SECTIONS = ["A", "B", "C", "D"] as const;
