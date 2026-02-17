'use client';

import React, { useState } from 'react';
import { X, Warehouse, MapPin, Package } from 'lucide-react';
import { Bodega } from '@/types';
import WarehouseStockView from './WarehouseStockView';
import SubbodegaManager from './SubbodegaManager';

interface WarehouseDetailsModalProps {
    bodega: Bodega | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function WarehouseDetailsModal({ bodega, isOpen, onClose }: WarehouseDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<'stock' | 'locations'>('stock');

    if (!isOpen || !bodega) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <header className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-sm">
                            <Warehouse className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                                {bodega.nombre}
                            </h2>
                            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                <MapPin className="w-3 h-3 text-orange-400" />
                                {bodega.ubicacion || 'Sin ubicación específica'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </header>

                {/* Tabs */}
                <div className="px-8 bg-slate-50/50 border-b border-slate-100 flex gap-8">
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`py-4 text-xs font-black uppercase tracking-[0.2em] relative transition-colors ${activeTab === 'stock' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Stock Disponible
                        {activeTab === 'stock' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-full animate-in slide-in-from-bottom-1 duration-300" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('locations')}
                        className={`py-4 text-xs font-black uppercase tracking-[0.2em] relative transition-colors ${activeTab === 'locations' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Mapa de Ubicaciones
                        {activeTab === 'locations' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-full animate-in slide-in-from-bottom-1 duration-300" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-white to-slate-50/30">
                    {activeTab === 'stock' ? (
                        <WarehouseStockView bodegaId={bodega.id} />
                    ) : (
                        <div className="max-w-2xl mx-auto">
                            <SubbodegaManager bodegaId={bodega.id} readOnly={true} />
                        </div>
                    )}
                </div>

                {/* Footer (Info only) */}
                <footer className="p-4 md:p-6 bg-white border-t border-slate-100 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <Package className="w-3 h-3" />
                        Vista de solo lectura
                    </div>
                </footer>
            </div>
        </div>
    );
}
