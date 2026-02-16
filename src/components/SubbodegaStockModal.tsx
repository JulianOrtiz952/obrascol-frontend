import React, { useState, useEffect } from 'react';
import { X, Package, Hash, Layers, Info, ChevronDown, ChevronRight } from 'lucide-react';
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
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen) {
            fetchStock();
        }
    }, [isOpen, subbodegaId, bodegaId]);

    const fetchStock = async () => {
        try {
            setLoading(true);
            const res = await bodegas.getStock(bodegaId, subbodegaId);
            setStock(res.data);

            // Initialize all groups as expanded
            const groups: Record<string, boolean> = {};
            res.data.forEach(item => {
                if (item.subbodega_nombre) groups[item.subbodega_nombre] = true;
            });
            setExpandedGroups(groups);
        } catch (error) {
            console.error('Error fetching subbodega stock:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    // Group stock by subbodega_nombre
    const groupedStock = stock.reduce((acc, item) => {
        const groupName = item.subbodega_nombre || 'Sin ubicación específica';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(item);
        return acc;
    }, {} as Record<string, BodegaStock[]>);

    // Calculate totals
    const totalItems = stock.length;
    const totalQuantity = stock.reduce((sum, item) => sum + Number(item.cantidad), 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-sm">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                {subbodegaName.includes(' > ') ? (
                                    subbodegaName.split(' > ').map((part, idx, arr) => (
                                        <React.Fragment key={idx}>
                                            <span className={idx === arr.length - 1 ? 'text-orange-600' : ''}>{part}</span>
                                            {idx < arr.length - 1 && <span className="mx-1 text-slate-300">/</span>}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <span>Ubicación: {subbodegaName}</span>
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 leading-none">Inventario Detallado</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Stats Summary */}
                {!loading && stock.length > 0 && (
                    <div className="px-8 py-4 bg-orange-50/50 border-b border-orange-100 flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Stock Total</span>
                            <span className="text-xl font-black text-orange-900 leading-none mt-1">{totalQuantity.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-8 bg-orange-200" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Productos Distintos</span>
                            <span className="text-xl font-black text-orange-900 leading-none mt-1">{totalItems}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-orange-100/50 rounded-lg text-orange-700">
                            <Info className="w-4 h-4" />
                            <span className="text-xs font-semibold">Cálculo Recursivo</span>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-0 overflow-y-auto flex-1 bg-slate-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-slate-500 animate-pulse">Consultando inventario recursivo...</p>
                        </div>
                    ) : stock.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-slate-50 mb-6 group-hover:scale-105 transition-transform duration-500">
                                <Package className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Sin Existencias</h3>
                            <p className="text-slate-500 text-sm max-w-[280px] mx-auto">No se encontraron materiales en esta ubicación ni en sus niveles inferiores.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 p-6">
                            {Object.entries(groupedStock).map(([groupName, items]) => (
                                <div key={groupName} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                                    {/* Group Header */}
                                    <button
                                        onClick={() => toggleGroup(groupName)}
                                        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 hover:bg-orange-50/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 group-hover:border-orange-200 group-hover:text-orange-500 transition-colors">
                                                {expandedGroups[groupName] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </div>
                                            <div className="text-left">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Ubicación</span>
                                                <span className="text-sm font-bold text-slate-700">{groupName.split(' > ').pop()}</span>
                                                <span className="text-[10px] text-slate-400 block mt-0.5">{groupName.includes(' > ') ? groupName : 'Nivel actual'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Items</span>
                                                <span className="text-sm font-black text-slate-900">{items.length}</span>
                                            </div>
                                            <div className="w-px h-6 bg-slate-200" />
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Stock Vol.</span>
                                                <span className="text-sm font-black text-orange-600">{items.reduce((sum, i) => sum + Number(i.cantidad), 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Group Content */}
                                    {expandedGroups[groupName] && (
                                        <div className="divide-y divide-slate-100 animate-in slide-in-from-top-2 duration-300">
                                            {items.map((item, idx) => (
                                                <div
                                                    key={`${item.id_material}-${item.id_subbodega}`}
                                                    className="grid grid-cols-12 px-6 py-4 hover:bg-orange-50/20 transition-colors items-center"
                                                >
                                                    <div className="col-span-1">
                                                        <span className="text-[10px] font-mono p-1 bg-slate-100 rounded text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                            {String(idx + 1).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-8 ml-4 flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-slate-900 truncate">
                                                            {item.nombre}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                                                <Hash className="w-3 h-3" /> {item.codigo}
                                                            </span>
                                                            {item.referencia && (
                                                                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 border border-slate-100 rounded italic truncate max-w-[120px]">
                                                                    Ref: {item.referencia}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-lg font-black text-slate-900 leading-none">
                                                                {item.cantidad.toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                                {item.unidad}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-4">
                    <p className="text-[10px] text-slate-400 italic mr-auto">
                        Los datos se agrupan por sub-ubicación para facilitar la lectura.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 text-sm font-black bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                    >
                        Cerrar Vista
                    </button>
                </div>
            </div>
        </div>
    );
}
