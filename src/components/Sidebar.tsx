'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    History,
    Package,
    MapPin,
    Book,
    LogOut,
    ChevronRight,
    PackageSearch
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Bienvenida', icon: LayoutDashboard, href: '/' },
    { name: 'Movimientos', icon: History, href: '/movimientos' },
    { name: 'Inventario', icon: Package, href: '/inventario' },
    { name: 'Productos', icon: PackageSearch, href: '/materiales' },
    { name: 'Bodegas', icon: MapPin, href: '/bodegas' },
    { name: 'Diccionario', icon: Book, href: '/diccionario' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                        O
                    </div>
                    <span className="text-xl font-bold text-slate-800">Obrascol</span>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-orange-50 text-orange-600 font-medium"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600")} />
                                    <span>{item.name}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-medium">
                        JP
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">Juan Pérez</span>
                        <span className="text-xs text-slate-500">Administrador</span>
                    </div>
                </div>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                    <LogOut className="w-5 h-5" />
                    <span>Salir</span>
                </button>
            </div>
        </aside>
    );
}
