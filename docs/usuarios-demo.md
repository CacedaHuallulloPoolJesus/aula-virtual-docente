# Usuarios y credenciales demo

El login en `/login` valida con **NextAuth** contra la base de datos **Prisma** (`User.password` hasheado con bcrypt). Las contraseñas en texto plano están definidas en un solo lugar: `src/constants/demo-credentials.ts` (aplicadas al seed en `prisma/seed.ts`).

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@virgendelcarmen.edu.pe` | `Admin123*` |
| Docente 1 | `docente1@virgendelcarmen.edu.pe` | `123456` |
| Docente 2 | `docente2@virgendelcarmen.edu.pe` | `123456` |

**Notas**

- La comparación de contraseña distingue **mayúsculas, minúsculas y símbolos** (bcrypt sobre el texto exacto, sin espacios al inicio o final).
- Si el correo no existe: mensaje **«Usuario no encontrado»**.
- Si el correo existe pero la contraseña no coincide: **«Contraseña incorrecta»**.

## Preparar o restablecer la base demo

Si las credenciales anteriores no funcionan, vuelva a cargar los usuarios demo:

```bash
npm run prisma:seed
```

O el flujo completo:

```bash
npm run demo
```
