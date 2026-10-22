import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckSquare,
  DollarSign,
  FileDown,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileCode2,
  Calendar,
  Gavel
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CaseExportModal } from '../components/CaseExportModal';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeCases: 0,
    totalClients: 0,
    pendingTasks: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // PDF Export Modal State
  const [exportCaseId, setExportCaseId] = useState<number | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [casesRes, clientsRes, tasksRes, paymentsRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/clients'),
        fetch('/api/tasks'),
        fetch('/api/payments')
      ]);

      const cases = casesRes.ok ? await casesRes.json() : [];
      const clients = clientsRes.ok ? await clientsRes.json() : [];
      const tasks = tasksRes.ok ? await tasksRes.json() : [];
      const payments = paymentsRes.ok ? await paymentsRes.json() : [];

      const totalInc = payments
        .filter((p: any) => !p.is_expense && p.status === 'completado')
        .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

      const totalExp = payments
        .filter((p: any) => p.is_expense && p.status === 'completado')
        .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

      setStats({
        activeCases: cases.filter((c: any) => c.status !== 'concluido' && c.status !== 'archivado').length,
        totalClients: clients.length,
        pendingTasks: tasks.filter((t: any) => t.status !== 'completada').length,
        totalIncome: totalInc,
        totalExpenses: totalExp,
      });

      setRecentCases(cases.slice(0, 5));
      setPendingTasks(tasks.filter((t: any) => t.status !== 'completada').slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExport = (caseId: number) => {
    setExportCaseId(caseId);
    setShowExportModal(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <ShieldCheck size={14} /> Despacho Jurídico Verificado • Lic. Marco Perales
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Bienvenido a <span className="text-amber-400">LexmarCorp IQ</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Sistema integral de litigio, auditoría procesal, plantillas contractuales automatizadas con Gemini y exportación ejecutiva a PDF (jsPDF).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all shadow-sm"
            >
              <FileCode2 size={16} />
              Plantillas & IA
            </button>
            <button
              onClick={() => navigate('/cases')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
            >
              <Briefcase size={16} />
              Ver Expedientes
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expedientes Activos</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.activeCases}</span>
            <span className="text-xs text-amber-400/90 font-medium">en trámite</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diligencias Pendientes</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.pendingTasks}</span>
            <span className="text-xs text-blue-400 font-medium">plazos por vencer</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes en Cartera</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalClients}</span>
            <span className="text-xs text-purple-400 font-medium">físicas / morales</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Honorarios & Ingresos</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              ${stats.totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-400 font-medium">MXN</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases Table & PDF Quick Access (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Gavel size={18} className="text-amber-400" />
                  Expedientes Recientes con Exportación PDF
                </h2>
                <p className="text-xs text-slate-400">
                  Resúmenes ejecutivos listos para imprimir con jsPDF.
                </p>
              </div>
              <button
                onClick={() => navigate('/cases')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                Ver todos <ChevronRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Cargando expedientes...</div>
            ) : recentCases.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">No hay expedientes registrados aún.</div>
            ) : (
              <div className="space-y-3">
                {recentCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                          {c.case_number || `EXP-${c.id}`}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase font-medium">
                          {c.type || 'Civil/Mercantil'}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 truncate">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        Cliente: <span className="text-slate-400">{c.client_name || 'Sin asignar'}</span> • Juzgado: <span className="text-slate-400">{c.court || 'Local'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenExport(c.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all"
                      >
                        <FileDown size={14} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Motor jsPDF + jspdf-autotable integrado para impresión ejecutiva</span>
            <span className="text-amber-500 font-medium">A4 Judicial Standard</span>
          </div>
        </div>

        {/* Right Column: Pending Tasks & Quick Template Actions */}
        <div className="space-y-6">
          {/* Quick Legal AI Banner */}
          <div className="bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles size={15} />
              Biblioteca de Plantillas & IA
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              Redacción Automatizada de Escritos
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Personalice placeholders (&quot;{"{{client_name}}"}&quot;, &quot;{"{{case_id}}"}&quot;) y redacte contratos o demandas en segundos con Gemini.
            </p>
            <button
              onClick={() => navigate('/templates')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              <FileCode2 size={15} />
              Abrir Biblioteca de Plantillas
            </button>
          </div>

          {/* Pending Tasks Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare size={16} className="text-blue-400" />
                Diligencias y Plazos Inminentes
              </h3>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Ver todas
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Cargando diligencias...</div>
            ) : pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No hay tareas pendientes.</div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{t.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'Alta' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.priority || 'Normal'}
                      </span>
                    </div>
                    {t.due_date && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar size={11} /> Vence: {new Date(t.due_date).toLocaleDateString('es-MX')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Export Modal */}
      {exportCaseId && (
        <CaseExportModal
          caseId={exportCaseId}
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false);
            setExportCaseId(null);
          }}
        />
      )}
    </div>
  );
};
