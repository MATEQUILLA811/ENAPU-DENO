// ========================================================
// MÓDULO: USUARIO (usuario.ts)
// Operaciones CRUD completas para la tabla 'usuario'
// ========================================================
import { Router } from "@oak/oak";
import { query } from "../db/db.ts";

const usuarioRouter = new Router();

// 1. GET - Obtener todos los usuarios con información de su terminal
usuarioRouter.get("/", async (ctx) => {
  try {
    const usuarios = await query(
      `SELECT u.id_usuario, u.id_terminal, t.nombre as terminal_nombre,
              u.nombres_apellidos, u.nombre_usuario, u.correo, u.rol, u.estado
       FROM usuario u
       LEFT JOIN terminal t ON u.id_terminal = t.id_terminal
       ORDER BY u.id_usuario ASC`
    );
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: usuarios };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 2. GET (Details) - Obtener detalle de usuario por ID
usuarioRouter.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      `SELECT u.id_usuario, u.id_terminal, t.nombre as terminal_nombre,
              u.nombres_apellidos, u.nombre_usuario, u.correo, u.rol, u.estado
       FROM usuario u
       LEFT JOIN terminal t ON u.id_terminal = t.id_terminal
       WHERE u.id_usuario = $1`,
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Usuario con ID ${id} no encontrado`,
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

// 2.5 POST /login - Autenticar usuario según rol en Postgres
usuarioRouter.post("/login", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { username, password } = body;

    if (!username || !password) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "Usuario y contraseña son requeridos",
      };
      return;
    }

    const rows = await query(
      `SELECT u.id_usuario, u.id_terminal, t.nombre as terminal_nombre,
              u.nombres_apellidos, u.nombre_usuario, u.correo, u.rol, u.estado, u.clave_hash
       FROM usuario u
       LEFT JOIN terminal t ON u.id_terminal = t.id_terminal
       WHERE (LOWER(u.nombre_usuario) = LOWER($1) OR LOWER(u.correo) = LOWER($1))
         AND u.estado = 'Activo'
       LIMIT 1`,
      [username.trim()]
    );

    if (rows.length === 0) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Usuario no encontrado o inactivo",
      };
      return;
    }

    const user = rows[0];
    if (user.clave_hash !== password.trim()) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Contraseña incorrecta",
      };
      return;
    }

    const { clave_hash, ...userData } = user;

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Inicio de sesión exitoso",
      data: userData,
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 3. POST - Crear nuevo usuario
usuarioRouter.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const {
      id_terminal,
      nombres_apellidos,
      nombre_usuario,
      correo,
      rol,
      clave_hash,
      estado,
    } = body;

    if (!nombres_apellidos || !nombre_usuario || !correo || !rol || !clave_hash) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "nombres_apellidos, nombre_usuario, correo, rol y clave_hash son requeridos",
      };
      return;
    }

    const rows = await query(
      `INSERT INTO usuario (id_terminal, nombres_apellidos, nombre_usuario, correo, rol, clave_hash, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_usuario, id_terminal, nombres_apellidos, nombre_usuario, correo, rol, estado`,
      [
        id_terminal || null,
        nombres_apellidos,
        nombre_usuario,
        correo,
        rol,
        clave_hash,
        estado || "Activo",
      ]
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Usuario creado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 4. PUT / EDIT - Editar / actualizar usuario por ID
usuarioRouter.put("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const body = await ctx.request.body.json();
    const {
      id_terminal,
      nombres_apellidos,
      nombre_usuario,
      correo,
      rol,
      clave_hash,
      estado,
    } = body;

    const rows = await query(
      `UPDATE usuario
       SET id_terminal = COALESCE($1, id_terminal),
           nombres_apellidos = COALESCE($2, nombres_apellidos),
           nombre_usuario = COALESCE($3, nombre_usuario),
           correo = COALESCE($4, correo),
           rol = COALESCE($5, rol),
           clave_hash = COALESCE($6, clave_hash),
           estado = COALESCE($7, estado)
       WHERE id_usuario = $8
       RETURNING id_usuario, id_terminal, nombres_apellidos, nombre_usuario, correo, rol, estado`,
      [
        id_terminal !== undefined ? id_terminal : null,
        nombres_apellidos,
        nombre_usuario,
        correo,
        rol,
        clave_hash,
        estado,
        id,
      ]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Usuario con ID ${id} no encontrado para actualizar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Usuario actualizado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// 5. DELETE - Eliminar usuario por ID
usuarioRouter.delete("/:id", async (ctx) => {
  const id = ctx.params.id;
  try {
    const rows = await query(
      "DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, nombre_usuario",
      [id]
    );

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: `Usuario con ID ${id} no encontrado para eliminar`,
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Usuario eliminado exitosamente",
      data: rows[0],
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

export default usuarioRouter;
