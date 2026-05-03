export type GradeStudentRow = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  gradeId: string;
  sectionId: string;
};

export type GradeRecord = {
  id: string;
  studentId: string;
  area: string;
  period: string;
  note1: number;
  note2: number;
  note3: number;
};

export type GradeRow = {
  student: GradeStudentRow;
  values: { note1: number; note2: number; note3: number };
  promedio: number;
  nivel: string;
  riesgo: boolean;
};
