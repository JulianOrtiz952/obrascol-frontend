'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, Hash, Layers } from 'lucide-react';
import { bodegas } from '@/lib/api';
import { BodegaStock } from '@/types';

interface SubbodegaStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    subbodegaName: string;
    subbodegaId: number;
    bodegaId: number;
}

export default function SubbodegaStockModal({
    isOpen,
    onClose,
    subbodegaName,
    subbodegaId,
    bodegaId
}: SubbodegaStockModalProps) {
    const [stock, setStock] = useState<BodegaStock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchStock();
        }
    }, [isOpen, subbodegaId, bodegaId]);

    const fetchStock = async () => {
        try {
            setLoading(true);
            const res = await bodegas.getStock(bodegaId);
            // Filter stock for this specific sub-warehouse
            const filtered = res.data.filter(item => item.id_subbodega === subbodegaId);
            setStock(filtered);
        } catch (error) {
            console.error('Error fetching subbodega stock:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Stock: {subbodegaName}</h3>
                            <p className="text-xs text-slate-500">Listado de materiales en esta ubicación</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-500 animate-pulse">Consultando inventario...</p>
                        </div>
                    ) : stock.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 transition-transform hover:scale-105 duration-300">
                                <Package className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-semibold mb-1">Sin materiales</h3>
                            <p className="text-slate-500 text-sm max-w-[240px] mx-auto">Esta ubicación no tiene existencias registradas actualmente.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {stock.map((item) => (
                                <div
                                    key={item.id_material}
                                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-orange-200 hover:bg-white transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                                {item.nombre}
                                            </span>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                                    <Hash className="w-3 h-3" /> {item.codigo}
                                                </span>
                                                {item.referencia && (
                                                    <span className="text-[10px] text-slate-400 italic">
                                                        Ref: {item.referencia}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900 leading-none">
                                                {item.cantidad}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                                                {item.unidad}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
