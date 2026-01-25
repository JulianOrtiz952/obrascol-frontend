import axios from 'axios';
import { Bodega, BodegaStock } from '@/types';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/',
});

// Bodegas API
export const bodegas = {
    getAll: (incluirInactivas = false) =>
        api.get<Bodega[]>(`/bodegas/${incluirInactivas ? '?incluir_inactivas=true' : ''}`),

    getById: (id: number) =>
        api.get<Bodega>(`/bodegas/${id}/`),

    create: (data: Omit<Bodega, 'id' | 'materiales_count'>) =>
        api.post<Bodega>('/bodegas/', data),

    update: (id: number, data: Partial<Bodega>) =>
        api.patch<Bodega>(`/bodegas/${id}/`, data),

    delete: (id: number) =>
        api.delete(`/bodegas/${id}/`),

    toggleActivo: (id: number) =>
        api.post<Bodega>(`/bodegas/${id}/toggle_activo/`),

    getStock: (id: number) =>
        api.get<BodegaStock[]>(`/bodegas/${id}/stock_actual/`),
};

export default api;

