// types/models.ts - Modelos TypeScript basados exactamente en el diagrama relacional

export interface Terminal {
  id_terminal: number;
  nombre: string;
  departamento: string;
  tipo_via: string;
  num_muelles: number;
  estado: string;
}

export interface Usuario {
  id_usuario: number;
  id_terminal: number | null;
  nombres_apellidos: string;
  nombre_usuario: string;
  correo: string;
  rol: string;
  clave_hash: string;
  estado: string;
}

export interface EstadoOperacion {
  id_estado: number;
  nombre: string;
  descripcion: string;
}

export interface TipoCarga {
  id_tipo_carga: number;
  descripcion: string;
  categoria: string;
  unidad_medida: string;
  es_peligrosa: boolean;
}

export interface Cliente {
  id_cliente: number;
  razon_social: string;
  ruc: string;
  tipo_cliente: string;
  pais: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
}

export interface Nave {
  id_nave: number;
  id_cliente: number | null;
  nombre_nave: string;
  matricula: string;
  tipo_nave: string;
  trb: number;
  bandera: string;
}

export interface OperacionPortuaria {
  id_operacion: number;
  id_terminal: number;
  id_nave: number;
  id_cliente: number;
  id_tipo_carga: number;
  id_estado: number;
  id_usuario: number | null;
  tipo_operacion: string;
  muelle: string;
  fecha_arribo: string | null;
  fecha_atraque: string | null;
  fecha_zarpe: string | null;
  toneladas: number;
  observaciones?: string;
}

export interface Servicio {
  id_servicio: number;
  descripcion: string;
  categoria: string;
  unidad_cobro: string;
  tarifa_base: number;
}

export interface Factura {
  id_factura: number;
  id_operacion: number | null;
  id_cliente: number;
  serie_numero: string;
  fecha_emision: string;
  moneda: string;
  subtotal: number;
  igv: number;
  total: number;
  estado_cobranza: string;
}

export interface DetalleFactura {
  id_detalle: number;
  id_factura: number;
  id_servicio: number;
  cantidad: number;
  tarifa_unitaria: number;
  importe: number;
}

export interface PlayingWithNeon {
  id: number;
  name: string;
  value: number;
}
