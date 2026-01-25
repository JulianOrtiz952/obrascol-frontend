'use client';


import React, { useState } from 'react';

import { bodegas } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

interface CreateBodegaModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateBodegaModal({ onClose, onSuccess }: CreateBodegaModalProps) {
    const [nombre, setNombre] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await bodegas.create({
                nombre: nombre.trim(),
                ubicacion: ubicacion.trim(),
                activo: true,
            });
            onSuccess();
        } catch (err: any) {
            console.error('Error creating bodega:', err);
            setError(err.response?.data?.detail || 'Error al crear la bodega');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Nueva Bodega">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ej: Bodega Principal"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ubicación
                    </label>
                    <input
                        type="text"
                        value={ubicacion}
                        onChange={(e) => setUbicacion(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ej: Planta 1, Sector A"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creando...' : 'Crear Bodega'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
