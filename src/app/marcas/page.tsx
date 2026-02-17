'use client';

import React, { useState, useEffect } from 'react';
import { marcas as marcasApi } from '@/lib/api';
import { Marca } from '@/types';
import { Plus, Search, Pencil, Check, X, Box, Shield } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';

export default function MarcasPage() {
    const { user } = useAuth();
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Create/Edit state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
    const [formData, setFormData] = useState({ nombre: '', activo: true });

    // Confirm Modal state
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        marca: Marca | null;
    }>({
        isOpen: false,
        marca: null
    });

    const fetchMarcas = async () => {
        try {
            const res = await marcasApi.getAll();
            setMarcas(res.data.results);
        } catch (err) {
            console.error('Error fetching marcas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchMarcas();
    }, [user]);

    const filteredMarcas = marcas.filter(m =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        setEditingMarca(null);
        setFormData({ nombre: '', activo: true });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (marca: Marca) => {
        setEditingMarca(marca);
        setFormData({ nombre: marca.nombre, activo: marca.activo });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMarca) {
                await marcasApi.update(editingMarca.id, formData);
            } else {
                await marcasApi.create(formData);
            }
            fetchMarcas();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving marca:', err);
            alert('Error al guardar la marca');
        }
    };

    const handleConfirmToggle = (marca: Marca) => {
        setConfirmState({
            isOpen: true,
            marca
        });
    };

    const handleToggleActive = async () => {
        const { marca } = confirmState;
        if (!marca) return;

        try {
            await marcasApi.update(marca.id, { activo: !marca.activo });
            fetchMarcas();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando marcas...</div>;


    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Gestión de Marcas</h1>
                    <p className="text-slate-500 mt-1">Administra el catálogo de marcas del sistema</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Marca
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar marca..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
                                <th className="px-6 py-3 text-center">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMarcas.map((marca) => (
                                <tr key={marca.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 font-mono text-slate-400">#{marca.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                                        {marca.nombre}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${marca.activo
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {marca.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenEdit(marca)}
                                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleConfirmToggle(marca)}
                                                className={`p-1.5 rounded-lg transition-colors ${marca.activo
                                                    ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                                    : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                                title={marca.activo ? "Desactivar" : "Activar"}
                                            >
                                                {marca.activo ? <Box className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredMarcas.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        No se encontraron marcas
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
                title={editingMarca ? 'Editar Marca' : 'Nueva Marca'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nombre de la Marca</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Ej: Samsung, Adidas, etc."
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="activo"
                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        />
                        <label htmlFor="activo" className="text-sm text-slate-700">Marca Activa</label>
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
                title={confirmState.marca?.activo ? "Desactivar Marca" : "Activar Marca"}
                message={`¿Estás seguro de que deseas ${confirmState.marca?.activo ? 'desactivar' : 'activar'} la marca "${confirmState.marca?.nombre}"?`}
                confirmText={confirmState.marca?.activo ? "Desactivar" : "Activar"}
                variant={confirmState.marca?.activo ? "danger" : "success"}
            />
        </div>
    );
}
