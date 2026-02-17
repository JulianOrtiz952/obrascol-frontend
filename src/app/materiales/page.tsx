'use client';

import React, { useState, useEffect } from 'react';
import { materiales as materialesApi, marcas as marcasApi } from '@/lib/api';
import { Material, Marca } from '@/types';
import { Search, Edit, Package, Filter, Plus } from 'lucide-react';
import { EditMaterialModal } from '@/components/EditMaterialModal';
import { RegistrarEntradaModal } from '@/components/RegistrarEntradaModal';

export default function MaterialesPage() {
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMarca, setSelectedMarca] = useState('');

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // We can reuse RegistrarEntrada or a specific one, but user asked for "list and edit". 
    // Actually, creating a product implicitly happens in "Registrar Entrada", but having a dedicated "Create Product" (without stock) might be needed.
    // For now, I'll assume "Registrar Entrada" is the primary way to introduce stock, but editing is what's requested. 
    // Wait, the user said "listado... y que pueda editarlos". 
    // I won't add a standalone "Create Material" modal yet unless asked, effectively "Registrar Entrada" initializes things.
    // However, I can put a button "Nuevo Producto" that just opens RegistrarEntradaModal for now, or just leave it for editing.
    // Let's stick to the list and edit first.

    const fetchData = async () => {
        setLoading(true);
        try {
            const [matRes, marRes] = await Promise.all([
                materialesApi.getAll(),
                marcasApi.getAll()
            ]);
            setMateriales(matRes.data.results);
            setMarcas(marRes.data.results);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (id: number) => {
        setSelectedMaterialId(id);
        setIsEditModalOpen(true);
    };

    const handleSuccess = () => {
        fetchData();
        // Keep modal open? No, close handled by modal usually.
    };

    const filteredMateriales = materiales.filter(m => {
        const matchesSearch =
            m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.codigo_barras && m.codigo_barras.includes(searchTerm));

        const matchesMarca = selectedMarca ? m.marca?.toString() === selectedMarca : true;

        return matchesSearch && matchesMarca;
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Gestión de Productos</h1>
                    <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-lg">Administra el catálogo completo de materiales.</p>
                </div>
                {/* 
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </button>
                */}
            </div>

            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full pl-10 pr-4 py-2 text-sm md:text-base rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                +
                <div className="flex items-center gap-2 min-w-[160px] md:min-w-[200px]">
                    <select
                        className="w-full px-3 py-2 text-sm md:text-base rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-700 bg-white"
                        value={selectedMarca}
                        onChange={(e) => setSelectedMarca(e.target.value)}
                    >
                        <option value="">Todas las Marcas</option>
                        {marcas.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Marca</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Referencia</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unidad</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando productos...</td>
                                </tr>
                            ) : filteredMateriales.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="w-8 h-8 text-slate-300" />
                                            <p>No se encontraron productos.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredMateriales.map((material) => (
                                    <tr key={material.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">{material.codigo}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{material.nombre}</td>
                                        <td className="px-6 py-4">
                                            {material.marca ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {marcas.find(m => m.id === material.marca)?.nombre}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Sin marca</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{material.referencia || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                                                {material.unidad}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleEdit(material.id)}
                                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedMaterialId && (
                <EditMaterialModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleSuccess}
                    materialId={selectedMaterialId}
                />
            )}
        </div>
    );
}
