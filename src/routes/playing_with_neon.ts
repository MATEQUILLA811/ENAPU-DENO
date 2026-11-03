// ========================================================
// MÓDULO: PLAYING WITH NEON (playing_with_neon.ts)
// Operaciones CRUD completas para la tabla 'playing_with_neon'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const playingWithNeonRouter = new Router();

// 1. GET - Obtener todos los registros de prueba Neon
playingWithNeonRouter.get("/", async (ctx) => {
  try {
    const rows = await query(
      "SELECT * FROM playing_with_neon ORDER BY id ASC"
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: rows };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener registro por ID
playingWithNeonRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "SELECT * FROM playing_with_neon WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Registro con ID ${id} no encontrado`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = { success: true, data: rows[0] };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 3. POST - Crear nuevo registro en playing_with_neon
playingWithNeonRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { name, value } = body;

    if (!name) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "El campo name es requerido",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO playing_with_neon (name, value)
       VALUES ($1, $2)
       RETURNING *`,
      [name, value !== undefined ? value : null]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Registro creado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar registro por ID
playingWithNeonRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const { name, value } = body;

    const rows = await query(
      `UPDATE playing_with_neon
       SET name = COALESCE($1, name),
           value = COALESCE($2, value)
       WHERE id = $3
       RETURNING *`,
      [name, value, id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Registro con ID ${id} no encontrado para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Registro actualizado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar registro por ID
playingWithNeonRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM playing_with_neon WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Registro con ID ${id} no encontrado para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Registro eliminado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default playingWithNeonRouter;
