// ========================================================
// MÓDULO: DETALLE FACTURA (detalle_factura.ts)
// Operaciones CRUD completas para la tabla 'detalle_factura'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const detalleFacturaRouter = new Router();

// 1. GET - Obtener todos los detalles de facturas con datos del servicio
detalleFacturaRouter.get("/", async (ctx) => {
  try {
    const detalles = await query(
      `SELECT df.id_detalle, df.id_factura, df.id_servicio,
              s.descripcion as servicio_descripcion, s.categoria as servicio_categoria,
              df.cantidad, df.tarifa_unitaria, df.importe
       FROM detalle_factura df
       LEFT JOIN servicio s ON df.id_servicio = s.id_servicio
       ORDER BY df.id_detalle ASC`
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: detalles };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle por ID de ítem
detalleFacturaRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      `SELECT df.id_detalle, df.id_factura, df.id_servicio,
              s.descripcion as servicio_descripcion, s.categoria as servicio_categoria,
              df.cantidad, df.tarifa_unitaria, df.importe
       FROM detalle_factura df
       LEFT JOIN servicio s ON df.id_servicio = s.id_servicio
       WHERE df.id_detalle = $1`,
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Detalle de factura con ID ${id} no encontrado`,
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

// 3. POST - Agregar nuevo ítem al detalle de factura
detalleFacturaRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { id_factura, id_servicio, cantidad, tarifa_unitaria, importe } = body;

    if (!id_factura || !id_servicio || cantidad === undefined || tarifa_unitaria === undefined) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "id_factura, id_servicio, cantidad y tarifa_unitaria son campos requeridos",
      };
      return;
    }

    const calcImporte = importe !== undefined ? importe : cantidad * tarifa_unitaria;

    const rows = await query(
      `INSERT INTO detalle_factura (id_factura, id_servicio, cantidad, tarifa_unitaria, importe)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id_factura, id_servicio, cantidad, tarifa_unitaria, calcImporte]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Detalle de factura agregado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar ítem del detalle de factura por ID
detalleFacturaRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const { id_factura, id_servicio, cantidad, tarifa_unitaria, importe } = body;

    const rows = await query(
      `UPDATE detalle_factura
       SET id_factura = COALESCE($1, id_factura),
           id_servicio = COALESCE($2, id_servicio),
           cantidad = COALESCE($3, cantidad),
           tarifa_unitaria = COALESCE($4, tarifa_unitaria),
           importe = COALESCE($5, importe)
       WHERE id_detalle = $6
       RETURNING *`,
      [id_factura, id_servicio, cantidad, tarifa_unitaria, importe, id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Detalle con ID ${id} no encontrado para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Detalle de factura actualizado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar ítem del detalle de factura por ID
detalleFacturaRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM detalle_factura WHERE id_detalle = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Detalle con ID ${id} no encontrado para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Detalle de factura eliminado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default detalleFacturaRouter;
