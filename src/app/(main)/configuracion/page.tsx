import { Card } from "@/components/ui";

export default function ConfiguracionPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Configuración</h2>
      <Card className="space-y-2 text-slate-700">
        <p>Panel preparado para ajustes institucionales:</p>
        <ul className="list-disc pl-6 text-sm">
          <li>Periodos académicos y bimestres.</li>
          <li>Parámetros de evaluación y escalas.</li>
          <li>Integración futura con Prisma/API.</li>
        </ul>
      </Card>
    </section>
  );
}
