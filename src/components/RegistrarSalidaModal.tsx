'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Material, Bodega } from '@/types';
import { Modal } from './ui/Modal';
import { Save, AlertCircle, Scan, Tag, Type, Search } from 'lucide-react';

interface StockItem {
    id_material: number;
    codigo: string;
    referencia?: string;
    nombre: string;
    cantidad: number;
    unidad: string;
    id_subbodega?: number;
    subbodega_nombre?: string;
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
        subbodega: '',
        cantidad: '',
    });

    const [searchType, setSearchType] = useState<'barcode' | 'reference' | 'name'>('barcode');
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingStock, setFetchingStock] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const bodRes = await api.get('bodegas/');
                    setBodegas(bodRes.data);
                } catch (err) {
                    console.error('Error fetching bodegas:', err);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleTabChange = (type: 'barcode' | 'reference' | 'name') => {
        setSearchType(type);
        setSearchValue('');
        setSelectedStockItem(null);
        setFormData(prev => ({ ...prev, material: '' }));
    };

    const handleBodegaChange = async (id: string) => {
        setFormData(prev => ({ ...prev, bodega: id, subbodega: '', material: '' }));
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

    const handleSearchChange = (val: string) => {
        setSearchValue(val);
        // Reset selection if user is typing (except for exact barcode match)
        let item = null;
        if (searchType === 'barcode') {
            item = availableStock.find(s => s.codigo.toLowerCase() === val.toLowerCase());
        }
        // For reference and name, we explicitly DON'T auto-select here.
        // The user must click from the dropdown.

        if (item) {
            setSelectedStockItem(item);
            setFormData(prev => ({ ...prev, material: item.id_material.toString() }));
        } else {
            setSelectedStockItem(null);
            setFormData(prev => ({ ...prev, material: '' }));
        }
    };

    const handleMaterialManualSelect = (id: string, subId?: number) => {
        const item = availableStock.find(s => s.id_material.toString() === id && s.id_subbodega === subId);
        setSelectedStockItem(item || null);
        setFormData(prev => ({ ...prev, material: id, subbodega: subId?.toString() || '' }));
        if (item) setSearchValue(item.codigo);
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
                subbodega: formData.subbodega || null,
                cantidad: parseInt(formData.cantidad),
                precio: null,
                tipo: 'Salida'
            });

            onSuccess();
            onClose();
            setFormData({ material: '', bodega: '', subbodega: '', cantidad: '' });
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-1.5">
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

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Ubicación (Subbodega)</label>
                        <select
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all bg-white"
                            value={formData.subbodega}
                            onChange={(e) => {
                                const subId = e.target.value;
                                setFormData(prev => ({ ...prev, subbodega: subId, material: '' }));
                                setSelectedStockItem(null);
                            }}
                            disabled={!formData.bodega}
                        >
                            <option value="">Todas las ubicaciones</option>
                            {bodegas.find(b => b.id.toString() === formData.bodega)?.subbodegas
                                ?.filter(sb => sb.activo)
                                .sort((a, b) => (a.full_path || a.nombre).localeCompare(b.full_path || b.nombre))
                                .map(sb => (
                                    <option key={sb.id} value={sb.id}>
                                        {sb.full_path || sb.nombre}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="col-span-2 space-y-3.5">
                        <label className="text-sm font-semibold text-slate-700">Seleccionar Material *</label>

                        {/* Search Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-1">
                            <button
                                type="button"
                                onClick={() => handleTabChange('barcode')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${searchType === 'barcode' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Scan className="w-3.5 h-3.5" />
                                Código
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange('reference')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${searchType === 'reference' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Tag className="w-3.5 h-3.5" />
                                Referencia
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange('name')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${searchType === 'name' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Type className="w-3.5 h-3.5" />
                                Nombre
                            </button>
                        </div>

                        <div className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${searchType === 'barcode' ? 'bg-orange-50/50 border-orange-100' :
                            searchType === 'reference' ? 'bg-blue-50/50 border-blue-100' :
                                'bg-emerald-50/50 border-emerald-100'
                            }`}>
                            <input
                                type="text"
                                disabled={!formData.bodega || fetchingStock}
                                placeholder={
                                    !formData.bodega ? "Primero seleccione bodega" :
                                        searchType === 'barcode' ? "Escanee o escriba el código..." :
                                            searchType === 'reference' ? "Escriba la referencia..." :
                                                "Escriba el nombre..."
                                }
                                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900 outline-none transition-all ${searchType === 'barcode' ? 'border-orange-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-mono' :
                                    searchType === 'reference' ? 'border-blue-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500' :
                                        'border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500'
                                    }`}
                                value={searchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />

                            {/* Dropdown for results if needed or just confirmation */}
                            {searchValue && !selectedStockItem && !fetchingStock && formData.bodega && (
                                <div className="mt-2 p-2 bg-white border border-slate-100 rounded-lg shadow-sm max-h-40 overflow-y-auto space-y-1 z-10 relative">
                                    {availableStock
                                        .filter(s => {
                                            const matchesSearch = searchType === 'barcode' ? s.codigo.toLowerCase().includes(searchValue.toLowerCase()) :
                                                searchType === 'reference' ? (s.referencia?.toLowerCase() || '').includes(searchValue.toLowerCase()) :
                                                    s.nombre.toLowerCase().includes(searchValue.toLowerCase());
                                            const matchesSubbodega = !formData.subbodega || s.id_subbodega?.toString() === formData.subbodega;
                                            return matchesSearch && matchesSubbodega;
                                        })
                                        .map(s => (
                                            <button
                                                key={`${s.id_material}-${s.id_subbodega}`}
                                                type="button"
                                                onClick={() => handleMaterialManualSelect(s.id_material.toString(), s.id_subbodega)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-md transition-colors border border-transparent hover:border-slate-100"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-slate-900">{s.nombre}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{s.codigo}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[10px] text-slate-500 italic">
                                                        {s.subbodega_nombre || 'General'} | Ref: {s.referencia || '-'}
                                                    </span>
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 rounded font-bold">Stock: {s.cantidad}</span>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            )}

                            {selectedStockItem && (
                                <div className={`mt-2 flex items-center justify-between p-2.5 rounded-lg border border-white/50 animate-in fade-in slide-in-from-top-2 duration-300 ${searchType === 'barcode' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' :
                                    searchType === 'reference' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' :
                                        'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                    }`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-white/20 rounded-lg">
                                            {searchType === 'barcode' ? <Scan className="w-3.5 h-3.5" /> :
                                                searchType === 'reference' ? <Tag className="w-3.5 h-3.5" /> :
                                                    <Type className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-tight leading-none mb-0.5">Seleccionado</p>
                                            <p className="text-sm font-extrabold leading-none">{selectedStockItem.nombre}</p>
                                        </div>
                                    </div>
                                    <div className="text-right border-l border-white/20 pl-4">
                                        <p className="text-[10px] font-bold opacity-80 uppercase leading-none mb-0.5">Stock Origen</p>
                                        <p className="text-base font-black leading-none">{selectedStockItem.cantidad} <span className="text-xs opacity-80">{selectedStockItem.unidad}</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
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
