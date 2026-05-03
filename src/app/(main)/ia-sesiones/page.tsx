import { IaSessionForm } from "@/components/forms/IaSessionForm";

export default function IaSesionesPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Sesiones de Aprendizaje con Inteligencia Artificial</h2>
      <p className="text-sm text-foreground/70">
        Genere propuestas pedagógicas estructuradas y revíselas antes de aplicarlas en el aula.
      </p>
      <IaSessionForm />
    </section>
  );
}
