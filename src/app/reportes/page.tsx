'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Package, ArrowDown, ArrowUp } from 'lucide-react';
import { formatCustomNumber } from '@/lib/utils';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function ReportesPage() {
    const [resumen, setResumen] = useState<any>(null);
    const [topEntradas, setTopEntradas] = useState<any[]>([]);
    const [topSalidas, setTopSalidas] = useState<any[]>([]);
    const [preciosPromedio, setPreciosPromedio] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportes = async () => {
            try {
                const [resRes, entRes, salRes, promRes] = await Promise.all([
                    api.get('reportes/resumen_general/'),
                    api.get('reportes/top_marcas_entradas/'),
                    api.get('reportes/top_marcas_salidas/'),
                    api.get('reportes/productos_promedio/')
                ]);
                setResumen(resRes.data);
                setTopEntradas(entRes.data);
                setTopSalidas(salRes.data);
                setPreciosPromedio(promRes.data);
            } catch (err) {
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReportes();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Cargando reportes...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Panel de Reportes</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                        <ArrowDown className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Entradas</p>
                        <h3 className="text-2xl font-bold text-slate-900">{resumen?.total_entradas}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
                        <ArrowUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Salidas</p>
                        <h3 className="text-2xl font-bold text-slate-900">{resumen?.total_salidas}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Marcas Activas</p>
                        <h3 className="text-2xl font-bold text-slate-900">{resumen?.total_marcas_activas}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Entradas por Marca */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Top Marcas (Entradas)</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topEntradas} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="marca__nombre" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="total_cantidad" fill="#f97316" radius={[0, 4, 4, 0]} name="Cantidad" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Salidas por Marca */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Top Marcas (Salidas)</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topSalidas}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="total_cantidad"
                                    nameKey="marca__nombre"
                                >
                                    {topSalidas.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Average Prices Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800">Precios Promedio por Producto</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Marca</th>
                                <th className="px-6 py-4 text-right">Precio Promedio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {preciosPromedio.map((item: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500">{item.codigo}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.nombre}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.marca}</td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-600 font-medium">
                                        ${formatCustomNumber(item.precio_promedio)}
                                    </td>
                                </tr>
                            ))}
                            {preciosPromedio.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No hay datos disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
