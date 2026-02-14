export interface Marca {
    id: number;
    nombre: string;
    activo: boolean;
}

export interface UnidadMedida {
    id: number;
    nombre: string;
    abreviacion: string;
    activo: boolean;
}

export interface User {
    id: number;
    username: string;
    email: string;
    rol: 'operario' | 'administrativo' | 'superusuario';
    first_name: string;
    last_name: string;
}

export interface Subbodega {
    id: number;
    nombre: string;
    bodega: number;
    activo: boolean;
}

export interface Bodega {
    id: number;
    nombre: string;
    ubicacion: string;
    activo: boolean;
    materiales_count?: number;
    subbodegas?: Subbodega[];
}

export interface BodegaStock {
    id_material: number;
    codigo: string;
    referencia?: string;
    nombre: string;
    cantidad: number;
    unidad: string;
    id_subbodega?: number | null;
    subbodega_nombre?: string;
}

export interface Material {
    id: number;
    codigo: string;
    codigo_barras?: string;
    referencia?: string;
    nombre: string;
    unidad: string;
    marca?: number;
    marca_nombre?: string;
    ultimo_precio?: number | null;
}

export interface Factura {
    id: number;
    numero: string;
    proveedor: string;
    fecha: string;
}

export type TipoMovimiento = 'Entrada' | 'Salida' | 'Traslado' | 'Edicion' | 'Ajuste' | 'Devolucion';

export interface Movimiento {
    id: number;
    material: number;
    material_info: Material;
    bodega: number;
    bodega_info: Bodega;
    subbodega?: number | null;
    subbodega_info?: Subbodega | null;
    bodega_destino?: number | null;
    bodega_destino_info?: Bodega | null;
    subbodega_destino?: number | null;
    subbodega_destino_info?: Subbodega | null;
    factura?: number;
    factura_info?: Factura;
    cantidad: number;
    precio?: number | null;
    fecha: string;
    tipo: TipoMovimiento;
    observaciones?: string;
    factura_manual?: string;
    marca?: number;
    marca_info?: Marca;
    usuario?: number;
    usuario_info?: User;
}

export interface ResumenInventario {
    id_material: number;
    codigo: string;
    referencia?: string;
    nombre: string;
    id_bodega: number;
    bodega: string;
    id_subbodega?: number | null;
    subbodega?: string;
    cantidad: number;
    unidad: string;
    estado: 'Alto' | 'Medio' | 'Bajo';
}
