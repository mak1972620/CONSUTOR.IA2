import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { Payment, Case } from '../types';

export const Billing: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    case_id: '',
    amount: '',
    currency: 'MXN',
    payment_method: 'transferencia',
    description: '',
    status: 'pagado',
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [payRes, casesRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/cases'),
      ]);
      if (payRes.ok) {
        const data = await payRes.json();
        setPayments(Array.isArray(data) ? data : []);
      }
      if (casesRes.ok) {
        const cData = await casesRes.json();
        setCases(Array.isArray(cData) ? cData : []);
      }
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.amount || !newPayment.case_id) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPayment,
          case_id: Number(newPayment.case_id),
          amount: parseFloat(newPayment.amount),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setNewPayment({
          case_id: '',
          amount: '',
          currency: 'MXN',
          payment_method: 'transferencia',
          description: '',
          status: 'pagado',
        });
        fetchPayments();
      }
    } catch (e) {
      console.error('Error recording payment:', e);
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === 'pagado')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-amber-400" size={26} />
            Honorarios Profesionales y Cobranza
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro de cobros, transferencias, estados de cuenta y facturación por expediente.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus size={16} />
          Registrar Honorario / Pago
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Total Cobrado (MXN)</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            ${totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-500/80 font-medium mt-1 block">
            Ingresos liquidados
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Movimientos Registrados</p>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{payments.length}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Recibos y comprobantes
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Integración de Pasarela</p>
          <p className="text-sm font-bold text-amber-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-400" /> Stripe Connect Habilitado
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Tarjetas de crédito y débito
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Concepto / Descripción</th>
                <th className="px-6 py-4">Expediente Asignado</th>
                <th className="px-6 py-4">Método de Pago</th>
                <th className="px-6 py-4">Importe</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto text-amber-500 mb-2" />
                    Cargando historial de pagos...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    No hay movimientos financieros registrados.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-all">
                    <td className="px-6 py-4 font-semibold text-white">
                      {p.description || 'Honorarios Profesionales'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {p.case_title || `Expediente #${p.case_id}`}
                    </td>
                    <td className="px-6 py-4 text-slate-400 uppercase font-mono text-[11px]">
                      {p.payment_method || 'Transferencia'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      ${Number(p.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {p.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Registrar Nuevo Honorario / Cobro</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Expediente Judicial *
                </label>
                <select
                  required
                  value={newPayment.case_id}
                  onChange={(e) => setNewPayment({ ...newPayment, case_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                >
                  <option value="">Selecciona expediente</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number || 'S/N'} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Concepto / Descripción *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Anticipo de honorarios por interposición de demanda"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Importe ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="15000.00"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={newPayment.payment_method}
                    onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    <option value="transferencia">Transferencia SPEI</option>
                    <option value="stripe">Tarjeta (Stripe)</option>
                    <option value="efectivo">Efectivo en Caja</option>
                    <option value="cheque">Cheque Nominativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
