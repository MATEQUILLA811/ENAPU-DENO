// ========================================================
// MÓDULO: CLIENTE (cliente.ts)
// Operaciones CRUD completas para la tabla 'cliente'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const clienteRouter = new Router();

// 1. GET - Obtener todos los clientes
clienteRouter.get("/", async (ctx) => {
  try {
    const clientes = await query(
      "SELECT * FROM cliente ORDER BY id_cliente ASC"
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: clientes };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle de cliente por ID
clienteRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "SELECT * FROM cliente WHERE id_cliente = $1",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Cliente con ID ${id} no encontrado`,
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

// 3. POST - Crear nuevo cliente
clienteRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { razon_social, ruc, tipo_cliente, pais, direccion, telefono, correo } = body;

    if (!razon_social || !ruc || !tipo_cliente) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "razon_social, ruc y tipo_cliente son campos requeridos",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO cliente (razon_social, ruc, tipo_cliente, pais, direccion, telefono, correo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        razon_social,
        ruc,
        tipo_cliente,
        pais || "Perú",
        direccion || null,
        telefono || null,
        correo || null,
      ]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Cliente creado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar cliente por ID
clienteRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const { razon_social, ruc, tipo_cliente, pais, direccion, telefono, correo } = body;

    const rows = await query(
      `UPDATE cliente
       SET razon_social = COALESCE($1, razon_social),
           ruc = COALESCE($2, ruc),
           tipo_cliente = COALESCE($3, tipo_cliente),
           pais = COALESCE($4, pais),
           direccion = COALESCE($5, direccion),
           telefono = COALESCE($6, telefono),
           correo = COALESCE($7, correo)
       WHERE id_cliente = $8
       RETURNING *`,
      [razon_social, ruc, tipo_cliente, pais, direccion, telefono, correo, id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Cliente con ID ${id} no encontrado para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Cliente actualizado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar cliente por ID
clienteRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM cliente WHERE id_cliente = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Cliente con ID ${id} no encontrado para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Cliente eliminado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default clienteRouter;
