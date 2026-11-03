// middlewares/logger.middleware.ts
// Middleware de log de peticiones
import { Context, Next } from "@oak/oak";

export async function loggerMiddleware(ctx: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(
    `[${new Date().toISOString()}] ${ctx.request.method} ${ctx.request.url.pathname} → ${ctx.response.status} (${ms}ms)`
  );
}
