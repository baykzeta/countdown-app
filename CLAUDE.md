# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

- **Next.js 16** (App Router) con **React 19** y **TypeScript**
- **NextAuth v4** — autenticación Google OAuth
- **googleapis / @googleapis/calendar** — integración con Google Calendar
- **Tailwind CSS v4** — estilos (sin `tailwind.config.js`)
- **react-datepicker** — selector de fecha/hora personalizado

## Comandos principales

```bash
npm run dev      # Servidor de desarrollo en localhost:3000
npm run build    # Build de producción
npm run lint     # Linter ESLint
```

No hay tests automatizados en este proyecto.

## Variables de entorno requeridas

Crear un archivo `.env.local` con:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## Arquitectura

App Next.js (App Router) que muestra cuentas regresivas de eventos de Google Calendar del usuario autenticado.

**Flujo de autenticación:**
- NextAuth v4 con proveedor Google OAuth, configurado en `lib/authOptions.ts`
- El `accessToken` de Google se persiste en el JWT y se expone en la sesión (`types/next-auth.d.ts`)
- El token llega como prop desde el Server Component `app/page.tsx` hasta el Client Component `CountdownList`

**API de eventos (`app/api/eventos/route.ts`):**
- `GET` — lista eventos del calendario primario del usuario (próximos 12 meses)
- `POST` — crea un evento (duración fija de 1 hora)
- `PATCH` — edita summary y fecha de un evento existente
- `DELETE` — elimina un evento
- Todas las operaciones usan el `accessToken` del cliente directamente con `googleapis`; no hay capa de base de datos propia

**Componentes principales:**
- `CountdownList` — Client Component que hace polling al API, actualiza el contador cada segundo con `setInterval`, y maneja edición/eliminación inline
- `CrearEvento` — formulario para crear nuevos eventos
- `DateTimePicker` — wrapper sobre `react-datepicker` con estilos propios (Tailwind v4)

**Estilos:**
- Tailwind CSS v4 (via `@tailwindcss/postcss`), configuración distinta a v3 — no hay `tailwind.config.js`
- Tema oscuro (`bg-gray-950`) como base
