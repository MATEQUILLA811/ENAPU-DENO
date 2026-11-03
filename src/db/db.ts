// db.ts - Conexión centralizada a PostgreSQL (Neon) para Deno
import pg from "pg";
const { Pool } = pg;

const connectionString = Deno.env.get("DATABASE_URL") ||
  "postgresql://neondb_owner:npg_AQpRqaew9Xk6@ep-still-silence-b5xdk8go-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const pool = new Pool({
  connectionString,
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
