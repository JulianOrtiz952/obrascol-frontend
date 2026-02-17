'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Package,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    Box,
    Pencil
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api, { bodegas as bodegasApi } from '@/lib/api';
import { ResumenInventario, Bodega } from '@/types';
import { EditMaterialModal } from '@/components/EditMaterialModal';

function InventarioContent() {
    const searchParams = useSearchParams();
    const [inventario, setInventario] = useState<ResumenInventario[]>([]);
    const [bodegas, setBodegas] = useState<Bodega[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedBodega, setSelectedBodega] = useState<string>('');
    const [editingMaterial, setEditingMaterial] = useState<number | null>(null);

    useEffect(() => {
        const fetchBodegas = async () => {
            try {
                const res = await bodegasApi.getAll();
                setBodegas(res.data.results.filter(b => b.activo));
            } catch (err) {
                console.error('Error fetching bodegas:', err);
            }
        };
        fetchBodegas();
    }, []);

    useEffect(() => {
        const bodegaId = searchParams.get('bodega');
        if (bodegaId) {
            setSelectedBodega(bodegaId);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchInventario = async () => {
            try {
                const res = await api.get('movimientos/resumen_inventario/');
                setInventario(res.data);
            } catch (error) {
                console.error('Error fetching inventario:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInventario();
    }, []);

    const getEstadoBadge = (estado: 'Alto' | 'Medio' | 'Bajo') => {
        switch (estado) {
            case 'Alto': return <Badge variant="success">Alto</Badge>;
            case 'Medio': return <Badge variant="info">Medio</Badge>;
            case 'Bajo': return <Badge variant="warning">Bajo</Badge>;
            default: return <Badge>{estado}</Badge>;
        }
    };

    const filteredInventario = useMemo(() => {
        return inventario.filter(item => {
            const matchesSearch = item.nombre.toLowerCase().includes(search.toLowerCase()) ||
                item.codigo.toLowerCase().includes(search.toLowerCase()) ||
                item.referencia?.toLowerCase().includes(search.toLowerCase());

            const matchesBodega = !selectedBodega || item.id_bodega.toString() === selectedBodega;

            return matchesSearch && matchesBodega;
        });
    }, [inventario, search, selectedBodega]);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <header className="mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Box className="w-8 h-8 text-orange-500" />
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Inventario</h1>
                </div>
                <p className="text-sm md:text-base text-slate-500">Consulta y gestiona el stock de productos disponibles</p>
            </header>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
                    <div className="flex gap-2 items-center text-slate-600 text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </div>
                    <div className="flex flex-1 flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            value={selectedBodega}
                            onChange={(e) => setSelectedBodega(e.target.value)}
                        >
                            <option value="">Todas las Bodegas</option>
                            {bodegas.map(b => (
                                <option key={b.id} value={b.id}>{b.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Referencia</th>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Cantidad</th>
                                <th className="px-6 py-4">Bodega</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredInventario.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron productos en el inventario.
                                    </td>
                                </tr>
                            ) : (
                                filteredInventario.map((item, idx) => (
                                    <tr key={`${item.id_material}-${item.id_bodega}-${item.id_subbodega || 0}-${idx}`} className="hover:bg-slate-50/80 transition-all cursor-default group">
                                        <td className="px-6 py-4 font-medium text-slate-700">{item.codigo}</td>
                                        <td className="px-6 py-4 text-slate-500">{item.referencia || '-'}</td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{item.nombre}</td>
                                        <td className="px-6 py-4 text-slate-700 font-semibold">{item.cantidad} {item.unidad}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {item.bodega}
                                            {item.subbodega && (
                                                <span className="block text-[10px] text-slate-400 italic">{item.subbodega}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getEstadoBadge(item.estado)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setEditingMaterial(item.id_material)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar producto"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Edit Modal */}
            {editingMaterial && (
                <EditMaterialModal
                    isOpen={true}
                    onClose={() => setEditingMaterial(null)}
                    onSuccess={() => {
                        setEditingMaterial(null);
                        const fetchInventario = async () => {
                            try {
                                const res = await api.get('movimientos/resumen_inventario/');
                                setInventario(res.data);
                            } catch (error) {
                                console.error('Error fetching inventario:', error);
                            }
                        };
                        fetchInventario();
                    }}
                    materialId={editingMaterial}
                />
            )}
        </div>
    );
}

export default function InventarioPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        }>
            <InventarioContent />
        </Suspense>
    );
}
