"use client";

import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import AdminDashboardHome from "@/components/dashboard/AdminDashboardHome";
import TeacherDashboardHome from "@/components/dashboard/TeacherDashboardHome";

export default function DashboardPage() {
  const { data } = useSession();
  if (data?.user?.role === Role.ADMIN) return <AdminDashboardHome />;
  return <TeacherDashboardHome />;
}
