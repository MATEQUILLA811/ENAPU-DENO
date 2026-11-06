-- ========================================================
-- ENAPU - MIGRACION DE TABLAS: MENU, ACCESO A SEDES Y PRIVILEGIOS
-- Base de Datos: ep-still-silence-b5xdk8go
-- ========================================================

-- 1. Agregar columna acceso_sedes a usuario si no existe
ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS acceso_sedes VARCHAR(20) NOT NULL DEFAULT 'SOLO_UNA_SEDE';

-- 2. Tabla menu (Catálogo Maestro de Menús)
CREATE TABLE IF NOT EXISTS menu (
  id_menu SERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  ruta VARCHAR(100) UNIQUE NOT NULL,
  icono VARCHAR(50) NOT NULL,
  seccion VARCHAR(50) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

-- 3. Tabla menu_usuario (Privilegios RBAC por Usuario y Menú)
CREATE TABLE IF NOT EXISTS menu_usuario (
  id_menu_usuario SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_menu INT NOT NULL REFERENCES menu(id_menu) ON DELETE CASCADE,
  puede_ver BOOLEAN NOT NULL DEFAULT TRUE,
  puede_crear BOOLEAN NOT NULL DEFAULT FALSE,
  puede_editar BOOLEAN NOT NULL DEFAULT FALSE,
  puede_eliminar BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_menu_usuario_pair UNIQUE (id_usuario, id_menu)
);

-- 4. Tabla usuario_menu_permiso (Compatibilidad con controladores)
CREATE TABLE IF NOT EXISTS usuario_menu_permiso (
  id_permiso SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_menu INT NOT NULL REFERENCES menu(id_menu) ON DELETE CASCADE,
  puede_ver BOOLEAN NOT NULL DEFAULT TRUE,
  puede_crear BOOLEAN NOT NULL DEFAULT FALSE,
  puede_editar BOOLEAN NOT NULL DEFAULT FALSE,
  puede_eliminar BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_usuario_menu UNIQUE(id_usuario, id_menu)
);

-- 5. Tabla usuario_menu (Compatibilidad de nombre)
CREATE TABLE IF NOT EXISTS usuario_menu (
  id_usuario_menu SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_menu INT NOT NULL REFERENCES menu(id_menu) ON DELETE CASCADE,
  puede_ver BOOLEAN NOT NULL DEFAULT TRUE,
  puede_crear BOOLEAN NOT NULL DEFAULT FALSE,
  puede_editar BOOLEAN NOT NULL DEFAULT FALSE,
  puede_eliminar BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_usuario_menu_table UNIQUE (id_usuario, id_menu)
);

-- 6. Tabla acceso_sedes (Control si el usuario accede a TODAS_SEDES o SOLO_UNA_SEDE)
CREATE TABLE IF NOT EXISTS acceso_sedes (
  id_acceso SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_terminal INT REFERENCES terminal(id_terminal) ON DELETE SET NULL,
  tipo_acceso VARCHAR(30) NOT NULL DEFAULT 'SOLO_UNA_SEDE',
  nombre_terminal VARCHAR(150),
  puede_acceder BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_acceso_sedes_usuario_terminal UNIQUE (id_usuario, id_terminal)
);

-- 7. Tabla usuario_terminal_permiso
CREATE TABLE IF NOT EXISTS usuario_terminal_permiso (
  id_permiso_terminal SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_terminal INT NOT NULL REFERENCES terminal(id_terminal) ON DELETE CASCADE,
  es_principal BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_usuario_terminal UNIQUE (id_usuario, id_terminal)
);

-- 8. Inserción de Catálogo de Menús
INSERT INTO menu (titulo, ruta, icono, seccion, orden, estado) VALUES
('Dashboard General', '/dashboard', 'stats-chart-outline', 'Principal', 1, 'Activo'),
('Operaciones Portuarias', '/operaciones', 'boat-outline', 'Operaciones SIO', 2, 'Activo'),
('Naves y Buques', '/naves', 'navigate-outline', 'Operaciones SIO', 3, 'Activo'),
('Clientes y Agencias', '/clientes', 'business-outline', 'Operaciones SIO', 4, 'Activo'),
('Tipos de Carga', '/cargas', 'cube-outline', 'Operaciones SIO', 5, 'Activo'),
('Facturacion', '/facturas', 'receipt-outline', 'Finanzas SIA', 6, 'Activo'),
('Catalogo de Servicios', '/servicios', 'pricetag-outline', 'Finanzas SIA', 7, 'Activo'),
('Gestion de Terminales', '/terminales', 'location-outline', 'Administracion', 8, 'Activo'),
('Usuarios del Sistema', '/usuarios', 'people-outline', 'Administracion', 9, 'Activo'),
('Privilegios y Sedes', '/usuarios', 'key-outline', 'Administracion', 10, 'Activo'),
('Reportes y Exportaciones', '/reportes', 'document-text-outline', 'Comercial', 11, 'Activo')
ON CONFLICT (ruta) DO NOTHING;

-- 9. Sembrar permisos iniciales para usuarios existentes
INSERT INTO menu_usuario (id_usuario, id_menu, puede_ver, puede_crear, puede_editar, puede_eliminar)
SELECT u.id_usuario, m.id_menu, true, 
       (CASE WHEN u.rol IN ('ADMIN', 'Administrador', 'SuperAdmin') THEN true ELSE false END),
       (CASE WHEN u.rol IN ('ADMIN', 'Administrador', 'SuperAdmin') THEN true ELSE false END),
       (CASE WHEN u.rol IN ('ADMIN', 'Administrador', 'SuperAdmin') THEN true ELSE false END)
FROM usuario u CROSS JOIN menu m
ON CONFLICT (id_usuario, id_menu) DO NOTHING;

INSERT INTO usuario_menu_permiso (id_usuario, id_menu, puede_ver, puede_crear, puede_editar, puede_eliminar)
SELECT id_usuario, id_menu, puede_ver, puede_crear, puede_editar, puede_eliminar
FROM menu_usuario
ON CONFLICT (id_usuario, id_menu) DO NOTHING;

INSERT INTO acceso_sedes (id_usuario, id_terminal, tipo_acceso, nombre_terminal, puede_acceder)
SELECT u.id_usuario, t.id_terminal,
       (CASE WHEN u.rol IN ('ADMIN', 'Administrador', 'SuperAdmin') THEN 'TODAS_SEDES' ELSE 'SOLO_UNA_SEDE' END),
       t.nombre, true
FROM usuario u CROSS JOIN terminal t
ON CONFLICT (id_usuario, id_terminal) DO NOTHING;
