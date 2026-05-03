"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Role } from "@prisma/client";

export function useAuth() {
  const { data, status } = useSession();
  return {
    session: data,
    status,
    user: data?.user ?? null,
    isTeacher: data?.user?.role === Role.TEACHER,
    isAdmin: data?.user?.role === Role.ADMIN,
    signIn,
    signOut,
  };
}
