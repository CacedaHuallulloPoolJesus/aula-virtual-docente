import { Card } from "@/components/ui";

export function AlertsPanel({ risk, faltas, pendingSessions }: { risk: number; faltas: number; pendingSessions: number }) {
  return (
    <Card>
      <h3 className="mb-3 text-base font-semibold text-primary">Alertas pedagógicas</h3>
      <ul className="space-y-2 text-sm text-foreground/85">
        <li>{risk} estudiantes con bajo rendimiento.</li>
        <li>{faltas} faltas acumuladas en el período analizado.</li>
        <li>{pendingSessions} sesiones pendientes de planificación.</li>
      </ul>
    </Card>
  );
}
