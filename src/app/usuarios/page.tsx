'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
    Users,
    UserPlus,
    Shield,
    Mail,
    Phone,
    UserX,
    UserCheck,
    MoreVertical,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { RegistrarUsuarioModal } from '@/components/RegistrarUsuarioModal';

interface UserData {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    rol: string;
    telefono: string;
    activo: boolean;
}

export default function UsuariosPage() {
    const { user: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const res = await api.get('usuarios/');
            setUsuarios(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.rol === 'superusuario') {
            fetchUsuarios();
        }
    }, [currentUser]);

    const handleToggleActivo = async (id: number, currentStatus: boolean) => {
        try {
            await api.patch(`usuarios/${id}/`, { activo: !currentStatus });
            fetchUsuarios();
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    const filteredUsuarios = usuarios.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.first_name.toLowerCase().includes(search.toLowerCase()) ||
        u.last_name.toLowerCase().includes(search.toLowerCase())
    );

    if (currentUser?.rol !== 'superusuario') {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center bg-white p-10 rounded-3xl border border-slate-100 shadow-sm max-w-md">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso Denegado</h1>
                    <p className="text-slate-500">Solo los súper usuarios pueden acceder a esta sección.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Gestión de Usuarios</h1>
                    <p className="text-slate-500">Administra los accesos y roles de la plataforma</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                >
                    <UserPlus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </header>

            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o usuario..."
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Badge variant="neutral" className="bg-slate-100 text-slate-600 border-none px-4 py-2">
                        Total: {usuarios.length} usuarios
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4"></div>
                            <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                        </div>
                    ))
                ) : filteredUsuarios.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No se encontraron usuarios</h3>
                        <p className="text-slate-500">Prueba con otra búsqueda o crea uno nuevo.</p>
                    </div>
                ) : (
                    filteredUsuarios.map((u) => (
                        <div key={u.id} className={cn(
                            "group bg-white p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden",
                            u.activo ? "border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5" : "border-slate-100 opacity-60 grayscale"
                        )}>
                            {!u.activo && (
                                <div className="absolute top-0 right-0 p-3">
                                    <Badge variant="danger" className="text-[10px] py-0 px-2">Inactivo</Badge>
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                                    u.rol === 'superusuario' ? "bg-slate-900 text-white" : "bg-orange-100 text-orange-600"
                                )}>
                                    {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleActivo(u.id, u.activo)}
                                        className={cn(
                                            "p-2 rounded-xl transition-all",
                                            u.activo ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                        )}
                                        title={u.activo ? "Desactivar Usuario" : "Activar Usuario"}
                                    >
                                        {u.activo ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900 truncate">
                                    {u.first_name} {u.last_name}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-600 text-xs">@{u.username}</span>
                                    •
                                    <span className="capitalize font-medium text-orange-600">{u.rol === 'superusuario' ? 'Super User' : u.rol}</span>
                                </p>
                            </div>

                            <div className="space-y-2.5 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">{u.email || 'Sin correo'}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{u.telefono || 'Sin teléfono'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <RegistrarUsuarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsuarios}
            />
        </div>
    );
}
