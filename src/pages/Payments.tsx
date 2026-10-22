import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Calendar,
  Briefcase,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Case, Client } from '../types';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [caseId, setCaseId] = useState('');
  const [clientId, setClientId] = useState('');
  const [isExpense, setIsExpense] = useState(false);
  const [method, setMethod] = useState('Transferencia');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, clRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/cases'),
        fetch('/api/clients')
      ]);
      if (pRes.ok) setPayments(await pRes.json());
      if (cRes.ok) setCases(await cRes.json());
      if (clRes.ok) setClients(await clRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !concept.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          concept,
          case_id: caseId ? parseInt(caseId) : null,
          client_id: clientId ? parseInt(clientId) : null,
          is_expense: isExpense ? 1 : 0,
          method,
          type: 'manual',
          notes
        })
      });

      if (res.ok) {
        setShowModal(false);
        setAmount('');
        setConcept('');
        setNotes('');
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalIncome = payments
    .filter((p) => !p.is_expense && p.status === 'completado')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalExpenses = payments
    .filter((p) => p.is_expense && p.status === 'completado')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const netBalance = totalIncome - totalExpenses;

  const filtered = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.concept || '').toLowerCase().includes(term) ||
      (p.case_title || '').toLowerCase().includes(term) ||
      (p.client_name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <DollarSign size={14} /> Contabilidad y Liquidación Procesal
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
            Finanzas, Honorarios & Gastos de Juicio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro de cobros a clientes, pagos de traslados, viáticos judiciales y balance procesal neto.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus size={16} />
          Registrar Movimiento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowDownLeft size={16} className="text-emerald-400" />
            Honorarios Cobrados
          </span>
          <div className="mt-3 text-2xl font-extrabold text-emerald-400">
            ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpRight size={16} className="text-rose-400" />
            Gastos de Juicio Erogados
          </span>
          <div className="mt-3 text-2xl font-extrabold text-rose-400">
            ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Balance Procesal Neto
          </span>
          <div className={`mt-3 text-2xl font-extrabold ${netBalance >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            ${netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por concepto o expediente..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Concepto</th>
                <th className="px-5 py-3.5">Tipo</th>
                <th className="px-5 py-3.5">Expediente</th>
                <th className="px-5 py-3.5">Método</th>
                <th className="px-5 py-3.5">Fecha</th>
                <th className="px-5 py-3.5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin text-amber-500 mx-auto mb-2" />
                    Cargando movimientos contables...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No hay movimientos registrados.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-200">
                      {p.concept}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.is_expense
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {p.is_expense ? 'Gasto' : 'Ingreso'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {p.case_title || 'General'}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {p.method || 'Transferencia'}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('es-MX') : '-'}
                    </td>

                    <td className={`px-5 py-4 text-right font-bold text-sm ${
                      p.is_expense ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {p.is_expense ? '-' : '+'}${Number(p.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign size={16} className="text-amber-400" />
                Registrar Movimiento Financiero
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Tipo de Movimiento</label>
                  <select
                    value={isExpense ? 'expense' : 'income'}
                    onChange={(e) => setIsExpense(e.target.value === 'expense')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  >
                    <option value="income">Honorarios / Ingreso</option>
                    <option value="expense">Gasto de Juicio / Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Monto (MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ej: 5000.00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej: Anticipo de honorarios o Traslado de actuario"
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
                  <option value="">Gasto / Ingreso general...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number || `EXP-${c.id}`} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Forma de Pago</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="Transferencia">Transferencia Electrónica (SPEI)</option>
                  <option value="Efectivo">Efectivo en Oficina</option>
                  <option value="Tarjeta">Tarjeta / Terminal</option>
                  <option value="Cheque">Cheque de Caja</option>
                </select>
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
                  {saving ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
