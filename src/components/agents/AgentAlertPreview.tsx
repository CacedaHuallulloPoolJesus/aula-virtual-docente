"use client";

import { priorityStyles } from "@/lib/agents";

type AlertRow = { id?: string; titulo: string; prioridad: string; descripcion: string };

export function AgentAlertPreview({ json }: { json: string }) {
  let list: AlertRow[] | null = null;
  try {
    const x = JSON.parse(json) as unknown;
    list = Array.isArray(x) ? (x as AlertRow[]) : null;
  } catch {
    list = null;
  }
  if (!list?.length) return null;
  return (
    <div className="max-h-40 space-y-2 overflow-y-auto text-xs">
      {list.map((al, i) => (
        <div key={al.id ?? `${al.titulo}-${i}`} className={`rounded-lg border p-2 ${priorityStyles(al.prioridad as "baja" | "media" | "alta")}`}>
          <p className="font-semibold">{al.titulo}</p>
          <p className="mt-1 opacity-90">{al.descripcion}</p>
        </div>
      ))}
    </div>
  );
}
