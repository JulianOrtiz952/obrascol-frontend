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
    RotateCcw,
    ArrowRightLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { Movimiento, TipoMovimiento } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RegistrarEntradaModal } from '@/components/RegistrarEntradaModal';
import { RegistrarSalidaModal } from '@/components/RegistrarSalidaModal';
import { RegistrarTrasladoModal } from '@/components/RegistrarTrasladoModal';

export default function MovimientosPage() {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isEntradaOpen, setIsEntradaOpen] = useState(false);
    const [isSalidaOpen, setIsSalidaOpen] = useState(false);
    const [isTrasladoOpen, setIsTrasladoOpen] = useState(false);

    const fetchMovimientos = async () => {
        setLoading(true);
        try {
            const res = await api.get('movimientos/');
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
            case 'Traslado': return <Badge variant="info">Traslado</Badge>;
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
        <div className="p-4 md:p-8 max-w-[95vw] md:max-w-7xl mx-auto space-y-6 md:space-y-8">
            <header className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Historial de Movimientos</h1>
                <p className="text-sm md:text-base text-slate-500">Gestiona y consulta todos los movimientos de inventario</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 md:gap-4 mt-6">
                    <button
                        onClick={() => setIsEntradaOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-sm text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Registrar Entrada
                    </button>
                    <button
                        onClick={() => setIsSalidaOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-all shadow-sm text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Registrar Salida
                    </button>
                    <button
                        onClick={() => setIsTrasladoOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm text-sm col-span-1 sm:col-span-2 lg:col-span-1"
                    >
                        <ArrowRightLeft className="w-5 h-5" />
                        Traslado entre Bodegas
                    </button>
                </div>
            </header>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-3 md:gap-4 items-stretch lg:items-center">
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
                        <div className="flex gap-2">
                            <select className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
                                <option value="">Tipo</option>
                                <option value="Entrada">Entrada</option>
                                <option value="Salida">Salida</option>
                            </select>
                            <select className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
                                <option value="">Bodega</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Marca</th>
                                <th className="px-6 py-4">Cantidad</th>
                                <th className="px-6 py-4">Factura</th>
                                <th className="px-6 py-4">Bodega</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Observaciones</th>
                                <th className="px-6 py-4 text-center">Tipo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 10 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredMovimientos.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron movimientos.
                                    </td>
                                </tr>
                            ) : (
                                filteredMovimientos.map((mov) => (
                                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-all cursor-default group">
                                        <td className="px-6 py-4 font-medium text-slate-700">{mov.material_info.codigo}</td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{mov.material_info.nombre}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {mov.marca_info?.nombre || mov.material_info.marca_nombre || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-semibold">{mov.cantidad} {mov.material_info.unidad}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {mov.factura_manual || mov.factura_info?.numero || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {mov.tipo === 'Traslado' ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-slate-700">{mov.bodega_info.nombre}</span>
                                                    <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                                                    <span className="font-semibold text-blue-600">{mov.bodega_destino_info?.nombre}</span>
                                                </div>
                                            ) : (
                                                mov.bodega_info.nombre
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {format(new Date(mov.fecha), 'd/L/yyyy', { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {mov.usuario_info?.first_name} {mov.usuario_info?.last_name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium lowercase">
                                                    @{mov.usuario_info?.username || 'sistema'}
                                                </span>
                                            </div>
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
            <RegistrarTrasladoModal
                isOpen={isTrasladoOpen}
                onClose={() => setIsTrasladoOpen(false)}
                onSuccess={fetchMovimientos}
            />
        </div>
    );
}
