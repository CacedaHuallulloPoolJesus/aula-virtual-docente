"use client";

import type { ComponentProps } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui";

type TooltipFormatter = NonNullable<ComponentProps<typeof Tooltip>["formatter"]>;

function firstNumeric(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (Array.isArray(value) && value.length > 0) return firstNumeric(value[0]);
  return null;
}

const tooltipNotas: TooltipFormatter = (value) => {
  const n = firstNumeric(value);
  return [n !== null ? n.toFixed(1) : "—", "Promedio"];
};

const tooltipAsistencia: TooltipFormatter = (value) => {
  const n = firstNumeric(value);
  return [n !== null ? `${n}%` : "—", "Asistencia"];
};

export function PerformanceChart({
  performanceChart,
  attendanceChart,
}: {
  performanceChart: { month: string; promedio: number }[];
  attendanceChart: { week: string; porcentaje: number }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="h-72">
        <h3 className="mb-3 text-sm font-semibold text-primary">Rendimiento académico mensual</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={performanceChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={tooltipNotas} labelFormatter={(label) => `Mes: ${label}`} />
            <Line type="monotone" dataKey="promedio" name="Promedio" stroke="var(--color-secondary)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card className="h-72">
        <h3 className="mb-3 text-sm font-semibold text-primary">Asistencia por semanas (%)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={attendanceChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip formatter={tooltipAsistencia} labelFormatter={(label) => `Semana: ${label}`} />
            <Bar dataKey="porcentaje" name="Porcentaje" fill="#15803d" radius={6} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/** Alias histórico: use `PerformanceChart` en código nuevo. */
export const OverviewCharts = PerformanceChart;
