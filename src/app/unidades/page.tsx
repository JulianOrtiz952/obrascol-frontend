'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { UnidadMedida } from '@/types';
import { Plus, Search, Pencil, Check, X, Box, Ruler } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';

export default function UnidadesPage() {
    const { user } = useAuth();
    const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Create/Edit state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnidad, setEditingUnidad] = useState<UnidadMedida | null>(null);
    const [formData, setFormData] = useState({ nombre: '', abreviacion: '', activo: true });

    // Confirm Modal state
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        unidad: UnidadMedida | null;
    }>({
        isOpen: false,
        unidad: null
    });

    const fetchUnidades = async () => {
        try {
            const res = await api.get('unidades/');
            setUnidades(res.data);
        } catch (err) {
            console.error('Error fetching unidades:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchUnidades();
    }, [user]);

    const filteredUnidades = unidades.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.abreviacion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        setEditingUnidad(null);
        setFormData({ nombre: '', abreviacion: '', activo: true });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (unidad: UnidadMedida) => {
        setEditingUnidad(unidad);
        setFormData({
            nombre: unidad.nombre,
            abreviacion: unidad.abreviacion,
            activo: unidad.activo
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUnidad) {
                await api.patch(`/unidades/${editingUnidad.id}/`, formData);
            } else {
                await api.post('unidades/', formData);
            }
            fetchUnidades();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving unidad:', err);
            alert('Error al guardar la unidad de medida');
        }
    };

    const handleConfirmToggle = (unidad: UnidadMedida) => {
        setConfirmState({
            isOpen: true,
            unidad
        });
    };

    const handleToggleActive = async () => {
        const { unidad } = confirmState;
        if (!unidad) return;

        try {
            await api.patch(`/unidades/${unidad.id}/`, { activo: !unidad.activo });
            fetchUnidades();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando unidades de medida...</div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Unidades de Medida</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">Gestiona las unidades utilizadas para los materiales</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-sm text-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Unidad
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 w-16">ID</th>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Abreviación</th>
                                <th className="px-6 py-3 text-center">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUnidades.map((unidad) => (
                                <tr key={unidad.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 font-mono text-slate-400">#{unidad.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                                        {unidad.nombre}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold uppercase">
                                            {unidad.abreviacion}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${unidad.activo
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {unidad.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenEdit(unidad)}
                                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleConfirmToggle(unidad)}
                                                className={`p-1.5 rounded-lg transition-colors ${unidad.activo
                                                    ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                                    : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                                title={unidad.activo ? "Desactivar" : "Activar"}
                                            >
                                                {unidad.activo ? <Box className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUnidades.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No se encontraron unidades de medida
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUnidad ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Nombre</label>
                            <input
                                type="text"
                                required
                                autoFocus
                                placeholder="Ej: Unidades, Metros..."
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Abreviación</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Und, m, L..."
                                maxLength={10}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                value={formData.abreviacion}
                                onChange={(e) => setFormData({ ...formData, abreviacion: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="activo"
                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        />
                        <label htmlFor="activo" className="text-sm text-slate-700">Unidad Activa</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Styled Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={handleToggleActive}
                title={confirmState.unidad?.activo ? "Desactivar Unidad" : "Activar Unidad"}
                message={`¿Estás seguro de que deseas ${confirmState.unidad?.activo ? 'desactivar' : 'activar'} la unidad "${confirmState.unidad?.nombre}"?`}
                confirmText={confirmState.unidad?.activo ? "Desactivar" : "Activar"}
                variant={confirmState.unidad?.activo ? "danger" : "success"}
            />
        </div>
    );
}
