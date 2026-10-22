import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  Plus,
  Sparkles,
  Search,
  BookOpen,
  Copy,
  Check,
  Download,
  Trash2,
  Edit3,
  X,
  Loader2,
  FileText,
  User,
  Briefcase,
  AlertCircle,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import { DocumentTemplate, Client, Case } from '../types';

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMateria, setSelectedMateria] = useState<string>('todos');

  // Selected template for viewing or generation
  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Generation State
  const [genClientId, setGenClientId] = useState<string>('');
  const [genCaseId, setGenCaseId] = useState<string>('');
  const [genInstructions, setGenInstructions] = useState<string>('');
  const [genManualValues, setGenManualValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Create / Edit Template State
  const [editId, setEditId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formMateria, setFormMateria] = useState('Civil');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPlaceholderInput, setFormPlaceholderInput] = useState('');
  const [formPlaceholders, setFormPlaceholders] = useState<string[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [tRes, cRes, kRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/clients'),
        fetch('/api/cases')
      ]);

      if (tRes.ok) setTemplates(await tRes.json());
      if (cRes.ok) setClients(await cRes.json());
      if (kRes.ok) setCases(await kRes.json());
    } catch (err) {
      console.error('Error fetching template data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGenerate = (template: DocumentTemplate) => {
    setActiveTemplate(template);
    setGenClientId('');
    setGenCaseId('');
    setGenInstructions('');
    setGeneratedDraft(null);

    // Initialize manual placeholders mapping
    const initialMap: Record<string, string> = {};
    if (template.placeholders && Array.isArray(template.placeholders)) {
      template.placeholders.forEach((p) => {
        initialMap[p] = '';
      });
    }
    setGenManualValues(initialMap);
    setShowGenerateModal(true);
  };

  const handleGenerate = async () => {
    if (!activeTemplate) return;
    try {
      setIsGenerating(true);
      const res = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: activeTemplate.id,
          client_id: genClientId ? parseInt(genClientId) : null,
          case_id: genCaseId ? parseInt(genCaseId) : null,
          additionalInstructions: genInstructions,
          manualPlaceholders: genManualValues
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al generar el escrito');
      }

      const data = await res.json();
      setGeneratedDraft(data.generatedDraft);
    } catch (err: any) {
      alert('Error en generación: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPlaceholderToForm = () => {
    const clean = formPlaceholderInput.replace(/[{}]/g, '').trim().toLowerCase();
    if (clean && !formPlaceholders.includes(clean)) {
      setFormPlaceholders([...formPlaceholders, clean]);
      setFormPlaceholderInput('');
      // Also inject placeholder into editor content
      setFormContent((prev) => prev + ` {{${clean}}} `);
    }
  };

  const handleRemovePlaceholderFromForm = (pToRemove: string) => {
    setFormPlaceholders(formPlaceholders.filter((p) => p !== pToRemove));
  };

  const handleOpenCreateModal = () => {
    setEditId(null);
    setFormTitle('');
    setFormMateria('Civil');
    setFormDescription('');
    setFormContent(
      'En la ciudad de Saltillo, Coahuila, a {{fecha_actual}}, comparece por sus propios derechos el C. {{client_name}}, señalando como domicilio para oír y recibir notificaciones...'
    );
    setFormPlaceholders(['client_name', 'fecha_actual']);
    setShowEditModal(true);
  };

  const handleOpenEditModal = (t: DocumentTemplate) => {
    setEditId(t.id);
    setFormTitle(t.title);
    setFormMateria((t as any).materia || 'Civil');
    setFormDescription(t.description || '');
    setFormContent(t.content);
    setFormPlaceholders(Array.isArray(t.placeholders) ? t.placeholders : []);
    setShowEditModal(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    try {
      setSavingTemplate(true);
      const url = editId ? `/api/templates/${editId}` : '/api/templates';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          content: formContent,
          placeholders: formPlaceholders,
          materia: formMateria
        })
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchInitialData();
      } else {
        const err = await res.json();
        alert('Error al guardar plantilla: ' + (err.error || 'Intente nuevamente'));
      }
    } catch (err: any) {
      alert('Error de red: ' + err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('¿Seguro que desea eliminar esta plantilla de la biblioteca?')) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const downloadDraftAsText = (text: string, title: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}_Borrador.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesMateria =
      selectedMateria === 'todos' || ((t as any).materia || 'Civil').toLowerCase() === selectedMateria.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(term) || (t.description || '').toLowerCase().includes(term);
    return matchesMateria && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles size={14} /> Inteligencia Legal LexmarIQ
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
            Biblioteca de Plantillas & Escritos Legales
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Defina placeholders dinámicos como <code className="text-amber-300 font-mono">{"{{client_name}}"}</code> y <code className="text-amber-300 font-mono">{"{{case_id}}"}</code> para auto-generar demandas, contratos y promociones jurídicas con Gemini AI.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus size={16} />
          Nueva Plantilla
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar plantillas por nombre o concepto..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['todos', 'Civil', 'Mercantil', 'Familiar', 'Laboral'].map((mat) => (
            <button
              key={mat}
              onClick={() => setSelectedMateria(mat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMateria === mat
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mat === 'todos' ? 'Todas las materias' : mat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 size={28} className="animate-spin text-amber-500 mx-auto mb-2" />
          Cargando biblioteca de plantillas...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <FileCode2 size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No se encontraron plantillas</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Haga clic en "Nueva Plantilla" para redactar o pegar un formato legal y definir placeholders automáticos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((t) => {
            const materia = (t as any).materia || 'Civil';
            const placeholdersList = Array.isArray(t.placeholders) ? t.placeholders : [];

            return (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                      {materia}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        title="Editar Plantilla"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        title="Eliminar Plantilla"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm leading-snug">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {t.description || 'Sin descripción.'}
                  </p>

                  {/* Placeholders preview badges */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                      Placeholders definidos ({placeholdersList.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {placeholdersList.slice(0, 4).map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-300/90 border border-slate-800"
                        >
                          {`{{${p}}}`}
                        </span>
                      ))}
                      {placeholdersList.length > 4 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{placeholdersList.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <BookOpen size={12} /> Listo para IA
                  </span>

                  <button
                    onClick={() => handleOpenGenerate(t)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm"
                  >
                    <Sparkles size={13} />
                    <span>Auto-generar Escrito</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Auto-Generation with Gemini Modal */}
      {showGenerateModal && activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Auto-generar Escrito con Gemini AI
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {(activeTemplate as any).materia || 'Civil'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">{activeTemplate.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {!generatedDraft ? (
                <>
                  {/* Step 1: Select linked data */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1.5 flex items-center gap-1.5">
                        <User size={14} className="text-amber-400" />
                        Vincular Cliente (Rellena placeholders de cliente autom.):
                      </label>
                      <select
                        value={genClientId}
                        onChange={(e) => setGenClientId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                      >
                        <option value="">Seleccione cliente para auto-completar...</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.first_name} {c.last_name} ({c.rfc || 'Sin RFC'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1.5 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-amber-400" />
                        Vincular Expediente (Rellena juzgado, expediente, etc.):
                      </label>
                      <select
                        value={genCaseId}
                        onChange={(e) => setGenCaseId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                      >
                        <option value="">Seleccione expediente judicial...</option>
                        {cases.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.case_number || `EXP-${k.id}`} - {k.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Step 2: Manual Placeholders Input */}
                  {Array.isArray(activeTemplate.placeholders) && activeTemplate.placeholders.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                          Placeholders Específicos de la Plantilla:
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Si deja alguno vacío, Gemini lo deducirá o insertará un corchete de firma.
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {activeTemplate.placeholders.map((pKey) => (
                          <div key={pKey} className="space-y-1">
                            <span className="text-[11px] font-mono text-amber-400 block truncate">
                              {`{{${pKey}}}`}
                            </span>
                            <input
                              type="text"
                              value={genManualValues[pKey] || ''}
                              onChange={(e) =>
                                setGenManualValues({
                                  ...genManualValues,
                                  [pKey]: e.target.value
                                })
                              }
                              placeholder={`Valor para ${pKey}...`}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Instructions for Gemini */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block flex items-center justify-between">
                      <span>Instrucciones Especiales para el Proyectista Judicial (Gemini AI):</span>
                      <span className="text-slate-500 text-[10px]">Opcional</span>
                    </label>
                    <textarea
                      rows={3}
                      value={genInstructions}
                      onChange={(e) => setGenInstructions(e.target.value)}
                      placeholder="Ej: Fundamentar con artículos del Código Civil de Coahuila, agregar cláusula de pena convencional por retraso del 10% mensual y formalidad solemne."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>

                  {/* Template Raw Preview */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Vista previa del cuerpo de la plantilla original:
                    </span>
                    <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-sans max-h-36 overflow-y-auto">
                      {activeTemplate.content}
                    </pre>
                  </div>
                </>
              ) : (
                /* Generated Draft Preview Screen */
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check size={16} />
                      <span className="font-semibold">
                        Borrador judicial redactado exitosamente con Gemini AI
                      </span>
                    </div>
                    <button
                      onClick={() => setGeneratedDraft(null)}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Editar parámetros y re-generar
                    </button>
                  </div>

                  <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-5">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <FileText size={14} /> Redacción Definitiva Lista para Presentación
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(generatedDraft)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
                        >
                          {copiedDraft ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedDraft ? '¡Copiado!' : 'Copiar Texto'}</span>
                        </button>
                        <button
                          onClick={() => downloadDraftAsText(generatedDraft, activeTemplate.title)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all"
                        >
                          <Download size={14} />
                          <span>Descargar (.txt)</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={14}
                      value={generatedDraft}
                      onChange={(e) => setGeneratedDraft(e.target.value)}
                      className="w-full bg-transparent text-slate-200 font-sans text-xs leading-relaxed outline-none resize-y"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Modelo @google/genai • Proyectista Judicial Especializado
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-xs"
                >
                  Cerrar
                </button>
                {!generatedDraft && (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Redactando con Gemini AI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Generar Escrito Legal
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Template Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode2 size={18} className="text-amber-400" />
                {editId ? 'Editar Plantilla de Documento' : 'Crear Nueva Plantilla con Placeholders'}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-bold block mb-1">Título de la Plantilla *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej: Demanda Inicial de Juicio Ejecutivo Mercantil"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Materia Legal</label>
                  <select
                    value={formMateria}
                    onChange={(e) => setFormMateria(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  >
                    <option value="Civil">Civil</option>
                    <option value="Mercantil">Mercantil</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Laboral">Laboral</option>
                    <option value="Penal">Penal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Descripción Breve</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ej: Formato estándar para cobro de pagarés endosados en propiedad."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              {/* Placeholders Manager */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="text-slate-300 font-bold block">
                  Definición de Placeholders Dinámicos (ej: client_name, monto_deuda, juzgado):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formPlaceholderInput}
                    onChange={(e) => setFormPlaceholderInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPlaceholderToForm();
                      }
                    }}
                    placeholder="Escriba nombre de variable y pulse Agregar (ej: deudor_nombre)"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPlaceholderToForm}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formPlaceholders.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      {`{{${p}}}`}
                      <button
                        type="button"
                        onClick={() => handleRemovePlaceholderFromForm(p)}
                        className="text-amber-400 hover:text-rose-400"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Template Content with Placeholders */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Cuerpo de la Plantilla (Use llaves dobles para los placeholders):
                </label>
                <textarea
                  rows={9}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Escriba el texto legal aquí con {{variables}}..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTemplate}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                >
                  {savingTemplate ? 'Guardando...' : editId ? 'Actualizar Plantilla' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
