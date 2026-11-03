// ========================================================
// MÓDULO: FACTURA (factura.ts)
// Operaciones CRUD completas para la tabla 'factura'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const facturaRouter = new Router();

// 1. GET - Obtener todas las facturas con datos del cliente y operación
facturaRouter.get("/", async (ctx) => {
  try {
    const facturas = await query(
      `SELECT f.id_factura,
              f.id_operacion,
              f.id_cliente, c.razon_social as cliente_nombre, c.ruc as cliente_ruc,
              f.serie_numero, f.fecha_emision, f.moneda,
              f.subtotal, f.igv, f.total, f.estado_cobranza
       FROM factura f
       LEFT JOIN cliente c ON f.id_cliente = c.id_cliente
       ORDER BY f.id_factura DESC`
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: facturas };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle de factura con sus líneas de detalle_factura
facturaRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const facturas = await query(
      `SELECT f.id_factura,
              f.id_operacion,
              f.id_cliente, c.razon_social as cliente_nombre, c.ruc as cliente_ruc,
              f.serie_numero, f.fecha_emision, f.moneda,
              f.subtotal, f.igv, f.total, f.estado_cobranza
       FROM factura f
       LEFT JOIN cliente c ON f.id_cliente = c.id_cliente
       WHERE f.id_factura = $1`,
      [id]
    );

    if (facturas.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Factura con ID ${id} no encontrada`,
      };
      return;
    }

    const items = await query(
      `SELECT df.id_detalle, df.id_servicio, s.descripcion as servicio_descripcion,
              df.cantidad, df.tarifa_unitaria, df.importe
       FROM detalle_factura df
       LEFT JOIN servicio s ON df.id_servicio = s.id_servicio
       WHERE df.id_factura = $1
       ORDER BY df.id_detalle ASC`,
      [id]
    );

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      data: {
        ...facturas[0],
        detalles: items,
      },
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 3. POST - Crear nueva factura
facturaRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const {
      id_operacion,
      id_cliente,
      serie_numero,
      fecha_emision,
      moneda,
      subtotal,
      igv,
      total,
      estado_cobranza,
    } = body;

    if (!id_cliente || !serie_numero || subtotal === undefined || total === undefined) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "id_cliente, serie_numero, subtotal y total son campos requeridos",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO factura
       (id_operacion, id_cliente, serie_numero, fecha_emision, moneda, subtotal, igv, total, estado_cobranza)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id_operacion || null,
        id_cliente,
        serie_numero,
        fecha_emision || new Date().toISOString(),
        moneda || "PEN",
        subtotal,
        igv || 0.0,
        total,
        estado_cobranza || "Pendiente",
      ]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Factura creada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar factura por ID
facturaRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const {
      id_operacion,
      id_cliente,
      serie_numero,
      fecha_emision,
      moneda,
      subtotal,
      igv,
      total,
      estado_cobranza,
    } = body;

    const rows = await query(
      `UPDATE factura
       SET id_operacion = COALESCE($1, id_operacion),
           id_cliente = COALESCE($2, id_cliente),
           serie_numero = COALESCE($3, serie_numero),
           fecha_emision = COALESCE($4, fecha_emision),
           moneda = COALESCE($5, moneda),
           subtotal = COALESCE($6, subtotal),
           igv = COALESCE($7, igv),
           total = COALESCE($8, total),
           estado_cobranza = COALESCE($9, estado_cobranza)
       WHERE id_factura = $10
       RETURNING *`,
      [
        id_operacion,
        id_cliente,
        serie_numero,
        fecha_emision,
        moneda,
        subtotal,
        igv,
        total,
        estado_cobranza,
        id,
      ]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Factura con ID ${id} no encontrada para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Factura actualizada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar factura por ID
facturaRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM factura WHERE id_factura = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Factura con ID ${id} no encontrada para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Factura eliminada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default facturaRouter;
