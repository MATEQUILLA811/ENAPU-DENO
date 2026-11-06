// ========================================================
// ROUTER CENTRAL: app.routes.ts
// Integra los 11 módulos CRUD del sistema SIGEP-ENAPU
// ========================================================
import { Router } from "@oak/oak";

// Importación de los 11 módulos CRUD
import terminalRouter from "./terminal.ts";
import usuarioRouter from "./usuario.ts";
import estadoOperacionRouter from "./estado_operacion.ts";
import tipoCargaRouter from "./tipo_carga.ts";
import clienteRouter from "./cliente.ts";
import naveRouter from "./nave.ts";
import operacionPortuariaRouter from "./operacion_portuaria.ts";
import servicioRouter from "./servicio.ts";
import facturaRouter from "./factura.ts";
import detalleFacturaRouter from "./detalle_factura.ts";
import playingWithNeonRouter from "./playing_with_neon.ts";
import menuRouter from "./menu.ts";

const appRoutes = new Router();

// ========================================================
// Cada módulo expone las 4 operaciones principales del CRUD (+ Details):
// 1. GET    /api/{recurso}       -> Listar todos
// 2. GET    /api/{recurso}/:id   -> Details (Obtener uno por ID)
// 3. POST   /api/{recurso}       -> Crear nuevo
// 4. PUT    /api/{recurso}/:id   -> Edit / Actualizar por ID
// 5. DELETE /api/{recurso}/:id   -> Eliminar por ID
// ========================================================

// 1. Terminales portuarios (Ilo, Iquitos, Yurimaguas, etc.)
appRoutes.use("/terminal", terminalRouter.routes(), terminalRouter.allowedMethods());

// 2. Usuarios del sistema y asignación de roles
appRoutes.use("/usuario", usuarioRouter.routes(), usuarioRouter.allowedMethods());

// 3. Estados de las operaciones portuarias (Programado, En Atraque, Completado, etc.)
appRoutes.use("/estado_operacion", estadoOperacionRouter.routes(), estadoOperacionRouter.allowedMethods());

// 4. Tipos y categorías de carga (Granel sólido, líquido, contenedores, etc.)
appRoutes.use("/tipo_carga", tipoCargaRouter.routes(), tipoCargaRouter.allowedMethods());

// 5. Clientes navieros y empresas asociadas
appRoutes.use("/cliente", clienteRouter.routes(), clienteRouter.allowedMethods());

// 6. Naves y embarcaciones marítimas y fluviales
appRoutes.use("/nave", naveRouter.routes(), naveRouter.allowedMethods());

// 7. Operaciones portuarias centrales (SIO)
appRoutes.use("/operacion_portuaria", operacionPortuariaRouter.routes(), operacionPortuariaRouter.allowedMethods());

// 8. Servicios portuarios y tarifas base (SIA)
appRoutes.use("/servicio", servicioRouter.routes(), servicioRouter.allowedMethods());

// 9. Facturación electrónica y comprobantes
appRoutes.use("/factura", facturaRouter.routes(), facturaRouter.allowedMethods());

// 10. Detalles de ítems facturados
appRoutes.use("/detalle_factura", detalleFacturaRouter.routes(), detalleFacturaRouter.allowedMethods());

// 11. Tabla de pruebas y sincronización Neon Cloud
appRoutes.use("/playing_with_neon", playingWithNeonRouter.routes(), playingWithNeonRouter.allowedMethods());

// 12. Menús, Privilegios RBAC y Asignación de Sedes (TODAS_SEDES vs SOLO_UNA_SEDE)
appRoutes.use("/menu", menuRouter.routes(), menuRouter.allowedMethods());

export default appRoutes;
