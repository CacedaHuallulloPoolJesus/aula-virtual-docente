import type { User } from "./auth";
import type { Teacher } from "./teacher";
import type { Student } from "./student";
import type { AttendanceRecord } from "./attendance";
import type { GradeRecord } from "./grades";
import type { LearningSession } from "./session";

export type AppData = {
  users: User[];
  teachers: Teacher[];
  students: Student[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  sessions: LearningSession[];
};
