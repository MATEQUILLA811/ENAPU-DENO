// ========================================================
// RUTA: upload.ts
// Subida y visualización de archivos y fotos de perfil con Neon S3
// ========================================================
import { Router, Context } from "@oak/oak";
import { uploadToS3, getFromS3, deleteFromS3 } from "../services/s3.ts";
import { query } from "../db/db.ts";

const router = new Router();

// Función auxiliar para decodificar base64 a Uint8Array
function parseBase64(base64String: string): { data: Uint8Array; contentType: string; extension: string } {
  let contentType = "image/png";
  let extension = "png";
  let pureBase64 = base64String;

  if (base64String.startsWith("data:")) {
    const parts = base64String.split(",");
    const meta = parts[0];
    pureBase64 = parts[1];

    const mimeMatch = meta.match(/:(.*?);/);
    if (mimeMatch && mimeMatch[1]) {
      contentType = mimeMatch[1];
      if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = "jpg";
      else if (contentType.includes("webp")) extension = "webp";
      else if (contentType.includes("gif")) extension = "gif";
      else if (contentType.includes("pdf")) extension = "pdf";
      else extension = "png";
    }
  }

  const binaryString = atob(pureBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return { data: bytes, contentType, extension };
}

// 1. POST /api/upload -> Subir archivo genérico a S3
router.post("/", async (ctx: Context) => {
  try {
    const body = await ctx.request.body.json();
    const { base64, filename, folder = "general" } = body;

    if (!base64) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, message: "Se requiere el campo 'base64'" };
      return;
    }

    const { data, contentType, extension } = parseBase64(base64);
    const safeFilename = filename
      ? `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      : `${Date.now()}.${extension}`;

    const key = `${folder}/${safeFilename}`;
    const result = await uploadToS3(key, data, contentType);

    // URL pública servida a través del backend o directa
    const serverUrl = `${ctx.request.url.origin}/api/upload/file/${key}`;

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Archivo subido exitosamente a Neon S3",
      url: serverUrl,
      directUrl: result.directUrl,
      key,
    };
  } catch (err: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: `Error al subir archivo a S3: ${err.message}`,
    };
  }
});

// 2. POST /api/upload/avatar/:id_usuario -> Subir foto de perfil de usuario
router.post("/avatar/:id_usuario", async (ctx: Context) => {
  try {
    const idUsuario = ctx.params.id_usuario;
    const body = await ctx.request.body.json();
    const { base64, filename } = body;

    if (!base64) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, message: "Se requiere la imagen en base64" };
      return;
    }

    const { data, contentType, extension } = parseBase64(base64);
    const key = `avatars/user-${idUsuario}-${Date.now()}.${extension}`;
    const result = await uploadToS3(key, data, contentType);

    const publicUrl = `${ctx.request.url.origin}/api/upload/file/${key}`;

    // Actualizar foto_url en la tabla usuario de PostgreSQL
    try {
      await query(
        "ALTER TABLE usuario ADD COLUMN IF NOT EXISTS foto_url TEXT"
      );
      await query(
        "UPDATE usuario SET foto_url = $1 WHERE id_usuario = $2",
        [publicUrl, idUsuario]
      );
    } catch (dbErr) {
      console.warn("Nota al actualizar foto_url en DB:", dbErr);
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Foto de perfil subida y guardada en S3",
      url: publicUrl,
      directUrl: result.directUrl,
      key,
    };
  } catch (err: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: `Error al subir foto de perfil: ${err.message}`,
    };
  }
});

// 3. GET /api/upload/file/:folder/:filename -> Servir archivo desde S3
router.get("/file/:folder/:filename", async (ctx: Context) => {
  try {
    const { folder, filename } = ctx.params;
    const key = `${folder}/${filename}`;

    const file = await getFromS3(key);
    if (!file) {
      ctx.response.status = 404;
      ctx.response.body = { success: false, message: "Archivo no encontrado en S3" };
      return;
    }

    ctx.response.headers.set("Content-Type", file.contentType);
    ctx.response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    ctx.response.body = file.data;
  } catch (err: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, message: err.message };
  }
});

export default router;
