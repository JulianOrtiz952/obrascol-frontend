'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Package,
  ArrowRight,
  Warehouse,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { bodegas } from '@/lib/api';
import { Bodega } from '@/types';
import WarehouseDetailsModal from '@/components/WarehouseDetailsModal';

export default function Home() {
  const [warehouses, setWarehouses] = useState<Bodega[]>([]);
  const [selectedBodega, setSelectedBodega] = useState<Bodega | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bodegas.getAll();
        setWarehouses(res.data.results.filter(b => b.activo));
      } catch (error) {
        console.error('Error fetching warehouses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 md:space-y-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-[0.2em] mb-2">
            <LayoutDashboard className="w-4 h-4" />
            Panel de Control
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
            ¡Hola de nuevo!
          </h1>
          <p className="text-slate-500 font-medium md:text-lg">
            Gestión de Inventarios <span className="text-orange-600 font-black">Obrascol</span>
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 bg-white text-slate-600 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Último Acceso</p>
            <p className="text-sm font-bold text-slate-700 leading-none">Hoy, 06:45 AM</p>
          </div>
        </div>
      </header>

      {/* Grid: Bodegas & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Bodegas Card (Left) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Warehouse className="w-7 h-7 text-orange-600" />
              Nuestras Bodegas
            </h2>
            <Link href="/bodegas" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-colors uppercase tracking-wider">
              Ver Todas
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {warehouses.length > 0 ? (
                warehouses.map((bodega) => (
                  <div
                    key={bodega.id}
                    onClick={() => setSelectedBodega(bodega)}
                    className="group relative p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-orange-500/30 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Warehouse className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          <Warehouse className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full group-hover:bg-orange-100 transition-colors uppercase tracking-widest">
                          Activa
                        </div>
                      </div>

                      <h3 className="font-black text-slate-900 text-xl leading-tight mb-2 group-hover:text-orange-950">
                        {bodega.nombre}
                      </h3>

                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
                        <MapPin className="w-4 h-4 text-orange-300" />
                        <span className="text-xs font-bold truncate tracking-tight">{bodega.ubicacion}</span>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <span className="text-[10px] font-black text-orange-600 uppercase">Explorar Inventario</span>
                        <ArrowRight className="w-4 h-4 text-orange-600" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                  <p className="text-slate-400 font-black italic">No tienes bodegas configuradas todavía.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Sidebar (Right) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <TrendingUp className="absolute -bottom-6 -left-6 w-32 h-32 text-orange-500/10 -rotate-12 transition-transform group-hover:scale-110 duration-700" />

            <h2 className="text-2xl font-black mb-6 relative z-10">Acciones</h2>
            <div className="space-y-4 relative z-10">
              <Link href="/inventario" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group/btn">
                <div className="p-3 bg-orange-500/20 text-orange-500 rounded-xl group-hover/btn:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm">Inventario Total</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Consulta Stock</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20" />
              </Link>

              <Link href="/movimientos" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group/btn">
                <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl group-hover/btn:scale-110 transition-transform">
                  <History className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm">Historial Kardex</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Ver Movimientos</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20" />
              </Link>
            </div>

            <div className="mt-10 p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg relative z-10">
              <h3 className="text-sm font-black mb-2 leading-tight">¿Dudas con el sistema?</h3>
              <p className="text-[11px] text-orange-50 font-medium mb-5 opacity-90">Consulta nuestras guías de ayuda rápida o contacta a soporte.</p>
              <button className="w-full py-3 bg-white text-orange-600 rounded-2xl font-black text-xs hover:bg-orange-50 transition-all shadow-xl shadow-orange-950/20">
                Soporte Técnico
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center shadow-sm">
            <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-3xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Estado del Sistema</p>
            <p className="font-black text-slate-700 text-lg leading-tight">Funcionando al 100%</p>
            <div className="mt-4 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 italic">Sincronizado</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-[10px] font-black uppercase tracking-widest border-t border-slate-50">
        <p>© 2026 Obrascol - Gestión Industrial</p>
        <div className="flex items-center gap-8">
          <span className="hover:text-orange-500 cursor-pointer transition-colors">Soporte</span>
          <span className="hover:text-orange-500 cursor-pointer transition-colors">Seguridad</span>
          <div className="px-3 py-1 bg-slate-50 rounded-lg text-slate-300">v1.2.0</div>
        </div>
      </footer>

      <WarehouseDetailsModal
        isOpen={!!selectedBodega}
        onClose={() => setSelectedBodega(null)}
        bodega={selectedBodega}
      />
    </div>
  );
}
