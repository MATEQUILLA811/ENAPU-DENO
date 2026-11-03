// Punto de entrada principal del servidor Deno + Oak
import { Application, Router } from "@oak/oak";
import appRoutes from "./routes/app.routes.ts";

const app = new Application();
const PORT = Number(Deno.env.get("PORT")) || 3001;

// Middleware global: CORS
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }
  await next();
});

// Middleware global: Logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[${ctx.request.method}] ${ctx.request.url.pathname} - ${ctx.response.status} (${ms}ms)`);
});

const mainRouter = new Router();

// Ruta de estado / comprobación
mainRouter.get("/", (ctx) => {
  ctx.response.body = {
    sistema: "SIGEP-ENAPU Backend API",
    runtime: "Deno 2 + Oak",
    base_de_datos: "PostgreSQL (Neon Cloud)",
    estado: "Activo",
    modulos_activos: 11,
  };
});

// Montar todas las rutas de los 11 módulos CRUD bajo el prefijo /api
mainRouter.use("/api", appRoutes.routes(), appRoutes.allowedMethods());

app.use(mainRouter.routes());
app.use(mainRouter.allowedMethods());

console.log(`🚀 ENAPU Backend corriendo en http://localhost:${PORT}`);
await app.listen({ port: PORT });
