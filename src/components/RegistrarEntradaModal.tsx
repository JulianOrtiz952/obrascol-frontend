'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Material, Bodega, Marca } from '@/types';
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
    const [marcas, setMarcas] = useState<Marca[]>([]);

    const [formData, setFormData] = useState({
        barcode: '',
        materialId: '',
        codigo: '',
        referencia: '',
        nombre: '',
        bodega: '',
        marca: '',
        factura_manual: '',
        cantidad: '',
        unidad: 'pcs',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: '',
    });

    const [loading, setLoading] = useState(false);
    const [isNewMaterial, setIsNewMaterial] = useState(false);
    const [isCreatingMarca, setIsCreatingMarca] = useState(false);
    const [newMarcaName, setNewMarcaName] = useState('');
    const barcodeInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [matRes, bodRes, marRes] = await Promise.all([
                        api.get('materiales/'),
                        api.get('bodegas/'),
                        api.get('marcas/'),
                    ]);
                    setMateriales(matRes.data);
                    setBodegas(bodRes.data);
                    setMarcas(marRes.data);

                    // Auto-focus barcode field
                    setTimeout(() => barcodeInputRef.current?.focus(), 100);
                } catch (err) {
                    console.error('Error fetching form data:', err);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleCreateMarca = async () => {
        if (!newMarcaName.trim()) return;
        try {
            const res = await api.post('marcas/', { nombre: newMarcaName, activo: true });

            // Create the new list including the new brand
            const newMarca = res.data;
            setMarcas(prev => [...prev, newMarca]);

            // Set the selection immediately using the ID converted to string
            setFormData(prev => ({ ...prev, marca: newMarca.id.toString() }));

            setIsCreatingMarca(false);
            setNewMarcaName('');
        } catch (err) {
            console.error('Error creating marca:', err);
            alert('Error al crear la marca. Verifique que no exista ya.');
        }
    };

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
                unidad: mat.unidad,
                marca: mat.marca?.toString() || ''
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
                barcode: mat.codigo_barras || mat.codigo,
                marca: mat.marca?.toString() || ''
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
            let finalMarcaId = formData.marca;

            // Handle pending brand creation (if user forgot to click check)
            if (isCreatingMarca && newMarcaName.trim()) {
                try {
                    const marcaRes = await api.post('marcas/', { nombre: newMarcaName, activo: true });
                    const newMarca = marcaRes.data;
                    setMarcas(prev => [...prev, newMarca]);
                    finalMarcaId = newMarca.id.toString();
                    // Update form data so subsequent logic uses it
                    setFormData(prev => ({ ...prev, marca: finalMarcaId }));
                    // Clean up UI state
                    setIsCreatingMarca(false);
                    setNewMarcaName('');
                } catch (err) {
                    console.error('Error auto-creating brand:', err);
                    // Don't block submission but warn? Or maybe block? 
                    // Let's proceed with null brand if fails, but log it.
                }
            }
            if (isNewMaterial) {
                const matRes = await api.post('materiales/', {
                    codigo: formData.codigo,
                    codigo_barras: formData.barcode,
                    referencia: formData.referencia,
                    nombre: formData.nombre,
                    unidad: formData.unidad,
                    marca: finalMarcaId || null,
                    ultimo_precio: null
                });
                materialId = matRes.data.id;
            } else if (materialId && finalMarcaId) {
                // If existing material didn't have a brand but one was selected, update it
                const originalMat = materiales.find(m => m.id.toString() === materialId);
                if (originalMat && !originalMat.marca) {
                    try {
                        await api.patch(`materiales/${materialId}/`, { marca: parseInt(finalMarcaId) });
                    } catch (patchErr) {
                        console.error('Error updating material brand:', patchErr);
                        // We continue even if patch fails, as the movement is the priority
                    }
                }
            }

            // Handle Date vs DateTime for sorting
            // If selected date is today, use current time. Otherwise use 00:00 (default)
            const todayStr = new Date().toISOString().split('T')[0];
            const submitDate = formData.fecha === todayStr ? new Date().toISOString() : formData.fecha;

            await api.post('movimientos/', {
                material: materialId,
                bodega: formData.bodega,
                factura_manual: formData.factura_manual,
                marca: finalMarcaId || null,
                cantidad: parseInt(formData.cantidad),
                precio: null,
                fecha: submitDate,
                tipo: 'Entrada',
                observaciones: formData.observaciones
            });

            onSuccess();
            onClose();
            // Reset form
            setFormData({
                barcode: '', materialId: '', codigo: '', referencia: '', nombre: '',
                bodega: formData.bodega, // Keep bodega for convenience
                marca: '',
                factura_manual: '', cantidad: '', unidad: 'pcs',
                fecha: new Date().toISOString().split('T')[0],
                observaciones: ''
            });
            setIsNewMaterial(false);
            setIsCreatingMarca(false);
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
                        /* Existing Material View */
                        <div className="col-span-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-4 gap-4">
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Producto</p>
                                    <p className="text-slate-900 font-medium">{formData.nombre}</p>
                                    <p className="text-sm text-slate-500 font-mono mt-0.5">{formData.codigo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Referencia</p>
                                    <p className="text-slate-900">{formData.referencia || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Unidad</p>
                                    <p className="text-slate-900">{formData.unidad || '-'}</p>
                                </div>
                                {/* Show Brand if exists */}
                                {formData.marca && (
                                    <div className="col-span-4 pt-2 border-t border-slate-200 mt-2">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Marca Actual</p>
                                        <div className="text-slate-900 font-medium flex items-center gap-2">
                                            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-sm">
                                                {marcas.find(m => m.id.toString() === formData.marca)?.nombre || 'Desconocida'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* New Material Form */
                        <>
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

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Referencia</label>
                                <input
                                    type="text"
                                    placeholder="Ej: REF-XXX"
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    value={formData.referencia}
                                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Nombre del Producto *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre descriptivo del producto..."
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Marca</label>
                        {!isCreatingMarca ? (
                            <div className="flex gap-2">
                                <select
                                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:text-slate-500 disabled:cursor-not-allowed"
                                    value={formData.marca}
                                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                    disabled={!isNewMaterial && !!materiales.find(m => m.id.toString() === formData.materialId)?.marca}
                                >
                                    <option value="">Seleccionar marca...</option>
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
                        {isNewMaterial && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Unidad *</label>
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
                        )}
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
