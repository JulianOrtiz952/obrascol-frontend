'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, PowerOff, Package, MapPin, Trash2 } from 'lucide-react';
import { Bodega, BodegaStock } from '@/types';
import { bodegas } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import CreateBodegaModal from '@/components/CreateBodegaModal';
import EditBodegaModal from '@/components/EditBodegaModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import SubbodegaManager from '@/components/SubbodegaManager';
import WarehouseStockView from '@/components/WarehouseStockView';

export default function BodegasPage() {
    const [bodegasList, setBodegasList] = useState<Bodega[]>([]);
    const [selectedBodega, setSelectedBodega] = useState<Bodega | null>(null);
    const [activeTab, setActiveTab] = useState<'stock' | 'locations'>('stock');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [incluirInactivas, setIncluirInactivas] = useState(false);
    const [loading, setLoading] = useState(true);

    // Confirm Modal state
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        bodega: Bodega | null;
    }>({
        isOpen: false,
        bodega: null
    });

    useEffect(() => {
        fetchBodegas();
    }, [incluirInactivas]);

    const fetchBodegas = async () => {
        try {
            setLoading(true);
            const response = await bodegas.getAll(incluirInactivas);
            setBodegasList(response.data.results);

            // Re-select bodega to update its subbodegas/info if it was selected
            if (selectedBodega) {
                const updated = response.data.results.find(b => b.id === selectedBodega.id);
                if (updated) setSelectedBodega(updated);
            }
        } catch (error) {
            console.error('Error fetching bodegas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBodega = (bodega: Bodega) => {
        if (selectedBodega?.id === bodega.id) {
            setSelectedBodega(null);
        } else {
            setSelectedBodega(bodega);
            setActiveTab('stock');
        }
    };

    const handleConfirmToggle = (bodega: Bodega) => {
        setConfirmState({
            isOpen: true,
            bodega
        });
    };

    const handleToggleActivo = async () => {
        const { bodega } = confirmState;
        if (!bodega) return;

        try {
            await bodegas.toggleActivo(bodega.id);
            fetchBodegas();
            if (selectedBodega?.id === bodega.id) {
                setSelectedBodega(null);
                setStock([]);
            }
        } catch (error) {
            console.error('Error toggling bodega:', error);
        }
    };

    const handleEdit = (bodega: Bodega) => {
        setSelectedBodega(bodega);
        setShowEditModal(true);
    };

    return (
        <div className="p-8 w-full">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Bodegas</h1>
                    <p className="text-lg text-slate-500">Gestiona las bodegas y visualiza su inventario</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Bodega
                </button>
            </header>

            <div className="mb-6 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={incluirInactivas}
                        onChange={(e) => setIncluirInactivas(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-slate-600">Incluir bodegas inactivas</span>
                </label>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    <p className="mt-4 text-slate-500">Cargando bodegas...</p>
                </div>
            ) : bodegasList.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No hay bodegas</h3>
                    <p className="text-slate-500 mb-6">Crea tu primera bodega para comenzar</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all"
                    >
                        Crear Bodega
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {bodegasList.map((bodega) => (
                        <div
                            key={bodega.id}
                            className={`bg-white border rounded-2xl shadow-sm transition-all ${selectedBodega?.id === bodega.id
                                ? 'border-orange-500 shadow-md ring-2 ring-orange-100'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold text-slate-900">{bodega.nombre}</h3>
                                            <Badge variant={bodega.activo ? 'success' : 'neutral'}>
                                                {bodega.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {bodega.ubicacion || 'Sin ubicación'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg">
                                    <Package className="w-4 h-4" />
                                    <span className="font-medium">{bodega.materiales_count || 0}</span>
                                    <span>materiales en total.</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleSelectBodega(bodega)}
                                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all text-sm"
                                    >
                                        {selectedBodega?.id === bodega.id ? 'Ocultar' : 'Ver Detalles'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(bodega)}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleConfirmToggle(bodega)}
                                        className={`p-2 rounded-lg transition-all ${bodega.activo
                                            ? 'text-orange-600 hover:bg-orange-50'
                                            : 'text-emerald-600 hover:bg-emerald-50'
                                            }`}
                                        title={bodega.activo ? 'Desactivar' : 'Activar'}
                                    >
                                        {bodega.activo ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {selectedBodega?.id === bodega.id && (
                                <div className="border-t border-slate-200 p-6 bg-slate-50 rounded-b-2xl">
                                    {/* Tabs for details */}
                                    <div className="flex border-b border-slate-200 mb-4">
                                        <button
                                            onClick={() => setActiveTab('stock')}
                                            className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'stock' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Stock por Ubicación
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('locations')}
                                            className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'locations' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Ubicaciones
                                        </button>
                                    </div>

                                    {activeTab === 'stock' ? (
                                        <WarehouseStockView bodegaId={bodega.id} />
                                    ) : (
                                        <SubbodegaManager
                                            bodegaId={bodega.id}
                                            onUpdate={fetchBodegas}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateBodegaModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchBodegas();
                    }}
                />
            )}

            {showEditModal && selectedBodega && (
                <EditBodegaModal
                    bodega={selectedBodega}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedBodega(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedBodega(null);
                        fetchBodegas();
                    }}
                />
            )}

            {/* Styled Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={handleToggleActivo}
                title={confirmState.bodega?.activo ? "Desactivar Bodega" : "Activar Bodega"}
                message={`¿Estás seguro de que deseas ${confirmState.bodega?.activo ? 'desactivar' : 'activar'} la bodega "${confirmState.bodega?.nombre}"?`}
                confirmText={confirmState.bodega?.activo ? "Desactivar" : "Activar"}
                variant={confirmState.bodega?.activo ? "danger" : "success"}
            />
        </div>
    );
}
