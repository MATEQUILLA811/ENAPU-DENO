// ========================================================
// MÓDULO: SERVICIO (servicio.ts)
// Operaciones CRUD completas para la tabla 'servicio'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const servicioRouter = new Router();

// 1. GET - Obtener todos los servicios portuarios
servicioRouter.get("/", async (ctx) => {
  try {
    const servicios = await query(
      "SELECT * FROM servicio ORDER BY id_servicio ASC"
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: servicios };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle de un servicio por ID
servicioRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "SELECT * FROM servicio WHERE id_servicio = $1",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Servicio con ID ${id} no encontrado`,
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

// 3. POST - Crear nuevo servicio portuario
servicioRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { descripcion, categoria, unidad_cobro, tarifa_base } = body;

    if (!descripcion || !categoria || !unidad_cobro || tarifa_base === undefined) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "descripcion, categoria, unidad_cobro y tarifa_base son campos requeridos",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO servicio (descripcion, categoria, unidad_cobro, tarifa_base)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [descripcion, categoria, unidad_cobro, tarifa_base]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Servicio creado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar servicio por ID
servicioRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const { descripcion, categoria, unidad_cobro, tarifa_base } = body;

    const rows = await query(
      `UPDATE servicio
       SET descripcion = COALESCE($1, descripcion),
           categoria = COALESCE($2, categoria),
           unidad_cobro = COALESCE($3, unidad_cobro),
           tarifa_base = COALESCE($4, tarifa_base)
       WHERE id_servicio = $5
       RETURNING *`,
      [descripcion, categoria, unidad_cobro, tarifa_base, id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Servicio con ID ${id} no encontrado para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Servicio actualizado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar servicio por ID
servicioRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM servicio WHERE id_servicio = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Servicio con ID ${id} no encontrado para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Servicio eliminado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default servicioRouter;
