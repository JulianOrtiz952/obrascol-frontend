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
    PieChart,
    Box,
    Users,
    UsersRound,
    Ruler,
    Menu,
    X as CloseIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Topbar() {
    const pathname = usePathname();
    const { user, logout, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    if (loading || !user) return null;

    const navItems = [
        { name: 'Bienvenida', icon: LayoutDashboard, href: '/' },
        { name: 'Movimientos', icon: History, href: '/movimientos' },
        { name: 'Inventario', icon: Package, href: '/inventario' },
        { name: 'Bodegas', icon: MapPin, href: '/bodegas' },
        { name: 'Reportes', icon: PieChart, href: '/reportes' },
        { name: 'Marcas', icon: Box, href: '/marcas' },
        { name: 'Unidades', icon: Ruler, href: '/unidades' },
        { name: 'Usuarios', icon: UsersRound, href: '/usuarios', roles: ['superusuario'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        !item.roles || (user && item.roles.includes(user.rol))
    );

    const getInitials = (name: string, lastName: string) => {
        return `${name?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || user.username.slice(0, 2).toUpperCase();
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 md:px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 lg:gap-8">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 lg:hidden text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-orange-600/20">
                        O
                    </div>
                    <span className="text-lg md:text-xl font-bold text-slate-800">Obrascol</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-1">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium",
                                    isActive
                                        ? "bg-orange-50 text-orange-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("w-4 h-4", isActive ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600")} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3 pr-2 md:pr-4 border-r border-slate-200">
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">
                            {user.first_name} {user.last_name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded ml-auto mt-0.5">
                            {user.rol === 'superusuario' ? 'Super User' : user.rol}
                        </span>
                    </div>
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold border border-slate-200 text-sm">
                        {getInitials(user.first_name, user.last_name)}
                    </div>
                </div>
                <button
                    onClick={logout}
                    title="Cerrar Sesión"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                    <LogOut className="w-5 h-5 md:w-5 md:h-5" />
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white border-r border-slate-200 z-[70] flex flex-col shadow-2xl"
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-orange-600 rounded flex items-center justify-center text-white font-bold">O</div>
                                    <span className="font-bold text-slate-800">Menú</span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                                {filteredNavItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                                isActive
                                                    ? "bg-orange-50 text-orange-600 shadow-sm shadow-orange-600/5"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <item.icon className={cn("w-5 h-5", isActive ? "text-orange-600" : "text-slate-400")} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 font-bold border border-slate-200 shadow-sm">
                                        {getInitials(user.first_name, user.last_name)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900">{user.first_name} {user.last_name}</span>
                                        <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                                            {user.rol === 'superusuario' ? 'Super User' : user.rol}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        logout();
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 rounded-xl transition-all font-semibold text-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
