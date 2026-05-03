"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui";

export function PerformanceChart({
  performanceChart,
  attendanceChart,
}: {
  performanceChart: { month: string; promedio: number }[];
  attendanceChart: { week: string; porcentaje: number }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="h-72 border-blue-100">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Rendimiento académico mensual</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={performanceChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="promedio" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card className="h-72 border-emerald-100">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Asistencia por semanas (%)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={attendanceChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="porcentaje" fill="#16a34a" radius={6} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/** @deprecated Use `PerformanceChart` — mantenido por compatibilidad con imports antiguos */
export const OverviewCharts = PerformanceChart;
