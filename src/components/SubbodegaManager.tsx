'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, PowerOff, Save, X } from 'lucide-react';
import { Subbodega } from '@/types';
import { subbodegas } from '@/lib/api';

interface SubbodegaManagerProps {
    bodegaId: number;
    onUpdate?: () => void;
}

export default function SubbodegaManager({ bodegaId, onUpdate }: SubbodegaManagerProps) {
    const [list, setList] = useState<Subbodega[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSubName, setNewSubName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchSubbodegas();
    }, [bodegaId]);

    const fetchSubbodegas = async () => {
        try {
            setLoading(true);
            const response = await subbodegas.getAll(bodegaId, true);
            setList(response.data);
        } catch (error) {
            console.error('Error fetching subbodegas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubName.trim()) return;

        try {
            await subbodegas.create({
                nombre: newSubName.trim(),
                bodega: bodegaId,
                activo: true
            });
            setNewSubName('');
            setIsCreating(false);
            fetchSubbodegas();
            onUpdate?.();
        } catch (error) {
            console.error('Error creating subbodega:', error);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editName.trim()) return;
        try {
            await subbodegas.update(id, { nombre: editName.trim() });
            setEditingId(null);
            fetchSubbodegas();
            onUpdate?.();
        } catch (error) {
            console.error('Error updating subbodega:', error);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await subbodegas.toggleActivo(id);
            fetchSubbodegas();
            onUpdate?.();
        } catch (error) {
            console.error('Error toggling subbodega:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900">Ubicaciones (Subbodegas)</h4>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold"
                    >
                        <Plus className="w-3 h-3" />
                        Agregar Ubicación
                    </button>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="flex gap-2">
                    <input
                        type="text"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        placeholder="Nombre de la ubicación"
                        className="flex-1 px-3 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        autoFocus
                    />
                    <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                        <Save className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setIsCreating(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </form>
            )}

            <div className="space-y-2">
                {loading ? (
                    <p className="text-xs text-slate-500">Cargando ubicaciones...</p>
                ) : list.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No hay ubicaciones registradas.</p>
                ) : (
                    list.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                            {editingId === sub.id ? (
                                <div className="flex flex-1 gap-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 px-2 py-0.5 text-sm border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                                        autoFocus
                                    />
                                    <button onClick={() => handleUpdate(sub.id)} className="text-emerald-600 hover:text-emerald-700">
                                        <Save className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${sub.activo ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                                            {sub.nombre}
                                        </span>
                                        {!sub.activo && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Inactivo</span>}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditingId(sub.id);
                                                setEditName(sub.nombre);
                                            }}
                                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleToggle(sub.id)}
                                            className={`p-1 rounded transition-colors ${sub.activo ? 'text-orange-400 hover:text-orange-600' : 'text-emerald-400 hover:text-emerald-600'} hover:bg-white`}
                                        >
                                            {sub.activo ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
