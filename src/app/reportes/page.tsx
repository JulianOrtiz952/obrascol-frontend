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
import { Package, ArrowDown, ArrowUp, Shield } from 'lucide-react';
import { formatCustomNumber } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function ReportesPage() {
    const { user } = useAuth();
    const [resumen, setResumen] = useState<any>(null);
    const [topEntradas, setTopEntradas] = useState<any[]>([]);
    const [topSalidas, setTopSalidas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchReportes = async () => {
            try {
                const [resRes, entRes, salRes] = await Promise.all([
                    api.get('reportes/resumen_general/'),
                    api.get('reportes/top_marcas_entradas/'),
                    api.get('reportes/top_marcas_salidas/')
                ]);
                setResumen(resRes.data);
                setTopEntradas(entRes.data);
                setTopSalidas(salRes.data);
            } catch (err) {
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReportes();
    }, [user]);

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

        </div >
    );
}
