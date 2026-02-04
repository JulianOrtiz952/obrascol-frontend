import axios from 'axios';
import { Bodega, BodegaStock } from '@/types';

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
        api.get<Bodega[]>(`bodegas/${incluirInactivas ? '?incluir_inactivas=true' : ''}`),

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

    getStock: (id: number) =>
        api.get<BodegaStock[]>(`bodegas/${id}/stock_actual/`),
};

export default api;

