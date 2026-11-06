// ========================================================
// ROUTE: menu.ts
// Gestión de Menús, Privilegios RBAC y Asignación de Sedes
// ========================================================
import { Router, Context } from "@oak/oak";
import { query } from "../db/db.ts";

const router = new Router();

// 1. GET /api/menu -> Listar catálogo de menús
router.get("/", async (ctx: Context) => {
  try {
    const menus = await query(
      "SELECT * FROM menu WHERE estado = 'Activo' ORDER BY orden ASC"
    );
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      data: menus,
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Error al listar menús: " + (error as Error).message,
    };
  }
});

// 2. GET /api/menu/permisos/:id_usuario -> Obtener privilegios de un usuario
router.get("/permisos/:id_usuario", async (ctx: any) => {
  try {
    const idUsuario = ctx.params.id_usuario;
    const permisos = await query(
      `SELECT 
        m.id_menu,
        m.titulo,
        m.ruta,
        m.icono,
        m.seccion,
        m.orden,
        COALESCE(p.puede_ver, FALSE) as puede_ver,
        COALESCE(p.puede_crear, FALSE) as puede_crear,
        COALESCE(p.puede_editar, FALSE) as puede_editar,
        COALESCE(p.puede_eliminar, FALSE) as puede_eliminar
      FROM menu m
      LEFT JOIN usuario_menu_permiso p ON m.id_menu = p.id_menu AND p.id_usuario = $1
      WHERE m.estado = 'Activo'
      ORDER BY m.orden ASC`,
      [idUsuario]
    );

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      id_usuario: Number(idUsuario),
      data: permisos,
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Error al obtener permisos: " + (error as Error).message,
    };
  }
});

// 3. PUT /api/menu/permisos/:id_usuario -> Actualizar privilegios de un usuario para un menú
router.put("/permisos/:id_usuario", async (ctx: any) => {
  try {
    const idUsuario = ctx.params.id_usuario;
    const body = await ctx.request.body.json();
    const { id_menu, puede_ver, puede_crear, puede_editar, puede_eliminar } = body;

    if (!id_menu) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, message: "id_menu es requerido" };
      return;
    }

    const updated = await query(
      `INSERT INTO usuario_menu_permiso (id_usuario, id_menu, puede_ver, puede_crear, puede_editar, puede_eliminar)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id_usuario, id_menu) DO UPDATE
       SET puede_ver = EXCLUDED.puede_ver,
           puede_crear = EXCLUDED.puede_crear,
           puede_editar = EXCLUDED.puede_editar,
           puede_eliminar = EXCLUDED.puede_eliminar
       RETURNING *`,
      [
        idUsuario,
        id_menu,
        puede_ver ?? true,
        puede_crear ?? false,
        puede_editar ?? false,
        puede_eliminar ?? false,
      ]
    );

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Permiso de menú actualizado correctamente",
      data: updated[0],
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Error al actualizar permiso: " + (error as Error).message,
    };
  }
});

// 4. GET /api/menu/sedes/:id_usuario -> Obtener asignación de sede (TODAS_SEDES o SOLO_UNA_SEDE)
router.get("/sedes/:id_usuario", async (ctx: any) => {
  try {
    const idUsuario = ctx.params.id_usuario;
    const userRes = await query(
      `SELECT u.id_usuario, u.nombre_usuario, u.nombres_apellidos, u.rol, u.acceso_sedes, u.id_terminal, t.nombre as terminal_nombre
       FROM usuario u
       LEFT JOIN terminal t ON u.id_terminal = t.id_terminal
       WHERE u.id_usuario = $1`,
      [idUsuario]
    );

    if (userRes.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { success: false, message: "Usuario no encontrado" };
      return;
    }

    const terminales = await query("SELECT id_terminal, nombre, departamento, tipo_via FROM terminal WHERE estado = 'Activo' ORDER BY nombre ASC");

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      data: {
        usuario: userRes[0],
        terminalesDisponibles: terminales,
      },
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Error al obtener sedes del usuario: " + (error as Error).message,
    };
  }
});

// 5. PUT /api/menu/sedes/:id_usuario -> Asignar si es TODAS_SEDES o SOLO_UNA_SEDE
router.put("/sedes/:id_usuario", async (ctx: any) => {
  try {
    const idUsuario = ctx.params.id_usuario;
    const body = await ctx.request.body.json();
    const { acceso_sedes, id_terminal } = body;

    // Validación: acceso_sedes debe ser 'TODAS_SEDES' o 'SOLO_UNA_SEDE'
    if (acceso_sedes !== "TODAS_SEDES" && acceso_sedes !== "SOLO_UNA_SEDE") {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "acceso_sedes debe ser 'TODAS_SEDES' o 'SOLO_UNA_SEDE'",
      };
      return;
    }

    const updated = await query(
      `UPDATE usuario 
       SET acceso_sedes = $1, id_terminal = $2
       WHERE id_usuario = $3
       RETURNING id_usuario, nombre_usuario, nombres_apellidos, rol, acceso_sedes, id_terminal`,
      [acceso_sedes, acceso_sedes === "TODAS_SEDES" ? (id_terminal || null) : id_terminal, idUsuario]
    );

    // Actualizar tabla relacional acceso_sedes
    if (acceso_sedes === "TODAS_SEDES") {
      await query(
        `INSERT INTO acceso_sedes (id_usuario, id_terminal, tipo_acceso, descripcion, es_activo)
         VALUES ($1, NULL, 'TODAS_SEDES', 'Acceso Nacional a Todas las Sedes', TRUE)
         ON CONFLICT (id_usuario, id_terminal) DO UPDATE
         SET tipo_acceso = 'TODAS_SEDES', descripcion = 'Acceso Nacional a Todas las Sedes'`,
        [idUsuario]
      );
    } else if (id_terminal) {
      await query(
        `INSERT INTO acceso_sedes (id_usuario, id_terminal, tipo_acceso, descripcion, es_activo)
         VALUES ($1, $2, 'SOLO_UNA_SEDE', 'Acceso Restringido a Sede Asignada', TRUE)
         ON CONFLICT (id_usuario, id_terminal) DO UPDATE
         SET tipo_acceso = 'SOLO_UNA_SEDE', descripcion = 'Acceso Restringido a Sede Asignada'`,
        [idUsuario, id_terminal]
      );
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: `Configuración de sedes actualizada: ${acceso_sedes}`,
      data: updated[0],
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Error al actualizar asignación de sede: " + (error as Error).message,
    };
  }
});

export default router;
