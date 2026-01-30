'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Material, Bodega } from '@/types';
import { Modal } from './ui/Modal';
import { Save, AlertCircle } from 'lucide-react';

interface StockItem {
    id_material: number;
    codigo: string;
    nombre: string;
    cantidad: number;
    unidad: string;
}

interface RegistrarSalidaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function RegistrarSalidaModal({ isOpen, onClose, onSuccess }: RegistrarSalidaModalProps) {
    const [bodegas, setBodegas] = useState<Bodega[]>([]);
    const [availableStock, setAvailableStock] = useState<StockItem[]>([]);
    const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);

    const [formData, setFormData] = useState({
        material: '',
        bodega: '',
        cantidad: '',
        precio: '',
    });

    const [loading, setLoading] = useState(false);
    const [fetchingStock, setFetchingStock] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const bodRes = await api.get('/bodegas/');
                    setBodegas(bodRes.data);
                } catch (err) {
                    console.error('Error fetching bodegas:', err);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleBodegaChange = async (id: string) => {
        setFormData(prev => ({ ...prev, bodega: id, material: '' }));
        setSelectedStockItem(null);
        setAvailableStock([]);

        if (id) {
            setFetchingStock(true);
            try {
                const stockRes = await api.get(`/bodegas/${id}/stock_actual/`);
                setAvailableStock(stockRes.data);
            } catch (err) {
                console.error('Error fetching warehouse stock:', err);
            } finally {
                setFetchingStock(false);
            }
        }
    };

    const handleMaterialChange = (id: string) => {
        const item = availableStock.find(s => s.id_material.toString() === id);
        setSelectedStockItem(item || null);
        setFormData(prev => ({ ...prev, material: id }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedStockItem && parseInt(formData.cantidad) > selectedStockItem.cantidad) {
            alert(`Stock insuficiente. Disponible: ${selectedStockItem.cantidad}`);
            return;
        }

        setLoading(true);
        try {
            await api.post('movimientos/', {
                material: formData.material,
                bodega: formData.bodega,
                cantidad: parseInt(formData.cantidad),
                precio: parseFloat(formData.precio) || 0,
                tipo: 'Salida'
            });

            onSuccess();
            onClose();
            setFormData({ material: '', bodega: '', cantidad: '', precio: '' });
            setSelectedStockItem(null);
        } catch (err: any) {
            console.error('Error submitting movement:', err);
            const errorMsg = err.response?.data?.non_field_errors?.[0] || 'Error al registrar la salida.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Salida de Material">
            <p className="text-slate-500 text-sm mb-6 -mt-2">Seleccione la bodega de origen para ver los materiales disponibles.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Bodega de Origen *</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all bg-white"
                            value={formData.bodega}
                            onChange={(e) => handleBodegaChange(e.target.value)}
                        >
                            <option value="" className="text-slate-400">Seleccione bodega...</option>
                            {bodegas.map(b => (
                                <option key={b.id} value={b.id} className="text-slate-900">{b.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Material *</label>
                        <select
                            required
                            disabled={!formData.bodega || fetchingStock}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
                            value={formData.material}
                            onChange={(e) => handleMaterialChange(e.target.value)}
                        >
                            <option value="">
                                {fetchingStock ? 'Cargando inventario...' : !formData.bodega ? 'Primero seleccione bodega' : availableStock.length === 0 ? 'Sin stock disponible' : 'Seleccione material con stock...'}
                            </option>
                            {availableStock.map(s => (
                                <option key={s.id_material} value={s.id_material}>
                                    {s.codigo} - {s.nombre} (Stock: {s.cantidad} {s.unidad})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-slate-700">Cantidad *</label>
                            {selectedStockItem && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                    Máx: {selectedStockItem.cantidad}
                                </span>
                            )}
                        </div>
                        <input
                            type="number"
                            required
                            min="1"
                            max={selectedStockItem?.cantidad}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all bg-white"
                            value={formData.cantidad}
                            onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Precio (Referencia)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all bg-white"
                                value={formData.precio}
                                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            />
                        </div>
                    </div>

                    {selectedStockItem && parseInt(formData.cantidad) > selectedStockItem.cantidad && (
                        <div className="col-span-2 flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 italic text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>La cantidad supera el stock disponible en esta bodega.</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!!(loading || !formData.material || !formData.cantidad || (selectedStockItem && parseInt(formData.cantidad) > selectedStockItem.cantidad))}
                        className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                        {loading ? 'Procesando...' : 'Registrar Salida'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
