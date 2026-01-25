'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Material, Bodega } from '@/types';
import { Modal } from './ui/Modal';
import { Plus, Search, Check, Save, Scan, AlertCircle } from 'lucide-react';

interface RegistrarEntradaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function RegistrarEntradaModal({ isOpen, onClose, onSuccess }: RegistrarEntradaModalProps) {
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [bodegas, setBodegas] = useState<Bodega[]>([]);

    const [formData, setFormData] = useState({
        barcode: '',
        materialId: '',
        codigo: '',
        referencia: '',
        nombre: '',
        bodega: '',
        factura_manual: '',
        cantidad: '',
        unidad: 'pcs',
        precio: '',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: '',
    });

    const [loading, setLoading] = useState(false);
    const [isNewMaterial, setIsNewMaterial] = useState(false);
    const barcodeInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [matRes, bodRes] = await Promise.all([
                        api.get('/materiales/'),
                        api.get('/bodegas/'),
                    ]);
                    setMateriales(matRes.data);
                    setBodegas(bodRes.data);

                    // Auto-focus barcode field
                    setTimeout(() => barcodeInputRef.current?.focus(), 100);
                } catch (err) {
                    console.error('Error fetching form data:', err);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleBarcodeChange = (val: string) => {
        setFormData(prev => ({ ...prev, barcode: val }));

        // Try to find material by barcode or code
        const mat = materiales.find(m => m.codigo_barras === val || m.codigo === val);
        if (mat) {
            setIsNewMaterial(false);
            setFormData(prev => ({
                ...prev,
                barcode: val,
                materialId: mat.id.toString(),
                codigo: mat.codigo,
                referencia: mat.referencia || '',
                nombre: mat.nombre,
                unidad: mat.unidad
            }));
        } else {
            // New material candidate
            setIsNewMaterial(true);
            setFormData(prev => ({
                ...prev,
                barcode: val,
                materialId: '',
                codigo: val, // use barcode as code by default
                nombre: '',
                referencia: '',
                unidad: 'pcs'
            }));
        }
    };

    const handleMaterialSelect = (id: string) => {
        const mat = materiales.find(m => m.id.toString() === id);
        if (mat) {
            setIsNewMaterial(false);
            setFormData(prev => ({
                ...prev,
                materialId: id,
                codigo: mat.codigo,
                referencia: mat.referencia || '',
                nombre: mat.nombre,
                unidad: mat.unidad,
                barcode: mat.codigo_barras || mat.codigo
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                materialId: '',
                codigo: '',
                referencia: '',
                nombre: '',
                unidad: '',
                barcode: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let materialId = formData.materialId;

            // Create material if it's new
            if (isNewMaterial) {
                const matRes = await api.post('/materiales/', {
                    codigo: formData.codigo,
                    codigo_barras: formData.barcode,
                    referencia: formData.referencia,
                    nombre: formData.nombre,
                    unidad: formData.unidad
                });
                materialId = matRes.data.id;
            }

            await api.post('/movimientos/', {
                material: materialId,
                bodega: formData.bodega,
                factura_manual: formData.factura_manual,
                cantidad: parseInt(formData.cantidad),
                precio: parseFloat(formData.precio),
                fecha: formData.fecha,
                tipo: 'Entrada',
                observaciones: formData.observaciones
            });

            onSuccess();
            onClose();
            // Reset form
            setFormData({
                barcode: '', materialId: '', codigo: '', referencia: '', nombre: '',
                bodega: '', factura_manual: '', cantidad: '', unidad: 'pcs',
                precio: '', fecha: new Date().toISOString().split('T')[0],
                observaciones: ''
            });
            setIsNewMaterial(false);
        } catch (err) {
            console.error('Error submitting movement:', err);
            alert('Error al registrar la entrada. Verifique los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Entrada de Inventario">
            <p className="text-slate-500 text-sm mb-6 -mt-2">Complete los campos para registrar una nueva entrada al inventario</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-6 relative overflow-hidden">
                    <label className="text-sm font-bold text-orange-950 flex items-center gap-2 mb-2">
                        <Scan className="w-4 h-4" />
                        Escaneo de Código de Barras
                    </label>
                    <input
                        ref={barcodeInputRef}
                        type="text"
                        placeholder="Escanea o escribe el código aquí..."
                        className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-mono text-lg"
                        value={formData.barcode}
                        onChange={(e) => handleBarcodeChange(e.target.value)}
                    />
                    {isNewMaterial && formData.barcode && (
                        <div className="mt-3 flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-bold leading-none">Producto nuevo detectado. ¡Ingresa sus datos abajo!</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {!isNewMaterial ? (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Selección Manual (Opcional)</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                value={formData.materialId}
                                onChange={(e) => handleMaterialSelect(e.target.value)}
                            >
                                <option value="" className="text-slate-400">Seleccionar material...</option>
                                {materiales.map(m => (
                                    <option key={m.id} value={m.id} className="text-slate-900">{m.codigo} - {m.nombre}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Código del Producto *</label>
                            <input
                                type="text"
                                required
                                placeholder="MAQ-XXX"
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Referencia</label>
                        <input
                            type="text"
                            placeholder="Ej: REF-XXX"
                            readOnly={!isNewMaterial}
                            className={`w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 outline-none transition-all ${!isNewMaterial ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'}`}
                            value={formData.referencia}
                            onChange={(e) => isNewMaterial && setFormData({ ...formData, referencia: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nombre del Producto *</label>
                        <input
                            type="text"
                            required
                            placeholder="Nombre descriptivo del producto..."
                            readOnly={!isNewMaterial}
                            className={`w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 outline-none transition-all ${!isNewMaterial ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'}`}
                            value={formData.nombre}
                            onChange={(e) => isNewMaterial && setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Factura (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: FAC-12345"
                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            value={formData.factura_manual}
                            onChange={(e) => setFormData({ ...formData, factura_manual: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Bodega *</label>
                        <select
                            required
                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            value={formData.bodega}
                            onChange={(e) => setFormData({ ...formData, bodega: e.target.value })}
                        >
                            <option value="">Seleccionar bodega</option>
                            {bodegas.map(b => (
                                <option key={b.id} value={b.id}>{b.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 col-span-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Cantidad *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="0"
                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                value={formData.cantidad}
                                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Unidad *</label>
                            {isNewMaterial ? (
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
                            ) : (
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 outline-none cursor-not-allowed"
                                    value={formData.unidad}
                                />
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Precio *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                value={formData.precio}
                                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Fecha *</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Observaciones</label>
                        <textarea
                            placeholder="Información adicional (opcional)"
                            rows={2}
                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                        />
                    </div>
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
                        disabled={loading || (!isNewMaterial && !formData.materialId) || (isNewMaterial && !formData.nombre)}
                        className={`px-6 py-2 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm ${isNewMaterial ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                        {loading ? 'Procesando...' : isNewMaterial ? 'Crear y Registrar' : 'Registrar Entrada'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
