"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AppData } from "@/types/app";
import type { AttendanceRecord } from "@/types/attendance";
import type { GradeRecord } from "@/types/grades";
import type { LearningSession } from "@/types/session";
import type { Student } from "@/types/student";
import type { Teacher } from "@/types/teacher";
import type { User } from "@/types/auth";
import { initialMockData } from "@/lib/mock-data";

type AuthState = {
  user: User | null;
};

type AppDataContextType = {
  data: AppData;
  auth: AuthState;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
  addTeacher: (teacher: Omit<Teacher, "id" | "code"> & { password: string }) => void;
  updateTeacher: (id: string, payload: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  addStudent: (student: Omit<Student, "id">) => void;
  updateStudent: (id: string, payload: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  saveAttendanceBatch: (records: AttendanceRecord[]) => void;
  saveGradesBatch: (records: GradeRecord[]) => void;
  addSession: (session: Omit<LearningSession, "id">) => void;
  deleteSession: (id: string) => void;
};

const STORAGE_KEY = "aula-virtual-data";
const AUTH_KEY = "aula-virtual-auth";

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    if (typeof window === "undefined") return initialMockData;
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? (JSON.parse(storedData) as AppData) : initialMockData;
  });
  const [auth, setAuth] = useState<AuthState>(() => {
    if (typeof window === "undefined") return { user: null };
    const storedAuth = localStorage.getItem(AUTH_KEY);
    return { user: storedAuth ? (JSON.parse(storedAuth) as User) : null };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function login(email: string, password: string) {
    const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, message: "Credenciales incorrectas" };
    setAuth({ user });
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return { ok: true };
  }

  function logout() {
    setAuth({ user: null });
    localStorage.removeItem(AUTH_KEY);
  }

  function addTeacher(teacher: Omit<Teacher, "id" | "code"> & { password: string }) {
    setData((prev) => {
      const id = crypto.randomUUID();
      const teacherCode = `DOC-${String(prev.teachers.length + 1).padStart(3, "0")}`;
      const newTeacher: Teacher = { ...teacher, id, code: teacherCode };
      const newUser: User = {
        id: `u-${id}`,
        email: teacher.email,
        password: teacher.password,
        role: "DOCENTE",
        teacherId: id,
      };
      return { ...prev, teachers: [...prev.teachers, newTeacher], users: [...prev.users, newUser] };
    });
  }

  function updateTeacher(id: string, payload: Partial<Teacher>) {
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.map((teacher) => (teacher.id === id ? { ...teacher, ...payload } : teacher)),
    }));
  }

  function deleteTeacher(id: string) {
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((teacher) => teacher.id !== id),
      users: prev.users.filter((user) => user.teacherId !== id),
    }));
  }

  function addStudent(student: Omit<Student, "id">) {
    setData((prev) => ({ ...prev, students: [...prev.students, { ...student, id: crypto.randomUUID() }] }));
  }

  function updateStudent(id: string, payload: Partial<Student>) {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((student) => (student.id === id ? { ...student, ...payload } : student)),
    }));
  }

  function deleteStudent(id: string) {
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((student) => student.id !== id),
      attendance: prev.attendance.filter((item) => item.studentId !== id),
      grades: prev.grades.filter((item) => item.studentId !== id),
    }));
  }

  function saveAttendanceBatch(records: AttendanceRecord[]) {
    setData((prev) => ({ ...prev, attendance: [...prev.attendance, ...records] }));
  }

  function saveGradesBatch(records: GradeRecord[]) {
    setData((prev) => {
      const merged = [...prev.grades];
      for (const item of records) {
        const idx = merged.findIndex((g) => g.studentId === item.studentId && g.area === item.area && g.period === item.period);
        if (idx >= 0) merged[idx] = { ...merged[idx], ...item };
        else merged.push(item);
      }
      return { ...prev, grades: merged };
    });
  }

  function addSession(session: Omit<LearningSession, "id">) {
    setData((prev) => ({ ...prev, sessions: [...prev.sessions, { ...session, id: crypto.randomUUID() }] }));
  }

  function deleteSession(id: string) {
    setData((prev) => ({ ...prev, sessions: prev.sessions.filter((session) => session.id !== id) }));
  }

  const value: AppDataContextType = {
    data,
    auth,
    login,
    logout,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addStudent,
    updateStudent,
    deleteStudent,
    saveAttendanceBatch,
    saveGradesBatch,
    addSession,
    deleteSession,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
}
