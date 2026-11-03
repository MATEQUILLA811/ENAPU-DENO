// ========================================================
// MÓDULO: OPERACIÓN PORTUARIA (operacion_portuaria.ts)
// Operaciones CRUD completas para la tabla central 'operacion_portuaria'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const operacionPortuariaRouter = new Router();

// 1. GET - Obtener todas las operaciones portuarias con datos relacionados
operacionPortuariaRouter.get("/", async (ctx) => {
  try {
    const operaciones = await query(
      `SELECT op.id_operacion,
              op.id_terminal, t.nombre as terminal_nombre,
              op.id_nave, n.nombre_nave, n.tipo_nave,
              op.id_cliente, c.razon_social as cliente_nombre,
              op.id_tipo_carga, tc.descripcion as tipo_carga_nombre,
              op.id_estado, eo.nombre as estado_nombre,
              op.id_usuario, u.nombres_apellidos as usuario_nombre,
              op.tipo_operacion, op.muelle,
              op.fecha_arribo, op.fecha_atraque, op.fecha_zarpe,
              op.toneladas, op.observaciones
       FROM operacion_portuaria op
       LEFT JOIN terminal t ON op.id_terminal = t.id_terminal
       LEFT JOIN nave n ON op.id_nave = n.id_nave
       LEFT JOIN cliente c ON op.id_cliente = c.id_cliente
       LEFT JOIN tipo_carga tc ON op.id_tipo_carga = tc.id_tipo_carga
       LEFT JOIN estado_operacion eo ON op.id_estado = eo.id_estado
       LEFT JOIN usuario u ON op.id_usuario = u.id_usuario
       ORDER BY op.id_operacion DESC`
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: operaciones };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle completo de una operación por ID
operacionPortuariaRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      `SELECT op.id_operacion,
              op.id_terminal, t.nombre as terminal_nombre,
              op.id_nave, n.nombre_nave, n.matricula, n.tipo_nave, n.bandera,
              op.id_cliente, c.razon_social as cliente_nombre, c.ruc as cliente_ruc,
              op.id_tipo_carga, tc.descripcion as tipo_carga_nombre, tc.unidad_medida,
              op.id_estado, eo.nombre as estado_nombre,
              op.id_usuario, u.nombres_apellidos as usuario_nombre,
              op.tipo_operacion, op.muelle,
              op.fecha_arribo, op.fecha_atraque, op.fecha_zarpe,
              op.toneladas, op.observaciones
       FROM operacion_portuaria op
       LEFT JOIN terminal t ON op.id_terminal = t.id_terminal
       LEFT JOIN nave n ON op.id_nave = n.id_nave
       LEFT JOIN cliente c ON op.id_cliente = c.id_cliente
       LEFT JOIN tipo_carga tc ON op.id_tipo_carga = tc.id_tipo_carga
       LEFT JOIN estado_operacion eo ON op.id_estado = eo.id_estado
       LEFT JOIN usuario u ON op.id_usuario = u.id_usuario
       WHERE op.id_operacion = $1`,
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Operación portuaria con ID ${id} no encontrada`,
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

// 3. POST - Registrar nueva operación portuaria
operacionPortuariaRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const {
      id_terminal,
      id_nave,
      id_cliente,
      id_tipo_carga,
      id_estado,
      id_usuario,
      tipo_operacion,
      muelle,
      fecha_arribo,
      fecha_atraque,
      fecha_zarpe,
      toneladas,
      observaciones,
    } = body;

    if (!id_terminal || !id_nave || !id_cliente || !id_tipo_carga || !id_estado || !tipo_operacion || !muelle) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "id_terminal, id_nave, id_cliente, id_tipo_carga, id_estado, tipo_operacion y muelle son requeridos",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO operacion_portuaria
       (id_terminal, id_nave, id_cliente, id_tipo_carga, id_estado, id_usuario,
        tipo_operacion, muelle, fecha_arribo, fecha_atraque, fecha_zarpe, toneladas, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id_terminal,
        id_nave,
        id_cliente,
        id_tipo_carga,
        id_estado,
        id_usuario || null,
        tipo_operacion,
        muelle,
        fecha_arribo || null,
        fecha_atraque || null,
        fecha_zarpe || null,
        toneladas || 0.0,
        observaciones || null,
      ]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Operación portuaria creada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar operación portuaria por ID
operacionPortuariaRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const {
      id_terminal,
      id_nave,
      id_cliente,
      id_tipo_carga,
      id_estado,
      id_usuario,
      tipo_operacion,
      muelle,
      fecha_arribo,
      fecha_atraque,
      fecha_zarpe,
      toneladas,
      observaciones,
    } = body;

    const rows = await query(
      `UPDATE operacion_portuaria
       SET id_terminal = COALESCE($1, id_terminal),
           id_nave = COALESCE($2, id_nave),
           id_cliente = COALESCE($3, id_cliente),
           id_tipo_carga = COALESCE($4, id_tipo_carga),
           id_estado = COALESCE($5, id_estado),
           id_usuario = COALESCE($6, id_usuario),
           tipo_operacion = COALESCE($7, tipo_operacion),
           muelle = COALESCE($8, muelle),
           fecha_arribo = COALESCE($9, fecha_arribo),
           fecha_atraque = COALESCE($10, fecha_atraque),
           fecha_zarpe = COALESCE($11, fecha_zarpe),
           toneladas = COALESCE($12, toneladas),
           observaciones = COALESCE($13, observaciones)
       WHERE id_operacion = $14
       RETURNING *`,
      [
        id_terminal,
        id_nave,
        id_cliente,
        id_tipo_carga,
        id_estado,
        id_usuario,
        tipo_operacion,
        muelle,
        fecha_arribo,
        fecha_atraque,
        fecha_zarpe,
        toneladas,
        observaciones,
        id,
      ]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Operación portuaria con ID ${id} no encontrada para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Operación portuaria actualizada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar operación portuaria por ID
operacionPortuariaRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM operacion_portuaria WHERE id_operacion = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Operación portuaria con ID ${id} no encontrada para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Operación portuaria eliminada exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default operacionPortuariaRouter;
