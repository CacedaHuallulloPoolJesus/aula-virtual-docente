import { AppLayout } from "@/components/layout/AppLayout";

export default function MainShellLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
