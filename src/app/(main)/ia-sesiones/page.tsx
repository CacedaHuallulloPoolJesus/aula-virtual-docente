import { IaSessionForm } from "@/components/forms/IaSessionForm";

export default function IaSesionesPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Módulo IA de sesiones</h2>
      <p className="text-sm text-slate-600">
        Genera propuestas pedagógicas estructuradas y edítalas antes de su aplicación en aula.
      </p>
      <IaSessionForm />
    </section>
  );
}
