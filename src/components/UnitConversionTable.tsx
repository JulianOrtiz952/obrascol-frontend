'use client';

import React from 'react';
import { Beaker, Droplets, Box, Package, Layers, Info } from 'lucide-react';

export function UnitConversionTable() {
    const categories = [
        {
            title: 'Líquidos y Combustibles',
            icon: <Droplets className="w-4 h-4 text-blue-500" />,
            items: [
                { unit: 'Bidón', equiv: '55 Galones / 208 Litros' },
                { unit: 'Cuñete', equiv: '5 Galones / 18.9 Litros' },
                { unit: 'Balde', equiv: '2.5 Galones / 9.5 Litros' },
                { unit: 'Galón', equiv: '3.78 Litros' },
                { unit: 'Litro', equiv: '1000 ml' },
            ]
        },
        {
            title: 'Sólidos y Construcción',
            icon: <Layers className="w-4 h-4 text-orange-500" />,
            items: [
                { unit: 'Tonelada', equiv: '1000 Kilos / 20 Bultos' },
                { unit: 'Bulto (Cem)', equiv: '50 Kilos' },
                { unit: 'Kilo', equiv: '1000 Gramos / 2.2 Libras' },
                { unit: 'Libra', equiv: '500 Gramos' },
            ]
        },
        {
            title: 'Mecánica y Repuestos',
            icon: <Package className="w-4 h-4 text-emerald-500" />,
            items: [
                { unit: 'Set / Juego', equiv: 'Varia según kit' },
                { unit: 'Unidad', equiv: '1 pieza indivisible' },
                { unit: 'Par', equiv: '2 Unidades' },
                { unit: 'Docena', equiv: '12 Unidades' },
            ]
        },
        {
            title: 'Aseo y Misceláneos',
            icon: <Box className="w-4 h-4 text-purple-500" />,
            items: [
                { unit: 'Caja', equiv: 'Varia (ver empaque)' },
                { unit: 'Paquete', equiv: 'Varia (ver empaque)' },
                { unit: 'Resma', equiv: '500 Hojas' },
                { unit: 'Bolsa', equiv: 'Múltiples unidades' },
            ]
        }
    ];

    return (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">Equivalencias de Unidades</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {categories.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            {cat.icon}
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{cat.title}</h4>
                        </div>
                        <div className="space-y-1">
                            {cat.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                                    <span className="text-xs font-semibold text-slate-700">{item.unit}</span>
                                    <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm leading-none">
                                        {item.equiv}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 p-3 mt-auto">
                <p className="text-[10px] text-blue-600 font-medium leading-tight">
                    * Use estas equivalencias como guía para estandarizar el ingreso de existencias.
                </p>
            </div>
        </div>
    );
}
