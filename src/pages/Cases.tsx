import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Calendar,
  User,
  Gavel,
  CheckCircle2,
  Clock,
  Trash2,
  FileText,
  FileDown,
  Printer,
  Eye,
  DollarSign,
  Sparkles,
  ExternalLink,
  Check,
  X,
  ShieldCheck,
  Loader2,
  Download
} from 'lucide-react';
import { Case, Client, User as Lawyer } from '../types';
import { useAuth } from '../context/AuthContext';
import { CaseExportModal } from '../components/CaseExportModal';
import { generateCaseExecutivePdf, CaseDossier } from '../utils/casePdfExport';

export const Cases: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // PDF Export & Dossier States
  const [exportCaseId, setExportCaseId] = useState<number | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<CaseDossier | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [quickDownloadingId, setQuickDownloadingId] = useState<number | null>(null);

  // New Case Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newLawyerId, setNewLawyerId] = useState('');
  const [newType, setNewType] = useState('Mercantil');
  const [newCourt, setNewCourt] = useState('');
  const [newCaseNumber, setNewCaseNumber] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, clientsRes, lawyersRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/clients'),
        fetch('/api/lawyers')
      ]);

      if (casesRes.ok) setCases(await casesRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (lawyersRes.ok) setLawyers(await lawyersRes.json());
    } catch (err) {
      console.error('Error fetching cases data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExport = (caseId: number) => {
    setExportCaseId(caseId);
    setShowExportModal(true);
  };

  const handleQuickExport = async (c: Case) => {
    try {
      setQuickDownloadingId(c.id);
      const res = await fetch(`/api/cases/${c.id}/dossier`);
      if (!res.ok) throw new Error('Error al obtener datos');
      const dossierData: CaseDossier = await res.json();
      const doc = generateCaseExecutivePdf(dossierData, {
        includeExecutiveSummary: true,
        includeTasks: true,
        includeFinances: true,
        includeDocuments: true,
        includeSignatures: true
      });
      const cleanTitle = (c.title || 'Expediente')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 30);
      doc.save(`Resumen_Ejecutivo_${c.case_number || `EXP-${c.id}`}_${cleanTitle}.pdf`);
    } catch (err: any) {
      alert('Error en descarga rápida: ' + err.message);
    } finally {
      setQuickDownloadingId(null);
    }
  };

  const handleOpenDetail = async (c: Case) => {
    try {
      setShowDetailModal(true);
      setLoadingDetail(true);
      const res = await fetch(`/api/cases/${c.id}/dossier`);
      if (res.ok) {
        setSelectedDossier(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          client_id: newClientId ? parseInt(newClientId) : null,
          lawyer_id: newLawyerId ? parseInt(newLawyerId) : user?.id,
          type: newType,
          court: newCourt,
          case_number: newCaseNumber
        })
      });
      if (res.ok) {
        setShowNewModal(false);
        setNewTitle('');
        setNewDescription('');
        setNewClientId('');
        setNewCaseNumber('');
        setNewCourt('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = filterStatus === 'todos' || c.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (c.title || '').toLowerCase().includes(term) ||
      (c.case_number || '').toLowerCase().includes(term) ||
      (c.client_name || '').toLowerCase().includes(term) ||
      (c.court || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Briefcase size={14} /> Gestión de Expedientes Judiciales
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
            Expedientes & Auditoría de Litigio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Genere resúmenes ejecutivos en PDF (jsPDF) listos para imprimir con diagnóstico procesal, balance financiero y firmas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus size={16} />
            Nuevo Expediente
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por carátula, número de expediente, cliente o juzgado..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['todos', 'abierto', 'en_tramite', 'concluido'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'todos' ? 'Todos' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Expediente / Carátula</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Materia / Sede</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones & Exportación PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin text-amber-500 mx-auto mb-2" />
                    Cargando expedientes jurídicos...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No se encontraron expedientes con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <Gavel size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {c.case_number || `EXP-${c.id}`}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-100 text-xs mt-1 truncate max-w-md">
                            {c.title}
                          </h3>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User size={13} className="text-slate-500" />
                        <span>{c.client_name || 'Sin asignar'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      <div>
                        <span className="font-medium block">{c.type || 'Mercantil / Civil'}</span>
                        <span className="text-[11px] text-slate-500">{c.court || 'Juzgado Local'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'concluido'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.status === 'en_tramite'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {(c.status || 'abierto').replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick 1-click Download */}
                        <button
                          onClick={() => handleQuickExport(c)}
                          disabled={quickDownloadingId === c.id}
                          title="Descarga Rápida de Resumen Ejecutivo en PDF"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-50"
                        >
                          {quickDownloadingId === c.id ? (
                            <Loader2 size={15} className="animate-spin text-amber-400" />
                          ) : (
                            <Download size={15} />
                          )}
                        </button>

                        {/* Open Detailed Export Modal */}
                        <button
                          onClick={() => handleOpenExport(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm"
                        >
                          <FileDown size={14} />
                          <span>Exportar PDF</span>
                        </button>

                        {/* View Dossier Details */}
                        <button
                          onClick={() => handleOpenDetail(c)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                          title="Ver Ficha Completa del Expediente"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Export Modal Component */}
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

      {/* Case Detail Dossier Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <Gavel size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ficha Procesal del Expediente</h3>
                  <span className="text-xs font-mono text-amber-400">
                    {selectedDossier?.case?.case_number || 'EXPEDIENTE'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {loadingDetail ? (
                <div className="py-12 text-center text-slate-500">Cargando actuaciones...</div>
              ) : selectedDossier ? (
                <>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-300 text-sm">{selectedDossier.case.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{selectedDossier.case.description}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Cliente:</span>
                      <span className="text-slate-200 font-semibold">{selectedDossier.case.client_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Juzgado:</span>
                      <span className="text-slate-200 font-semibold">{selectedDossier.case.court || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Abogado Titular:</span>
                      <span className="text-slate-200 font-semibold">{selectedDossier.case.lawyer_name || 'Lic. Marco Perales'}</span>
                    </div>
                  </div>

                  {/* Tasks in dossier */}
                  <div>
                    <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-400" />
                      Diligencias Procesales ({selectedDossier.tasks?.length || 0})
                    </h5>
                    <div className="space-y-1.5">
                      {selectedDossier.tasks?.map((t) => (
                        <div key={t.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                          <span className="text-slate-200 font-medium">{t.title}</span>
                          <span className="text-slate-400 text-[10px]">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-slate-500 text-xs">LexmarCorp IQ Judicial Dossier</span>
              {selectedDossier && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenExport(selectedDossier.case.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  <FileDown size={14} />
                  Exportar a PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase size={18} className="text-amber-400" />
                Registrar Nuevo Expediente
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Título / Carátula del Juicio *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Juicio Ejecutivo Mercantil vs Deudor S.A."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Número de Expediente</label>
                  <input
                    type="text"
                    value={newCaseNumber}
                    onChange={(e) => setNewCaseNumber(e.target.value)}
                    placeholder="Ej: EXP-002/2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Materia</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  >
                    <option value="Mercantil">Mercantil</option>
                    <option value="Civil">Civil</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Laboral">Laboral</option>
                    <option value="Penal">Penal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Cliente Vinculado</label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccione un cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name} ({c.type || 'física'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Juzgado / Sede</label>
                  <input
                    type="text"
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value)}
                    placeholder="Ej: Juzgado Primero Mercantil"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Descripción / Prestaciones Reclamadas</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detalles de la controversia, monto demandado o antecedentes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                >
                  {creating ? 'Guardando...' : 'Crear Expediente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
