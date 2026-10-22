import React, { useState, useEffect } from 'react';
import {
  FileDown,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
  FileText,
  User,
  Gavel,
  X,
  Loader2,
  Check,
  Eye,
  AlertCircle
} from 'lucide-react';
import { generateCaseExecutivePdf, CaseDossier, ExportPdfOptions } from '../utils/casePdfExport';

interface CaseExportModalProps {
  caseId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CaseExportModal: React.FC<CaseExportModalProps> = ({
  caseId,
  isOpen,
  onClose
}) => {
  const [dossier, setDossier] = useState<CaseDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Export options state
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeFinances, setIncludeFinances] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);

  const [executiveSummaryText, setExecutiveSummaryText] = useState('');
  const [attorneyNotes, setAttorneyNotes] = useState('');
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && caseId) {
      fetchDossier();
    }
  }, [isOpen, caseId]);

  const fetchDossier = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/cases/${caseId}/dossier`);
      if (!res.ok) {
        throw new Error('No se pudo obtener el expediente completo.');
      }
      const data = await res.json();
      setDossier(data);
      if (data.case?.description) {
        setExecutiveSummaryText(
          `Expediente ${data.case.case_number || `EXP-${data.case.id}`} radicado ante ${data.case.court || 'el juzgado competente'}. ${data.case.description}`
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al cargar expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    try {
      setIsGeneratingAiSummary(true);
      const res = await fetch(`/api/cases/${caseId}/ai-executive-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentNotes: attorneyNotes })
      });
      if (!res.ok) {
        throw new Error('Fallo al generar el resumen ejecutivo con IA');
      }
      const data = await res.json();
      if (data.summary) {
        setExecutiveSummaryText(data.summary);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error de IA: ' + (err.message || 'Intente nuevamente'));
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!dossier) return;
    try {
      setIsExporting(true);
      const options: ExportPdfOptions = {
        includeExecutiveSummary,
        executiveSummaryText,
        includeTasks,
        includeFinances,
        includeDocuments,
        includeSignatures,
        attorneyNotes
      };
      const doc = generateCaseExecutivePdf(dossier, options);
      const cleanTitle = (dossier.case.title || 'Expediente')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 30);
      const filename = `Resumen_Ejecutivo_${dossier.case.case_number || `EXP-${dossier.case.id}`}_${cleanTitle}.pdf`;
      doc.save(filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      alert('Error al generar el PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    if (!dossier) return;
    try {
      const options: ExportPdfOptions = {
        includeExecutiveSummary,
        executiveSummaryText,
        includeTasks,
        includeFinances,
        includeDocuments,
        includeSignatures,
        attorneyNotes
      };
      const doc = generateCaseExecutivePdf(dossier, options);
      const blobUrl = doc.output('bloburl');
      const printWindow = window.open(blobUrl);
      if (printWindow) {
        printWindow.focus();
      }
    } catch (err: any) {
      console.error('Print preview failed:', err);
      alert('Error al abrir vista previa: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileDown size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Exportar Expediente a PDF (jsPDF)
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  Resumen Ejecutivo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Genere informes ejecutivos listos para imprimir, firmar y presentar ante clientes o tribunales.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="animate-spin text-amber-500" size={32} />
              <p className="text-sm">Consolidando actuaciones, finanzas y registros procesales...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          ) : dossier ? (
            <>
              {/* Case Quick Overview Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {dossier.case.case_number || `EXP-${dossier.case.id}`}
                    </span>
                    <h3 className="text-base font-semibold text-slate-100 mt-1">
                      {dossier.case.title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {(dossier.case.status || 'abierto').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block">Cliente:</span>
                    <span className="text-slate-200 font-medium">{dossier.case.client_name || 'Sin asignar'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Juzgado / Sede:</span>
                    <span className="text-slate-200 font-medium">{dossier.case.court || 'Primera Instancia'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Diligencias:</span>
                    <span className="text-slate-200 font-medium">{dossier.tasks?.length || 0} registradas</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Balance Procesal:</span>
                    <span className={`font-medium ${(dossier.financialSummary?.balance ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${(dossier.financialSummary?.balance ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                </div>
              </div>

              {/* Sections to Include Checkboxes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Secciones a incluir en el Documento PDF:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={includeExecutiveSummary}
                      onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500/30 bg-slate-900 border-slate-700 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-200 block">Diagnóstico Ejecutivo</span>
                      <span className="text-[11px] text-slate-500">Resumen y estrategia jurídica</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={includeTasks}
                      onChange={(e) => setIncludeTasks(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500/30 bg-slate-900 border-slate-700 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-200 block">Diligencias y Plazos</span>
                      <span className="text-[11px] text-slate-500">Calendario de términos judiciales</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={includeFinances}
                      onChange={(e) => setIncludeFinances(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500/30 bg-slate-900 border-slate-700 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-200 block">Balance Financiero</span>
                      <span className="text-[11px] text-slate-500">Gastos, honorarios y balance</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={includeDocuments}
                      onChange={(e) => setIncludeDocuments(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500/30 bg-slate-900 border-slate-700 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-200 block">Glosa Documental</span>
                      <span className="text-[11px] text-slate-500">Registro de pruebas y anexos</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={includeSignatures}
                      onChange={(e) => setIncludeSignatures(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500/30 bg-slate-900 border-slate-700 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-200 block">Protocolo de Firmas</span>
                      <span className="text-[11px] text-slate-500">Abogado titular y cliente</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Editable Executive Summary Area */}
              {includeExecutiveSummary && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Redacción del Resumen Ejecutivo (Editable):
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAiSummary}
                      disabled={isGeneratingAiSummary}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all disabled:opacity-50"
                    >
                      {isGeneratingAiSummary ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Redactando con LexmarIQ...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          Mejorar con IA
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={executiveSummaryText}
                    onChange={(e) => setExecutiveSummaryText(e.target.value)}
                    placeholder="Escriba o genere con IA el diagnóstico procesal de este expediente..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 outline-none transition-all resize-y"
                  />
                </div>
              )}

              {/* Attorney Special Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Observaciones Particulares del Abogado (Opcional):
                </label>
                <input
                  type="text"
                  value={attorneyNotes}
                  onChange={(e) => setAttorneyNotes(e.target.value)}
                  placeholder="Ej: Se tiene citada a la contraparte para el día 25; no descuidar contestación de excepciones."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 outline-none transition-all"
                />
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-500" />
            <span>Formato oficial LexmarCorp • Tipografía legal A4 estandarizada</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintPdf}
              disabled={loading || !dossier}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
            >
              <Printer size={15} />
              Imprimir / Previa
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={loading || !dossier || isExporting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Generando PDF...
                </>
              ) : exportSuccess ? (
                <>
                  <Check size={15} />
                  ¡Descargado con éxito!
                </>
              ) : (
                <>
                  <FileDown size={15} />
                  Descargar PDF Ejecutivo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
