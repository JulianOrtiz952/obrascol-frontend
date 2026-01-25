'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    AlertCircle,
    RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { Movimiento, TipoMovimiento } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RegistrarEntradaModal } from '@/components/RegistrarEntradaModal';
import { RegistrarSalidaModal } from '@/components/RegistrarSalidaModal';

export default function MovimientosPage() {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isEntradaOpen, setIsEntradaOpen] = useState(false);
    const [isSalidaOpen, setIsSalidaOpen] = useState(false);

    const fetchMovimientos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/movimientos/');
            setMovimientos(res.data);
        } catch (error) {
            console.error('Error fetching movimientos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovimientos();
    }, []);

    const getTipoBadge = (tipo: TipoMovimiento) => {
        switch (tipo) {
            case 'Entrada': return <Badge variant="success">Entrada</Badge>;
            case 'Salida': return <Badge variant="danger">Salida</Badge>;
            case 'Edicion': return <Badge variant="info">Edición</Badge>;
            case 'Ajuste': return <Badge variant="neutral">Ajuste</Badge>;
            case 'Devolucion': return <Badge variant="warning">Devolución</Badge>;
            default: return <Badge>{tipo}</Badge>;
        }
    };

    const filteredMovimientos = movimientos.filter(mov =>
        mov.material_info.nombre.toLowerCase().includes(search.toLowerCase()) ||
        mov.material_info.codigo.toLowerCase().includes(search.toLowerCase()) ||
        mov.material_info.referencia?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Historial de Movimientos</h1>
                <p className="text-slate-500">Gestiona y consulta todos los movimientos de inventario</p>

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => setIsEntradaOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Registrar Entrada
                    </button>
                    <button
                        onClick={() => setIsSalidaOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-all shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Registrar Salida
                    </button>
                </div>
            </header>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2 items-center text-slate-600 text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </div>
                    <div className="flex flex-1 min-w-[300px] gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por código, referencia o nombre..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
                            <option value="">Tipo de movimiento</option>
                            <option value="Entrada">Entrada</option>
                            <option value="Salida">Salida</option>
                        </select>
                        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
                            <option value="">Bodega</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Cantidad</th>
                                <th className="px-6 py-4">Factura</th>
                                <th className="px-6 py-4">Bodega</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Observaciones</th>
                                <th className="px-6 py-4 text-center">Tipo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 9 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredMovimientos.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron movimientos.
                                    </td>
                                </tr>
                            ) : (
                                filteredMovimientos.map((mov) => (
                                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-all cursor-default group">
                                        <td className="px-6 py-4 font-medium text-slate-700">{mov.material_info.codigo}</td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{mov.material_info.nombre}</td>
                                        <td className="px-6 py-4 text-slate-700 font-semibold">{mov.cantidad} {mov.material_info.unidad}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {mov.factura_manual || mov.factura_info?.numero || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{mov.bodega_info.nombre}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {format(new Date(mov.fecha), 'd/L/yyyy', { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={mov.observaciones}>
                                            {mov.observaciones || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getTipoBadge(mov.tipo)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <RegistrarEntradaModal
                isOpen={isEntradaOpen}
                onClose={() => setIsEntradaOpen(false)}
                onSuccess={fetchMovimientos}
            />
            <RegistrarSalidaModal
                isOpen={isSalidaOpen}
                onClose={() => setIsSalidaOpen(false)}
                onSuccess={fetchMovimientos}
            />
        </div>
    );
}
