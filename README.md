# SIGEP-ENAPU: Backend API REST (Deno + Oak + PostgreSQL Neon)

Sistema de Información Gerencial para el Análisis y Control de Operaciones Portuarias de la **Empresa Nacional de Puertos S.A. (ENAPU S.A.)**  
*Universidad Nacional de Huancavelica - Facultad de Ingeniería de Sistemas*

---

## 👥 Autores
- **CAÑETE ICHILLUMPA, Steven Richard**
- **LLACUA MALLMA, Yazmin Grayce**

---

## 🛠️ Tecnologías y Arquitectura
- **Runtime:** [Deno 2](https://deno.com/)
- **Framework Web:** [Oak](https://jsr.io/@oak/oak)
- **Base de Datos:** PostgreSQL en la nube ([Neon Database](https://neon.tech/)) con SSL
- **Lenguaje:** TypeScript

---

## 🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone git@gitlab.com:llacuagrayce-group/enapu-backend.git
cd enapu-backend
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` basado en `.env.example`:
```env
DATABASE_URL=postgresql://neondb_owner:npg_AQpRqaew9Xk6@ep-still-silence-b5xdk8go-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3001
ENV=development
```

### 3. Ejecutar el servidor

```bash
# Modo desarrollo con auto-reload:
deno task dev

# Modo producción:
deno task start
```
Servidor disponible en: **`http://localhost:3001`**

---

## 📌 Documentación de Rutas de la API (`/api/*`)

Todas las rutas están centralizadas en `src/routes/app.routes.ts` y ofrecen las 4 operaciones CRUD fundamentales más la ruta de detalle (`Details`):

---

### 1. Terminales Portuarios (`/api/terminal`)
Gestiona los terminales portuarios (Ilo, Iquitos, Yurimaguas, Huacho, Arica).

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/terminal` | Listar todos los terminales | - |
| `GET` | `/api/terminal/:id` | Detalle de un terminal por ID | - |
| `POST` | `/api/terminal` | Registrar nuevo terminal | `{"nombre": "Terminal Matarani", "departamento": "Arequipa", "tipo_via": "Marítimo", "num_muelles": 2, "estado": "Activo"}` |
| `PUT` | `/api/terminal/:id` | Actualizar terminal | `{"estado": "Inactivo", "num_muelles": 3}` |
| `DELETE` | `/api/terminal/:id` | Eliminar terminal por ID | - |

---

### 2. Usuarios del Sistema (`/api/usuario`)
Gestiona los accesos y roles (Admin, Gerente General, Jefes de Terminal, Analistas).

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/usuario` | Listar todos los usuarios | - |
| `GET` | `/api/usuario/:id` | Detalle de usuario por ID | - |
| `POST` | `/api/usuario` | Registrar nuevo usuario | `{"id_terminal": 1, "nombres_apellidos": "Juan Perez", "nombre_usuario": "jperez", "correo": "jperez@enapu.pe", "rol": "Jefe de Terminal", "clave_hash": "pass123", "estado": "Activo"}` |
| `PUT` | `/api/usuario/:id` | Actualizar datos de usuario | `{"rol": "Gerente General", "estado": "Activo"}` |
| `DELETE` | `/api/usuario/:id` | Eliminar usuario por ID | - |

---

### 3. Estados de Operación (`/api/estado_operacion`)
Catálogo de estados operativos (Programado, En Atraque, En Operación, Completado, etc.).

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/estado_operacion` | Listar todos los estados | - |
| `GET` | `/api/estado_operacion/:id` | Detalle de estado por ID | - |
| `POST` | `/api/estado_operacion` | Registrar nuevo estado | `{"nombre": "En Fondeo", "descripcion": "Nave esperando turno en rada"}` |
| `PUT` | `/api/estado_operacion/:id` | Actualizar estado | `{"descripcion": "Actualización de descripción"}` |
| `DELETE` | `/api/estado_operacion/:id` | Eliminar estado por ID | - |

---

### 4. Tipos de Carga (`/api/tipo_carga`)
Clasificación de carga (Granel Sólido, Granel Líquido, Contenedores TEUs, Carga General).

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/tipo_carga` | Listar tipos de carga | - |
| `GET` | `/api/tipo_carga/:id` | Detalle de tipo de carga por ID | - |
| `POST` | `/api/tipo_carga` | Registrar tipo de carga | `{"descripcion": "Fertilizantes", "categoria": "Granel Sólido", "unidad_medida": "TM", "es_peligrosa": false}` |
| `PUT` | `/api/tipo_carga/:id` | Actualizar tipo de carga | `{"es_peligrosa": true}` |
| `DELETE` | `/api/tipo_carga/:id` | Eliminar tipo de carga por ID | - |

---

### 5. Clientes Comerciales (`/api/cliente`)
Clientes navieros, mineras y empresas usuarias de servicios portuarios.

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/cliente` | Listar todos los clientes | - |
| `GET` | `/api/cliente/:id` | Detalle de cliente por ID | - |
| `POST` | `/api/cliente` | Registrar nuevo cliente | `{"razon_social": "Naviera del Sur S.A.", "ruc": "20556677889", "tipo_cliente": "Línea Naviera", "pais": "Perú", "direccion": "Av. Costanera 101", "telefono": "053-481234", "correo": "naviera@sur.pe"}` |
| `PUT` | `/api/cliente/:id` | Actualizar cliente | `{"telefono": "053-999888"}` |
| `DELETE` | `/api/cliente/:id` | Eliminar cliente por ID | - |

---

### 6. Naves y Embarcaciones (`/api/nave`)
Registro de naves marítimas y fluviales atendidas en terminales ENAPU.

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/nave` | Listar todas las naves | - |
| `GET` | `/api/nave/:id` | Detalle de nave por ID | - |
| `POST` | `/api/nave` | Registrar nueva nave | `{"id_cliente": 1, "nombre_nave": "MN Pacific Tide", "matricula": "IMO-9876543", "tipo_nave": "Granelero", "trb": 32000, "bandera": "Panamá"}` |
| `PUT` | `/api/nave/:id` | Actualizar nave | `{"trb": 33500}` |
| `DELETE` | `/api/nave/:id` | Eliminar nave por ID | - |

---

### 7. Operaciones Portuarias (`/api/operacion_portuaria`)
Registro central del Sistema Integral de Operaciones (SIO).

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/operacion_portuaria` | Listar todas las operaciones | - |
| `GET` | `/api/operacion_portuaria/:id` | Detalle completo de operación | - |
| `POST` | `/api/operacion_portuaria` | Registrar nueva operación | `{"id_terminal": 1, "id_nave": 1, "id_cliente": 1, "id_tipo_carga": 1, "id_estado": 2, "id_usuario": 1, "tipo_operacion": "Embarque", "muelle": "Muelle 1", "fecha_arribo": "2026-11-04T10:00:00Z", "fecha_atraque": "2026-11-04T12:00:00Z", "toneladas": 15000.0, "observaciones": "Operación de prueba"}` |
| `PUT` | `/api/operacion_portuaria/:id` | Actualizar operación | `{"id_estado": 4, "fecha_zarpe": "2026-11-05T18:00:00Z"}` |
| `DELETE` | `/api/operacion_portuaria/:id` | Eliminar operación por ID | - |

---

### 8. Servicios Portuarios (`/api/servicio`)
Catálogo de servicios y tarifas del Sistema Integral Administrativo (SIA).

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/servicio` | Listar servicios | - |
| `GET` | `/api/servicio/:id` | Detalle de servicio por ID | - |
| `POST` | `/api/servicio` | Registrar nuevo servicio | `{"descripcion": "Uso de Grúa Móvil Portuaria", "categoria": "Equipamiento", "unidad_cobro": "Por Hora", "tarifa_base": 120.00}` |
| `PUT` | `/api/servicio/:id` | Actualizar tarifa / servicio | `{"tarifa_base": 135.00}` |
| `DELETE` | `/api/servicio/:id` | Eliminar servicio por ID | - |

---

### 9. Facturación (`/api/factura`)
Comprobantes de pago y facturas emitidas por servicios portuarios.

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/factura` | Listar facturas | - |
| `GET` | `/api/factura/:id` | Detalle con líneas de detalle_factura | - |
| `POST` | `/api/factura` | Emitir factura | `{"id_operacion": 1, "id_cliente": 1, "serie_numero": "F001-000500", "fecha_emision": "2026-11-04T12:00:00Z", "moneda": "PEN", "subtotal": 50000.00, "igv": 9000.00, "total": 59000.00, "estado_cobranza": "Pendiente"}` |
| `PUT` | `/api/factura/:id` | Actualizar estado de cobranza | `{"estado_cobranza": "Pagado"}` |
| `DELETE` | `/api/factura/:id` | Eliminar / anular factura | - |

---

### 10. Detalle de Factura (`/api/detalle_factura`)
Líneas de detalle e ítems vinculados a cada factura.

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/detalle_factura` | Listar detalles de facturas | - |
| `GET` | `/api/detalle_factura/:id` | Detalle de ítem por ID | - |
| `POST` | `/api/detalle_factura` | Agregar ítem a factura | `{"id_factura": 1, "id_servicio": 1, "cantidad": 10.0, "tarifa_unitaria": 45.50, "importe": 455.00}` |
| `PUT` | `/api/detalle_factura/:id` | Actualizar ítem de factura | `{"cantidad": 12.0, "importe": 546.00}` |
| `DELETE` | `/api/detalle_factura/:id` | Eliminar ítem por ID | - |

---

### 11. Sincronización Neon (`/api/playing_with_neon`)
Tabla auxiliar de pruebas y verificación de latencia de Neon Cloud.

| Método | Ruta | Descripción | Payload Ejemplo (JSON) |
|---|---|---|---|
| `GET` | `/api/playing_with_neon` | Listar registros de prueba | - |
| `GET` | `/api/playing_with_neon/:id` | Detalle por ID | - |
| `POST` | `/api/playing_with_neon` | Crear registro de prueba | `{"name": "test_latency", "value": 15.4}` |
| `PUT` | `/api/playing_with_neon/:id` | Actualizar registro | `{"value": 12.1}` |
| `DELETE` | `/api/playing_with_neon/:id` | Eliminar registro por ID | - |

---

## 🗄️ Estructura del Proyecto

```
ENAPU-BACKEND/
├── deno.json             # Configuración de Deno, dependencias y tareas
├── .env.example          # Plantilla de variables de entorno
├── .gitignore            # Exclusión de archivos sensibles (.env)
├── README.md             # Esta documentación
└── src/
    ├── main.ts           # Servidor Oak y middlewares (CORS, Logger)
    ├── db/
    │   ├── db.ts         # Pool de conexión a PostgreSQL (Neon)
    │   └── schema.sql    # DDL con la estructura completa de las 11 tablas
    ├── routes/
    │   ├── app.routes.ts # Router central que une los 11 módulos
    │   ├── terminal.ts
    │   ├── usuario.ts
    │   ├── estado_operacion.ts
    │   ├── tipo_carga.ts
    │   ├── cliente.ts
    │   ├── nave.ts
    │   ├── operacion_portuaria.ts
    │   ├── servicio.ts
    │   ├── factura.ts
    │   ├── detalle_factura.ts
    │   └── playing_with_neon.ts
    └── types/
        └── models.ts     # Interfaces TypeScript de cada tabla
```
