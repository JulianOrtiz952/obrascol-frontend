import {
  History,
  Package,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 md:mb-4">Bienvenido, Juan</h1>
        <p className="text-lg md:text-xl text-slate-500">Sistema de Gestión de Inventario Obrascol</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/inventario"
          className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Ver Inventario</h3>
          <p className="text-slate-500 text-sm mb-4">Consulta el stock actual de todos los materiales en tiempo real.</p>
          <div className="flex items-center gap-2 text-orange-600 font-medium text-sm">
            Ir al inventario <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/movimientos"
          className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Movimientos</h3>
          <p className="text-slate-500 text-sm mb-4">Registra entradas y salidas, y consulta el historial completo.</p>
          <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
            Ver historial <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-4">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Acceso Rápido</h3>
          <p className="text-slate-500 text-sm mb-6">Utiliza el menú superior para gestionar zonas y el diccionario de materiales.</p>
          <button className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all">
            Nuevo Registro
          </button>
        </div>
      </div>

      <div className="mt-8 md:mt-12 p-6 md:p-8 bg-orange-50 rounded-2xl md:rounded-3xl border border-orange-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-orange-950 mb-2">¿Necesitas ayuda?</h2>
          <p className="text-orange-800/80 text-sm md:text-base">Consulta la documentación del sistema o contacta a soporte técnico.</p>
        </div>
        <button className="w-full md:w-auto px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20">
          Soporte
        </button>
      </div>
    </div>
  );
}
