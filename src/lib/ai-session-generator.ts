type SessionInput = {
  grade: string;
  area: string;
  topic: string;
  competence: string;
  duration: string;
  purpose: string;
};

export async function generateLearningSession(input: SessionInput) {
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;

  if (apiUrl && apiKey) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(input),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // fallback below
    }
  }

  return {
    title: `Sesion de ${input.area}: ${input.topic}`,
    grade: input.grade,
    area: input.area,
    competence: input.competence,
    capacity: "Resuelve situaciones de aprendizaje mediante estrategias activas.",
    performance: "Participa, argumenta y aplica conocimientos en actividades colaborativas.",
    learningPurpose: input.purpose,
    learningEvidence: "Producto grupal y participacion en plenaria.",
    startActivity: "Dinámica de activación de saberes previos y presentación del reto.",
    development: `Trabajo guiado sobre ${input.topic} con actividades diferenciadas durante ${input.duration}.`,
    closure: "Socialización de resultados, metacognición y compromisos.",
    resources: "Pizarra, fichas de trabajo, material concreto y recursos digitales.",
    evaluation: "Lista de cotejo y observación directa con retroalimentación formativa.",
    date: new Date().toISOString(),
  };
}
