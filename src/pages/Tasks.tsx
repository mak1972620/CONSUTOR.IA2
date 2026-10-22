import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  Briefcase
} from 'lucide-react';
import { Task, Case } from '../types';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [caseId, setCaseId] = useState('');
  const [priority, setPriority] = useState('Alta');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/cases')
      ]);
      if (tRes.ok) setTasks(await tRes.json());
      if (cRes.ok) setCases(await cRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          case_id: caseId ? parseInt(caseId) : null,
          priority,
          due_date: dueDate || null
        })
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setDescription('');
        setCaseId('');
        setDueDate('');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'todos' || t.priority === filterPriority;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(term) ||
      (t.case_title || '').toLowerCase().includes(term) ||
      (t.description || '').toLowerCase().includes(term);
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <CheckSquare size={14} /> Calendario Procesal & Términos
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
            Diligencias y Términos Judiciales
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control de términos fatales, requerimientos de pago, embargos y audiencias.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus size={16} />
          Nueva Diligencia
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar diligencias o expedientes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['todos', 'Alta', 'Media', 'Baja'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterPriority === p
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === 'todos' ? 'Todas las prioridades' : `Prioridad ${p}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            <Loader2 size={24} className="animate-spin text-amber-500 mx-auto mb-2" />
            Cargando diligencias...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No hay diligencias que coincidan con la búsqueda.
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    task.priority === 'Alta' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Prioridad {task.priority || 'Normal'}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {task.status || 'Pendiente'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-sm leading-snug">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Briefcase size={13} className="text-amber-500" />
                    <span className="truncate">{task.case_title || 'General'}</span>
                  </div>
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-amber-400 font-medium">
                      <Calendar size={13} />
                      <span>Término: {new Date(task.due_date).toLocaleDateString('es-MX')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare size={16} className="text-amber-400" />
                Registrar Diligencia / Término
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Título de la Diligencia *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Emplazamiento y Embargo con Actuario"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Expediente Asociado</label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="">Seleccione expediente...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number || `EXP-${c.id}`} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  >
                    <option value="Alta">Alta (Término fatal)</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Instrucciones / Observaciones</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instrucciones para pasantes, actuarios o abogado postulante..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear Diligencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
