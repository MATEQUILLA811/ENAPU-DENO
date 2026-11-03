// ========================================================
// MÓDULO: ESTADO OPERACIÓN (estado_operacion.ts)
// Operaciones CRUD completas para la tabla 'estado_operacion'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const estadoOperacionRouter = new Router();

// 1. GET - Obtener todos los estados operativos
estadoOperacionRouter.get("/", async (ctx) => {
  try {
    const estados = await query(
      "SELECT * FROM estado_operacion ORDER BY id_estado ASC"
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: estados };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle de estado por ID
estadoOperacionRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "SELECT * FROM estado_operacion WHERE id_estado = $1",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Estado de operación con ID ${id} no encontrado`,
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

// 3. POST - Crear nuevo estado operativo
estadoOperacionRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { nombre, descripcion } = body;

    if (!nombre) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "El campo nombre es requerido",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO estado_operacion (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, descripcion || null]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Estado de operación creado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar estado operativo por ID
estadoOperacionRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const { nombre, descripcion } = body;

    const rows = await query(
      `UPDATE estado_operacion
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion)
       WHERE id_estado = $3
       RETURNING *`,
      [nombre, descripcion, id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Estado de operación con ID ${id} no encontrado para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Estado de operación actualizado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar estado operativo por ID
estadoOperacionRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM estado_operacion WHERE id_estado = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Estado de operación con ID ${id} no encontrado para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Estado de operación eliminado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default estadoOperacionRouter;
