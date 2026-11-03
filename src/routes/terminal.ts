// ========================================================
// MÓDULO: TERMINAL (terminal.ts)
// Operaciones CRUD completas para la tabla 'terminal'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const terminalRouter = new Router();

// 1. GET - Obtener todos los terminales portuarios
terminalRouter.get("/", async (ctx) => {
  try {
    const terminales = await query(
      "SELECT * FROM terminal ORDER BY id_terminal ASC"
    );
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      data: terminales,
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle de un terminal por ID
terminalRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "SELECT * FROM terminal WHERE id_terminal = $1",
      [id]
    );
    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Terminal con ID ${id} no encontrado`,
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

// 3. POST - Crear un nuevo terminal portuario
terminalRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { nombre, departamento, tipo_via, num_muelles, estado } = body;

    if (!nombre || !departamento || !tipo_via) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "nombre, departamento y tipo_via son campos requeridos",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO terminal (nombre, departamento, tipo_via, num_muelles, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        nombre,
        departamento,
        tipo_via,
        num_muelles || 1,
        estado || "Activo",
      ]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Terminal creado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar un terminal portuario existente
terminalRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const { nombre, departamento, tipo_via, num_muelles, estado } = body;

    const rows = await query(
      `UPDATE terminal
       SET nombre = COALESCE($1, nombre),
           departamento = COALESCE($2, departamento),
           tipo_via = COALESCE($3, tipo_via),
           num_muelles = COALESCE($4, num_muelles),
           estado = COALESCE($5, estado)
       WHERE id_terminal = $6
       RETURNING *`,
      [nombre, departamento, tipo_via, num_muelles, estado, id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Terminal con ID ${id} no encontrado para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Terminal actualizado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar un terminal portuario
terminalRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM terminal WHERE id_terminal = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Terminal con ID ${id} no encontrado para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Terminal eliminado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default terminalRouter;
