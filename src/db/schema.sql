-- ========================================================
-- SIGEP-ENAPU: Esquema Relacional de Base de Datos
-- PostgreSQL / Neon Database
-- ========================================================

-- 1. Tabla: terminal
CREATE TABLE IF NOT EXISTS terminal (
    id_terminal SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    tipo_via VARCHAR(50) NOT NULL,
    num_muelles INT NOT NULL DEFAULT 1,
    estado VARCHAR(30) NOT NULL DEFAULT 'Activo'
);

-- 2. Tabla: usuario
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_terminal INT REFERENCES terminal(id_terminal) ON DELETE SET NULL,
    nombres_apellidos VARCHAR(150) NOT NULL,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL,
    clave_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Activo'
);

-- 3. Tabla: estado_operacion
CREATE TABLE IF NOT EXISTS estado_operacion (
    id_estado SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- 4. Tabla: tipo_carga
CREATE TABLE IF NOT EXISTS tipo_carga (
    id_tipo_carga SERIAL PRIMARY KEY,
    descripcion VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL DEFAULT 'TM',
    es_peligrosa BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Tabla: cliente
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente SERIAL PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    ruc VARCHAR(20) UNIQUE NOT NULL,
    tipo_cliente VARCHAR(50) NOT NULL,
    pais VARCHAR(50) NOT NULL DEFAULT 'Perú',
    direccion VARCHAR(200),
    telefono VARCHAR(30),
    correo VARCHAR(100)
);

-- 6. Tabla: nave
CREATE TABLE IF NOT EXISTS nave (
    id_nave SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES cliente(id_cliente) ON DELETE SET NULL,
    nombre_nave VARCHAR(100) NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    tipo_nave VARCHAR(50) NOT NULL,
    trb INT NOT NULL,
    bandera VARCHAR(50) NOT NULL
);

-- 7. Tabla: operacion_portuaria
CREATE TABLE IF NOT EXISTS operacion_portuaria (
    id_operacion SERIAL PRIMARY KEY,
    id_terminal INT NOT NULL REFERENCES terminal(id_terminal) ON DELETE RESTRICT,
    id_nave INT NOT NULL REFERENCES nave(id_nave) ON DELETE RESTRICT,
    id_cliente INT NOT NULL REFERENCES cliente(id_cliente) ON DELETE RESTRICT,
    id_tipo_carga INT NOT NULL REFERENCES tipo_carga(id_tipo_carga) ON DELETE RESTRICT,
    id_estado INT NOT NULL REFERENCES estado_operacion(id_estado) ON DELETE RESTRICT,
    id_usuario INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    tipo_operacion VARCHAR(50) NOT NULL,
    muelle VARCHAR(50) NOT NULL,
    fecha_arribo TIMESTAMP WITH TIME ZONE,
    fecha_atraque TIMESTAMP WITH TIME ZONE,
    fecha_zarpe TIMESTAMP WITH TIME ZONE,
    toneladas NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    observaciones TEXT
);

-- 8. Tabla: servicio
CREATE TABLE IF NOT EXISTS servicio (
    id_servicio SERIAL PRIMARY KEY,
    descripcion VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    unidad_cobro VARCHAR(50) NOT NULL,
    tarifa_base NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 9. Tabla: factura
CREATE TABLE IF NOT EXISTS factura (
    id_factura SERIAL PRIMARY KEY,
    id_operacion INT REFERENCES operacion_portuaria(id_operacion) ON DELETE SET NULL,
    id_cliente INT NOT NULL REFERENCES cliente(id_cliente) ON DELETE RESTRICT,
    serie_numero VARCHAR(30) UNIQUE NOT NULL,
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    moneda VARCHAR(10) NOT NULL DEFAULT 'PEN',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    igv NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    estado_cobranza VARCHAR(50) NOT NULL DEFAULT 'Pendiente'
);

-- 10. Tabla: detalle_factura
CREATE TABLE IF NOT EXISTS detalle_factura (
    id_detalle SERIAL PRIMARY KEY,
    id_factura INT NOT NULL REFERENCES factura(id_factura) ON DELETE CASCADE,
    id_servicio INT NOT NULL REFERENCES servicio(id_servicio) ON DELETE RESTRICT,
    cantidad NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    tarifa_unitaria NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    importe NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- 11. Tabla: playing_with_neon
CREATE TABLE IF NOT EXISTS playing_with_neon (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    value REAL
);

-- 12. Tabla: menu (Catálogo Maestro de Menús)
CREATE TABLE IF NOT EXISTS menu (
    id_menu SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    ruta VARCHAR(100) UNIQUE NOT NULL,
    icono VARCHAR(50) NOT NULL,
    seccion VARCHAR(50) NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

-- 13. Tabla: usuario_menu_permiso (Privilegios RBAC por Usuario y Menú)
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

-- 14. Tabla: usuario_terminal_permiso (Asignación de Sede: TODAS_SEDES vs SOLO_UNA_SEDE)
CREATE TABLE IF NOT EXISTS usuario_terminal_permiso (
    id_permiso_terminal SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_terminal INT NOT NULL REFERENCES terminal(id_terminal) ON DELETE CASCADE,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_usuario_terminal UNIQUE(id_usuario, id_terminal)
);

-- 15. Tabla: acceso_sedes (Control de Acceso a Sedes: TODAS_SEDES vs SOLO_UNA_SEDE)
CREATE TABLE IF NOT EXISTS acceso_sedes (
    id_acceso SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_terminal INT REFERENCES terminal(id_terminal) ON DELETE SET NULL,
    tipo_acceso VARCHAR(30) NOT NULL DEFAULT 'SOLO_UNA_SEDE', -- 'TODAS_SEDES' o 'SOLO_UNA_SEDE'
    descripcion VARCHAR(150),
    es_activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_acceso_sede UNIQUE (id_usuario, id_terminal)
);
