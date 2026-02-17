import axios from 'axios';
import { Bodega, Subbodega, BodegaStock, PaginatedResponse, Marca, Material, UnidadMedida } from '@/types';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/',
    timeout: 10000,
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Bodegas API
export const bodegas = {
    getAll: (incluirInactivas = false) =>
        api.get<PaginatedResponse<Bodega>>(`bodegas/${incluirInactivas ? '?incluir_inactivas=true' : ''}`),

    getById: (id: number) =>
        api.get<Bodega>(`bodegas/${id}/`),

    create: (data: Omit<Bodega, 'id' | 'materiales_count'>) =>
        api.post<Bodega>('bodegas/', data),

    update: (id: number, data: Partial<Bodega>) =>
        api.patch<Bodega>(`bodegas/${id}/`, data),

    delete: (id: number) =>
        api.delete(`bodegas/${id}/`),

    toggleActivo: (id: number) =>
        api.post<Bodega>(`bodegas/${id}/toggle_activo/`),

    getStock: (id: number, subbodegaId?: number) => {
        let url = `bodegas/${id}/stock_actual/`;
        if (subbodegaId) url += `?subbodega=${subbodegaId}`;
        return api.get<BodegaStock[]>(url); // Note: actions usually aren't paginated unless specified
    },
};

// Subbodegas API
export const subbodegas = {
    getAll: (bodegaId?: number, incluirInactivas = false, parentId?: number | 'null') => {
        let url = 'subbodegas/';
        const params = new URLSearchParams();
        if (bodegaId) params.append('bodega', bodegaId.toString());
        if (incluirInactivas) params.append('incluir_inactivas', 'true');
        if (parentId !== undefined) params.append('parent', String(parentId));
        if (params.toString()) url += `?${params.toString()}`;
        return api.get<PaginatedResponse<Subbodega>>(url);
    },

    create: (data: Omit<Subbodega, 'id'>) =>
        api.post<Subbodega>('subbodegas/', data),

    update: (id: number, data: Partial<Subbodega>) =>
        api.patch<Subbodega>(`subbodegas/${id}/`, data),

    toggleActivo: (id: number) =>
        api.post<Subbodega>(`subbodegas/${id}/toggle_activo/`),
};

// Marcas API
export const marcas = {
    getAll: () => api.get<PaginatedResponse<Marca>>('marcas/'),
    create: (data: any) => api.post<Marca>('marcas/', data),
    update: (id: number, data: any) => api.patch<Marca>(`marcas/${id}/`, data),
};

// Materiales API
export const materiales = {
    getAll: () => api.get<PaginatedResponse<Material>>('materiales/'),
    getById: (id: number) => api.get<Material>(`materiales/${id}/`),
};

// Unidades API
export const unidades = {
    getAll: () => api.get<PaginatedResponse<UnidadMedida>>('unidades/'),
};

// Usuarios API
export const usuarios = {
    getAll: () => api.get<PaginatedResponse<any>>('usuarios/'),
};

export default api;

