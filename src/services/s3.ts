// ========================================================
// SERVICIO DE ALMACENAMIENTO S3 (Neon S3 Compatible Storage)
// Manejo de carga, descarga y eliminación de fotos y archivos
// ========================================================
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";

const endpoint =
  Deno.env.get("AWS_ENDPOINT_URL_S3") ||
  "https://br-billowing-pond-b5cxlsp5.storage.c-7.us-east-2.aws.neon.tech";

const accessKeyId =
  Deno.env.get("AWS_ACCESS_KEY_ID") ||
  "nak_live_04b244a28b5a4b6f9e0a8704b8c2f6e8";

const secretAccessKey =
  Deno.env.get("AWS_SECRET_ACCESS_KEY") ||
  "nsk_live_18bf43a4df07d44fca0454502db145c1443afcea4469e8ff43fe962b1b1f0e35";

const region = Deno.env.get("AWS_REGION") || "us-east-2";

export const BUCKET_NAME = Deno.env.get("S3_BUCKET_NAME") || "enapu-files";

export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

// Asegurar que el bucket exista
export async function ensureBucketExists(): Promise<void> {
  try {
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
  } catch {
    // Si ya existe, se omite el error silenciosamente
  }
}

// Subir un buffer / Uint8Array a S3
export async function uploadToS3(
  key: string,
  data: Uint8Array,
  contentType: string
): Promise<{ success: boolean; key: string; directUrl: string }> {
  await ensureBucketExists();

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: data,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const directUrl = `${endpoint}/${BUCKET_NAME}/${key}`;
  return {
    success: true,
    key,
    directUrl,
  };
}

// Descargar un archivo desde S3
export async function getFromS3(
  key: string
): Promise<{ data: Uint8Array; contentType: string } | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    if (!response.Body) return null;

    const byteArray = await response.Body.transformToByteArray();
    return {
      data: byteArray,
      contentType: response.ContentType || "application/octet-stream",
    };
  } catch {
    return null;
  }
}

// Eliminar archivo de S3
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}
