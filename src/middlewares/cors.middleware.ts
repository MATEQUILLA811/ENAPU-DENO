// middlewares/cors.middleware.ts
// Middleware CORS reutilizable
import { Context, Next } from "@oak/oak";

export async function corsMiddleware(ctx: Context, next: Next) {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }
  await next();
}
