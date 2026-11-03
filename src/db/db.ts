// db.ts - Conexión centralizada a PostgreSQL (Neon) para Deno
import pg from "pg";
const { Pool } = pg;

const connectionString = Deno.env.get("DATABASE_URL");
if (!connectionString) {
  console.warn("⚠️ Advertencia: No se encontró la variable DATABASE_URL configurada en el entorno.");
}

export const pool = new Pool({
  connectionString: connectionString || "",
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
