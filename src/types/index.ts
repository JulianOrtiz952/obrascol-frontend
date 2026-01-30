export interface Marca {
    id: number;
    nombre: string;
    activo: boolean;
}

export interface Bodega {
    id: number;
    nombre: string;
    ubicacion: string;
    activo: boolean;
    materiales_count?: number;
}

export interface BodegaStock {
    id_material: number;
    codigo: string;
    referencia?: string;
    nombre: string;
    cantidad: number;
    unidad: string;
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

export type TipoMovimiento = 'Entrada' | 'Salida' | 'Edicion' | 'Ajuste' | 'Devolucion';

export interface Movimiento {
    id: number;
    material: number;
    material_info: Material;
    bodega: number;
    bodega_info: Bodega;
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
}

export interface ResumenInventario {
    id_material: number;
    codigo: string;
    referencia?: string;
    nombre: string;
    id_bodega: number;
    bodega: string;
    cantidad: number;
    unidad: string;
    estado: 'Alto' | 'Medio' | 'Bajo';
}
