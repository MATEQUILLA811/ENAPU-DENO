// ========================================================
// MÓDULO: TIPO DE CARGA (tipo_carga.ts)
// Operaciones CRUD completas para la tabla 'tipo_carga'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const tipoCargaRouter = new Router();

// 1. GET - Obtener todos los tipos de carga
tipoCargaRouter.get("/", async (ctx) => {
  try {
    const tipos = await query(
      "SELECT * FROM tipo_carga ORDER BY id_tipo_carga ASC"
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: tipos };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle de tipo de carga por ID
tipoCargaRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "SELECT * FROM tipo_carga WHERE id_tipo_carga = $1",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Tipo de carga con ID ${id} no encontrado`,
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

// 3. POST - Crear nuevo tipo de carga
tipoCargaRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { descripcion, categoria, unidad_medida, es_peligrosa } = body;

    if (!descripcion || !categoria) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "descripcion y categoria son campos requeridos",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO tipo_carga (descripcion, categoria, unidad_medida, es_peligrosa)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        descripcion,
        categoria,
        unidad_medida || "TM",
        es_peligrosa !== undefined ? es_peligrosa : false,
      ]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Tipo de carga creado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar tipo de carga por ID
tipoCargaRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const { descripcion, categoria, unidad_medida, es_peligrosa } = body;

    const rows = await query(
      `UPDATE tipo_carga
       SET descripcion = COALESCE($1, descripcion),
           categoria = COALESCE($2, categoria),
           unidad_medida = COALESCE($3, unidad_medida),
           es_peligrosa = COALESCE($4, es_peligrosa)
       WHERE id_tipo_carga = $5
       RETURNING *`,
      [descripcion, categoria, unidad_medida, es_peligrosa, id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Tipo de carga con ID ${id} no encontrado para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Tipo de carga actualizado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar tipo de carga por ID
tipoCargaRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM tipo_carga WHERE id_tipo_carga = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Tipo de carga con ID ${id} no encontrado para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Tipo de carga eliminado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default tipoCargaRouter;
