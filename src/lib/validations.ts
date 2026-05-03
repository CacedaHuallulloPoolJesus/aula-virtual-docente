import { z } from "zod";

/** Credenciales demo (login local). */
export const demoLoginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingrese la contraseña"),
});

export const noteValueSchema = z.number().min(0).max(20);

export const studentCodeSchema = z.string().min(1).max(32);
