"use client";

import type { LucideIcon } from "lucide-react";
import { Button, Card } from "@/components/ui";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  blue: string;
  onUse: () => void;
};

export function AgentCard({ title, description, icon: Icon, accentColor, blue, onUse }: Props) {
  return (
    <Card className="group relative overflow-hidden border-[#0F4C81]/15 bg-white/90 p-0 shadow-md transition hover:shadow-xl">
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${blue})` }} />
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-[#0B1F3A] shadow-inner"
            style={{ borderColor: `${blue}33`, backgroundColor: `#F6E7C199` }}
          >
            <Icon className="h-6 w-6" style={{ color: accentColor }} aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0B1F3A]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>
        <Button className="mt-6 w-full" variant="primary" onClick={onUse}>
          Usar agente
        </Button>
      </div>
    </Card>
  );
}
