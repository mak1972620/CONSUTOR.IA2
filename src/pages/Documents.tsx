import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Upload,
  FileText,
  Search,
  Trash2,
  Download,
  Tag,
  Loader2,
  FileDown,
  X,
  FileCode,
  Briefcase
} from 'lucide-react';
import { Case } from '../types';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [name, setName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Demanda']);
  const [docType, setDocType] = useState('Escrito Inicial');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const [dRes, cRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/cases')
      ]);
      if (dRes.ok) setDocuments(await dRes.json());
      if (cRes.ok) setCases(await cRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setUploading(true);
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          size: Math.floor(Math.random() * 500000) + 50000,
          case_id: caseId ? parseInt(caseId) : null,
          tags,
          type: docType
        })
      });

      if (res.ok) {
        setShowUploadModal(false);
        setName('');
        setCaseId('');
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desea eliminar este documento de la glosa?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = documents.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(term) ||
      (d.case_title || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <FolderOpen size={14} /> Glosa Documental Procesal
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
            Repositorio y Evidencias Probatorias
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Anexos de juicios, cédulas de notificación, traslados y contratos en custodia digital.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
        >
          <Upload size={16} />
          Registrar Documento
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de archivo o expediente..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Documento</th>
                <th className="px-5 py-3.5">Expediente Vinculado</th>
                <th className="px-5 py-3.5">Etiquetas / Categoría</th>
                <th className="px-5 py-3.5">Fecha</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin text-amber-500 mx-auto mb-2" />
                    Cargando glosa documental...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No hay documentos registrados en la glosa.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block text-xs">{d.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {d.size ? `${(d.size / 1024).toFixed(1)} KB` : 'Digital'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      <span className="font-medium text-xs">{d.case_title || 'Expediente General'}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(d.tags) &&
                          d.tags.map((t: string) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] border border-slate-800 font-medium"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-400 text-[11px]">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString('es-MX') : '-'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload size={16} className="text-amber-400" />
                Registrar Documento en Glosa
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Nombre del Documento *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Demanda Inicial Sellada por Oficialía"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Expediente Vinculado</label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="">Documento General (Sin expediente)...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number || `EXP-${c.id}`} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Etiquetas (Enter para agregar):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ej: Notificación, Factura, Amparo"
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 text-[10px] flex items-center gap-1"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                >
                  {uploading ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
