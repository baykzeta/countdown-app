# Estado del proyecto

App de cuentas regresivas basada en Google Calendar. Login con Google OAuth, muestra eventos del calendario como cuentas regresivas en tiempo real, y permite crear, editar y eliminar eventos desde la web.

## Funcionalidades actuales

- Login/logout con Google OAuth
- Eventos desde hoy hasta un año adelante (máx 250)
- Cuenta regresiva en tiempo real (actualiza cada segundo)
- Crear, editar y eliminar eventos via Google Calendar API
- Redirección automática al login cuando el token de Google expira
- Date picker personalizado (react-datepicker) con tema oscuro y botón "Aceptar"
- Manejo de errores en todos los endpoints API

## Links

- Repo: https://github.com/baykzeta/countdown-app
- Producción: https://countdown-app-git-main-baykzetas-projects.vercel.app

## Infraestructura

- Hosting: Vercel — deploy automático en cada push a `main`
- `NEXTAUTH_URL` apunta a la URL de la branch estable
- Redirect URI registrado en Google Cloud Console
- Google OAuth en modo **Testing** — tokens expiran cada 7 días, el usuario hace login de nuevo solo
- Deployment Protection de Vercel desactivado para acceso público
- ~5 usuarios de prueba registrados en Google Console

## Pendiente

### v2
- Mejoras visuales/UI generales

### v3/v4/v5 — Feature Efemérides Chilenas
Sección de días populares chilenos (día del completo, piscola, etc.) como referencia, sin interacción con Google Calendar.

- Ruta `/efemerides` — vista pública, solo lectura, lista agrupada por mes, sin countdown
- Ruta `/admin/efemerides` — CRUD protegido para superusuario
- BD: Vercel Postgres (evita pausa por inactividad del free tier de Supabase)
- Tabla `efemerides`: id, title, month, day, description (opcional)
- No crea eventos en Google Calendar ni tiene countdown

Al retomar: arrancar con setup de Vercel Postgres y el modelo de datos.
