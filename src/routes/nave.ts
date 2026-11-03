// ========================================================
// MÓDULO: NAVE (nave.ts)
// Operaciones CRUD completas para la tabla 'nave'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const naveRouter = new Router();

// 1. GET - Obtener todas las naves con datos del cliente/armador
naveRouter.get("/", async (ctx) => {
  try {
    const naves = await query(
      `SELECT n.id_nave, n.id_cliente, c.razon_social as cliente_nombre,
              n.nombre_nave, n.matricula, n.tipo_nave, n.trb, n.bandera
       FROM nave n
       LEFT JOIN cliente c ON n.id_cliente = c.id_cliente
       ORDER BY n.id_nave ASC`
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: naves };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle de nave por ID
naveRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      `SELECT n.id_nave, n.id_cliente, c.razon_social as cliente_nombre,
              n.nombre_nave, n.matricula, n.tipo_nave, n.trb, n.bandera
       FROM nave n
       LEFT JOIN cliente c ON n.id_cliente = c.id_cliente
       WHERE n.id_nave = $1`,
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Nave con ID ${id} no encontrada`,
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

// 3. POST - Registrar una nueva nave
naveRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { id_cliente, nombre_nave, matricula, tipo_nave, trb, bandera } = body;

    if (!nombre_nave || !matricula || !tipo_nave || trb === undefined || !bandera) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "nombre_nave, matricula, tipo_nave, trb y bandera son campos requeridos",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO nave (id_cliente, nombre_nave, matricula, tipo_nave, trb, bandera)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_cliente || null, nombre_nave, matricula, tipo_nave, trb, bandera]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Nave registrada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar nave por ID
naveRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const { id_cliente, nombre_nave, matricula, tipo_nave, trb, bandera } = body;

    const rows = await query(
      `UPDATE nave
       SET id_cliente = COALESCE($1, id_cliente),
           nombre_nave = COALESCE($2, nombre_nave),
           matricula = COALESCE($3, matricula),
           tipo_nave = COALESCE($4, tipo_nave),
           trb = COALESCE($5, trb),
           bandera = COALESCE($6, bandera)
       WHERE id_nave = $7
       RETURNING *`,
      [id_cliente, nombre_nave, matricula, tipo_nave, trb, bandera, id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Nave con ID ${id} no encontrada para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Nave actualizada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar nave por ID
naveRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM nave WHERE id_nave = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Nave con ID ${id} no encontrada para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Nave eliminada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default naveRouter;
