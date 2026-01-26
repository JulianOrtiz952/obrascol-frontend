'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Material, Marca } from '@/types';
import { Modal } from './ui/Modal';
import { Check, Plus } from 'lucide-react';

interface EditMaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    materialId: number;
}

export function EditMaterialModal({ isOpen, onClose, onSuccess, materialId }: EditMaterialModalProps) {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        codigo: '',
        referencia: '',
        nombre: '',
        unidad: '',
        marca: '',
        codigo_barras: ''
    });

    const [isCreatingMarca, setIsCreatingMarca] = useState(false);
    const [newMarcaName, setNewMarcaName] = useState('');

    useEffect(() => {
        if (isOpen && materialId) {
            const fetchData = async () => {
                try {
                    const [matRes, marRes] = await Promise.all([
                        api.get(`/materiales/${materialId}/`),
                        api.get('/marcas/')
                    ]);

                    const mat = matRes.data;
                    setFormData({
                        codigo: mat.codigo || '',
                        referencia: mat.referencia || '',
                        nombre: mat.nombre || '',
                        unidad: mat.unidad || '',
                        marca: mat.marca?.toString() || '',
                        codigo_barras: mat.codigo_barras || ''
                    });
                    setMarcas(marRes.data);
                } catch (err) {
                    console.error('Error fetching material data:', err);
                    onClose();
                }
            };
            fetchData();
        }
    }, [isOpen, materialId]);

    const handleCreateMarca = async () => {
        if (!newMarcaName.trim()) return;
        try {
            const res = await api.post('/marcas/', { nombre: newMarcaName, activo: true });
            const newMarca = res.data;
            setMarcas(prev => [...prev, newMarca]);
            setFormData(prev => ({ ...prev, marca: newMarca.id.toString() }));
            setIsCreatingMarca(false);
            setNewMarcaName('');
        } catch (err) {
            console.error('Error creating marca:', err);
            alert('Error al crear la marca.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalMarcaId = formData.marca;
            // Handle pending brand creation similar to RegistrarEntradaModal
            if (isCreatingMarca && newMarcaName.trim()) {
                try {
                    const marcaRes = await api.post('/marcas/', { nombre: newMarcaName, activo: true });
                    const newMarca = marcaRes.data;
                    setMarcas(prev => [...prev, newMarca]);
                    finalMarcaId = newMarca.id.toString();
                    // Update UI state cleanup
                    setIsCreatingMarca(false);
                    setNewMarcaName('');
                } catch (err) {
                    console.error('Error auto-creating pending brand:', err);
                    // Proceed without blocking, but brand won't be set
                }
            }

            await api.patch(`/materiales/${materialId}/`, {
                ...formData,
                marca: finalMarcaId || null
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error updating material:', err);
            alert('Error al actualizar el producto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Producto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Código</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Referencia</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            value={formData.referencia}
                            onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Nombre</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Unidad</label>
                        <select
                            required
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            value={formData.unidad}
                            onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                        >
                            <option value="pcs">pcs</option>
                            <option value="m">m</option>
                            <option value="L">L</option>
                            <option value="kg">kg</option>
                            <option value="paquete">paquete</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Marca</label>
                        {!isCreatingMarca ? (
                            <div className="flex gap-2">
                                <select
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    value={formData.marca}
                                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                >
                                    <option value="">Sin Marca</option>
                                    {marcas.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingMarca(true)}
                                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 border border-slate-200"
                                    title="Crear nueva marca"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Nombre de la marca"
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    value={newMarcaName}
                                    onChange={(e) => setNewMarcaName(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateMarca}
                                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsCreatingMarca(false); setNewMarcaName(''); }}
                                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                                >
                                    <Plus className="w-5 h-5 rotate-45" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Código de Barras</label>
                    <input
                        type="text"
                        placeholder="Escanea o escribe..."
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono"
                        value={formData.codigo_barras}
                        onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
