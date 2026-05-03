/**
 * Datos demo centralizados (localStorage). Tipos en `src/types`.
 */
import { StudentStatus, TeacherStatus } from "@prisma/client";
import type { AppData } from "@/types/app";
import { areas, periods } from "@/constants/academic";

export type {
  Role,
  User,
  Teacher,
  TeacherStatus,
  Student,
  StudentStatus,
  AttendanceRecord,
  AttendanceStatus,
  GradeRecord,
  LearningSession,
  AppData,
} from "@/types";

export { areas, periods };

export const initialMockData: AppData = {
  users: [
    { id: "u-admin", email: "admin@aula.com", password: "123456", role: "ADMIN" },
    { id: "u-doc1", email: "docente1@aula.com", password: "123456", role: "TEACHER", teacherId: "t-1" },
    { id: "u-doc2", email: "docente2@aula.com", password: "123456", role: "TEACHER", teacherId: "t-2" },
  ],
  teachers: [
    {
      id: "t-1",
      code: "DOC-001",
      firstName: "Rosa",
      lastName: "Quispe Huamán",
      email: "docente1@aula.com",
      grade: "1ro Primaria",
      section: "A",
      status: TeacherStatus.ACTIVE,
    },
    {
      id: "t-2",
      code: "DOC-002",
      firstName: "Carlos",
      lastName: "Huanca Salazar",
      email: "docente2@aula.com",
      grade: "2do Primaria",
      section: "B",
      status: TeacherStatus.ACTIVE,
    },
  ],
  students: [
    {
      id: "s-1",
      code: "STD-001",
      firstName: "Juan",
      lastName: "Pérez Huamán",
      dni: "72345678",
      birthDate: "2017-05-12",
      grade: "1ro Primaria",
      section: "A",
      guardian: "Elena Huamán",
      guardianPhone: "987654321",
      address: "Huayucachi Centro",
      status: StudentStatus.ACTIVE,
    },
    {
      id: "s-2",
      code: "STD-002",
      firstName: "María",
      lastName: "Quispe Rojas",
      dni: "73456789",
      birthDate: "2017-10-01",
      grade: "1ro Primaria",
      section: "A",
      guardian: "Luis Quispe",
      guardianPhone: "945612378",
      address: "Anexo Pucará",
      status: StudentStatus.ACTIVE,
    },
    {
      id: "s-3",
      code: "STD-003",
      firstName: "Luis",
      lastName: "Salazar Huanca",
      dni: "74567891",
      birthDate: "2016-08-22",
      grade: "2do Primaria",
      section: "B",
      guardian: "Ana Huanca",
      guardianPhone: "956789123",
      address: "Huancayo",
      status: StudentStatus.ACTIVE,
    },
  ],
  attendance: [
    { id: "a-1", date: "2026-04-28", studentId: "s-1", status: "PRESENTE", teacherId: "t-1" },
    { id: "a-2", date: "2026-04-28", studentId: "s-2", status: "JUSTIFICADO", justification: "Cita médica", teacherId: "t-1" },
    { id: "a-3", date: "2026-04-28", studentId: "s-3", status: "TARDE", teacherId: "t-2" },
  ],
  grades: [
    { id: "g-1", studentId: "s-1", area: "Matemática", period: "I Bimestre", note1: 14, note2: 15, note3: 16 },
    { id: "g-2", studentId: "s-2", area: "Comunicación", period: "I Bimestre", note1: 18, note2: 17, note3: 19 },
    { id: "g-3", studentId: "s-3", area: "Ciencia y Tecnología", period: "I Bimestre", note1: 10, note2: 11, note3: 9 },
  ],
  sessions: [
    {
      id: "ls-1",
      teacherId: "t-1",
      title: "Números naturales hasta 100",
      grade: "1ro Primaria",
      section: "A",
      area: "Matemática",
      competence: "Resuelve problemas de cantidad",
      capacity: "Usa estrategias de cálculo",
      performance: "Representa números naturales en situaciones cotidianas",
      purpose: "Resolver situaciones de conteo y comparación",
      evidence: "Ficha de trabajo resuelta",
      start: "Saberes previos con material concreto",
      development: "Trabajo guiado con resolución de problemas",
      closure: "Socialización de estrategias",
      resources: "Base diez, pizarra, fichas",
      evaluation: "Lista de cotejo",
      date: "2026-04-29",
      duration: "90 minutos",
      generatedByIa: false,
    },
  ],
};
