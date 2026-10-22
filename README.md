# LEXMARCORP IQ

Aplicación de gestión procesal construida con React, Vite, Express, SQLite y Gemini.

## Requisitos

- Node.js compatible con las dependencias del proyecto.
- npm.
- Una clave de Gemini para usar las funciones de IA.

## Configuración local

1. Instala dependencias: `npm install`.
2. Copia `.env.example` como `.env`.
3. Genera un secreto aleatorio para `JWT_SECRET` (mínimo 32 caracteres). Por ejemplo:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Configura `ADMIN_EMAIL` y `ADMIN_PASSWORD` con una cuenta que controles y una contraseña única de al menos 16 caracteres. Si se configuran, la aplicación sincroniza la contraseña y el rol de esa cuenta administrativa en cada arranque.
5. Configura `GEMINI_API_KEY` para habilitar la IA.
6. Mantén `SEED_DEMO_DATA=false` para que un arranque nuevo no invente registros de clientes/casos/gastos. Solo activa `SEED_DEMO_DATA=true` si quieres cargar los datos de demostración incluidos en el código.
7. Inicia el modo desarrollo: `npm run dev`.

**No publiques el archivo `.env` ni compartas sus valores.** No reutilices contraseñas personales.

## Cambios de seguridad en revisión

- El registro público siempre crea usuarios con rol `cliente`; ignora cualquier rol enviado desde el navegador.
- Los endpoints de gestión requieren rol `admin` o `abogado`; los endpoints de administración requieren rol `admin`.
- La cookie de sesión funciona en HTTP local durante desarrollo y usa `Secure` en producción.
- El seeding de un expediente y gastos de ejemplo está desactivado por defecto para evitar insertar registros inesperados en una base vacía.
- `npm run test:security` ejecuta pruebas automatizadas de arranque, sesión, registro, permisos y acceso a clientes en una base temporal aislada.
- La pantalla de inicio de sesión ya no muestra credenciales predeterminadas ni ofrece autocompletado de cuentas administrativas.
- Se retiró la ruta de acceso que simulaba autenticación con Google usando un correo en la URL; no era un flujo OAuth real.
- El servidor requiere un `JWT_SECRET` configurado, aleatorio y de al menos 32 caracteres.
- Las cuentas administrativas iniciales se configuran mediante variables de entorno, no mediante contraseñas incrustadas en el código.

## Importante

Estos cambios aún deben pasar pruebas de compilación y de ejecución. Antes de producción, revisa la base de datos, las sesiones, los permisos de todas las rutas, la configuración HTTPS y la gestión de secretos. Realiza una copia de seguridad de la base de datos antes de cualquier migración.
