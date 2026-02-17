import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, PowerOff, Save, X, Eye, ChevronRight, Home, Package, Hash } from 'lucide-react';
import { Subbodega, BodegaStock } from '@/types';
import { subbodegas, bodegas } from '@/lib/api';
import SubbodegaStockModal from './SubbodegaStockModal';

interface SubbodegaManagerProps {
    bodegaId: number;
    onUpdate?: () => void;
    readOnly?: boolean;
}

export default function SubbodegaManager({ bodegaId, onUpdate, readOnly = false }: SubbodegaManagerProps) {
    const [list, setList] = useState<Subbodega[]>([]);
    const [stock, setStock] = useState<BodegaStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStock, setLoadingStock] = useState(false);
    const [newSubName, setNewSubName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [viewingStock, setViewingStock] = useState<Subbodega | null>(null);
    const [currentParent, setCurrentParent] = useState<Subbodega | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<Subbodega[]>([]);

    useEffect(() => {
        fetchData();
    }, [bodegaId, currentParent]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setLoadingStock(true);
            const parentId = currentParent ? currentParent.id : 'null';

            const [listRes, stockRes] = await Promise.all([
                subbodegas.getAll(bodegaId, true, parentId as any),
                bodegas.getStock(bodegaId, currentParent?.id)
            ]);

            setList(listRes.data.results);
            setStock(stockRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setLoadingStock(false);
        }
    };

    const fetchSubbodegas = async () => {
        // Kept for compatibility if called elsewhere, but we now use fetchData
        fetchData();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubName.trim()) return;

        try {
            await subbodegas.create({
                nombre: newSubName.trim(),
                bodega: bodegaId,
                parent: currentParent ? currentParent.id : null,
                activo: true
            });
            setNewSubName('');
            setIsCreating(false);
            fetchData();
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
            fetchData();
            onUpdate?.();
        } catch (error) {
            console.error('Error updating subbodega:', error);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await subbodegas.toggleActivo(id);
            fetchData();
            onUpdate?.();
        } catch (error) {
            console.error('Error toggling subbodega:', error);
        }
    };

    const navigateTo = (sub: Subbodega | null) => {
        if (!sub) {
            setCurrentParent(null);
            setBreadcrumbs([]);
        } else {
            setCurrentParent(sub);
            const index = breadcrumbs.findIndex(b => b.id === sub.id);
            if (index !== -1) {
                setBreadcrumbs(breadcrumbs.slice(0, index + 1));
            } else {
                setBreadcrumbs([...breadcrumbs, sub]);
            }
        }
        setIsCreating(false);
        setEditingId(null);
    };

    // Grouping stock by child sub-warehouse for the "folder" view
    const stockBySub = stock.reduce((acc, item) => {
        const subId = item.id_subbodega || 0;
        if (!acc[subId]) acc[subId] = [];
        acc[subId].push(item);
        return acc;
    }, {} as Record<number, BodegaStock[]>);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">Ubicaciones</h4>
                    <div className="flex items-center gap-2">
                        {currentParent && (
                            <button
                                onClick={() => setViewingStock(currentParent)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                                title="Ver stock total de este nivel"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}
                        {!isCreating && !readOnly && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold"
                            >
                                <Plus className="w-3 h-3" />
                                Agregar {currentParent ? 'Sub-ubicación' : 'Ubicación'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 overflow-x-auto py-1">
                    <button
                        onClick={() => navigateTo(null)}
                        className={`flex items-center gap-1 hover:text-orange-600 transition-colors ${!currentParent ? 'font-bold text-orange-600' : ''}`}
                    >
                        <Home className="w-3 h-3" />
                        Raíz
                    </button>
                    {breadcrumbs.map((crumb) => (
                        <React.Fragment key={crumb.id}>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                            <button
                                onClick={() => navigateTo(crumb)}
                                className={`hover:text-orange-600 transition-colors whitespace-nowrap ${currentParent?.id === crumb.id ? 'font-bold text-orange-600' : ''}`}
                            >
                                {crumb.nombre}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                    <input
                        type="text"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        placeholder={currentParent ? `Nombre en ${currentParent.nombre}` : "Nombre de la ubicación"}
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        autoFocus
                    />
                    <button type="submit" className="px-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                        <Save className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setIsCreating(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Sub-locations list */}
                        <div className="grid gap-2">
                            {list.map((sub) => {
                                const subStockCount = stock.filter(i => {
                                    return i.id_subbodega === sub.id;
                                }).length;

                                return (
                                    <div key={sub.id} className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden group hover:border-orange-200 transition-all">
                                        <div className="flex items-center justify-between p-3 bg-slate-50/50">
                                            <div
                                                className="flex items-center gap-2 flex-1 cursor-pointer"
                                                onClick={() => navigateTo(sub)}
                                            >
                                                <span className={`text-sm font-bold ${sub.activo ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                                                    {sub.nombre}
                                                </span>
                                                {subStockCount > 0 && (
                                                    <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                        {subStockCount} items
                                                    </span>
                                                )}
                                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                                            </div>

                                            <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setViewingStock(sub); }}
                                                    className="p-1 text-blue-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Ver stock detallado"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                {!readOnly && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditingId(sub.id); setEditName(sub.nombre); }}
                                                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggle(sub.id); }}
                                                            className={`p-1 rounded-lg transition-colors border border-transparent hover:border-slate-100 ${sub.activo ? 'text-orange-400 hover:text-orange-600' : 'text-emerald-400 hover:text-emerald-600'} hover:bg-white`}
                                                        >
                                                            {sub.activo ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {editingId === sub.id && (
                                            <div className="p-2 bg-white flex gap-2 border-t border-slate-100">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 px-3 py-1 text-sm border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/10"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleUpdate(sub.id)} className="p-1.5 bg-emerald-600 text-white rounded-lg">
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Direct Stock list (Items in THIS level that aren't in children) */}
                        {stock.length > 0 && (
                            <div className="mt-6 space-y-2">
                                <h5 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                    <Package className="w-3 h-3" />
                                    Materiales en {currentParent?.nombre || 'Raíz'}
                                </h5>
                                <div className="grid gap-2">
                                    {stock
                                        .filter(item => item.id_subbodega === (currentParent?.id || null))
                                        .map((item) => (
                                            <div
                                                key={`${item.id_material}-${item.id_subbodega}`}
                                                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
                                            >
                                                <div className="min-w-0 pr-4">
                                                    <p className="font-bold text-slate-900 text-sm truncate">{item.nombre}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                                            <Hash className="w-2.5 h-2.5" /> {item.codigo}
                                                        </span>
                                                        {item.referencia && (
                                                            <span className="text-[10px] text-slate-400 italic">• {item.referencia}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-black text-slate-900 text-base leading-none">{item.cantidad}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{item.unidad}</p>
                                                </div>
                                            </div>
                                        ))}

                                    {/* Recursive stock summary (if we are in a parent and there's stock in children) */}
                                    {currentParent && stock.some(i => i.id_subbodega !== currentParent.id) && (
                                        <div className="pt-2 px-1">
                                            <p className="text-[10px] text-slate-400 italic">
                                                * El stock total del nivel superior incluye materiales en sub-ubicaciones.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {list.length === 0 && stock.length === 0 && !loading && (
                            <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 italic">Esta ubicación está totalmente vacía.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {viewingStock && (
                <SubbodegaStockModal
                    isOpen={!!viewingStock}
                    onClose={() => setViewingStock(null)}
                    subbodegaName={viewingStock.full_path || viewingStock.nombre}
                    subbodegaId={viewingStock.id}
                    bodegaId={bodegaId}
                />
            )}
        </div>
    );
}
