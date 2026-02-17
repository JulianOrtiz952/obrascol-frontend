'use client';

import React, { useState, useEffect } from 'react';
import { Package, MapPin } from 'lucide-react';
import { BodegaStock } from '@/types';
import { bodegas } from '@/lib/api';

interface WarehouseStockViewProps {
    bodegaId: number;
}

export default function WarehouseStockView({ bodegaId }: WarehouseStockViewProps) {
    const [stock, setStock] = useState<BodegaStock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                setLoading(true);
                const response = await bodegas.getStock(bodegaId);
                setStock(response.data);
            } catch (error) {
                console.error('Error fetching stock:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, [bodegaId]);

    const stockBySubbodega = stock.reduce((acc, item) => {
        const subName = item.subbodega_nombre || 'General';
        if (!acc[subName]) acc[subName] = [];
        acc[subName].push(item);
        return acc;
    }, {} as Record<string, BodegaStock[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.keys(stockBySubbodega).length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 italic">No hay materiales en stock</p>
                </div>
            ) : (
                Object.entries(stockBySubbodega)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([subName, items]) => (
                        <div key={subName} className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                    <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {subName.split(' > ').map((part, idx, arr) => (
                                            <React.Fragment key={idx}>
                                                <span className={idx === arr.length - 1 ? 'text-slate-700' : ''}>{part}</span>
                                                {idx < arr.length - 1 && <span className="text-slate-300">/</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">{items.length} ITEMS</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {items.map((item) => (
                                    <div
                                        key={`${item.id_material}-${item.id_subbodega}`}
                                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-orange-200 transition-all shadow-sm group"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="font-bold text-slate-900 text-sm truncate group-hover:text-orange-950">{item.nombre}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
                                                    {item.codigo}
                                                </span>
                                                {item.referencia && (
                                                    <>
                                                        <span className="text-slate-200">|</span>
                                                        <span className="text-[10px] text-slate-400 font-bold truncate">
                                                            {item.referencia}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-slate-900 text-lg leading-tight">{item.cantidad}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{item.unidad}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
}
