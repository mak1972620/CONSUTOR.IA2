import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  History,
  ShieldCheck,
  Loader2,
  Calendar,
  KeyRound,
} from 'lucide-react';
import { AuditLog, User } from '../types';

export const Admin: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [logsRes, usersRes] = await Promise.all([
          fetch('/api/admin/audit'),
          fetch('/api/admin/users'),
        ]);
        if (logsRes.ok) {
          const lData = await logsRes.json();
          setLogs(Array.isArray(lData) ? lData : []);
        }
        if (usersRes.ok) {
          const uData = await usersRes.json();
          setUsers(Array.isArray(uData) ? uData : []);
        }
      } catch (e) {
        console.error('Error fetching admin data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)));
      }
    } catch (e) {
      console.error('Error updating role:', e);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="text-amber-400" size={26} />
          Panel de Auditoría del Sistema & Control de Acceso
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Trazabilidad procesal inmutable, auditoría de acciones sensibles y administración de roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users size={16} className="text-amber-400" />
            Usuarios & Roles del Despacho
          </h2>
          <div className="divide-y divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-amber-400 font-semibold rounded-lg px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="admin">Administrador</option>
                  <option value="abogado">Abogado</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History size={16} className="text-amber-400" />
            Bitácora de Auditoría Procesal
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Acción</th>
                  <th className="py-2.5 px-3">Entidad</th>
                  <th className="py-2.5 px-3">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      <Loader2 size={18} className="animate-spin mx-auto text-amber-500 mb-2" />
                      Cargando bitácora de eventos...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No hay registros en la bitácora.
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'Reciente'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-400 text-[11px]">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 uppercase text-[10px] text-slate-300">
                        {log.entity || 'Sistema'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {log.user_email || `Usuario #${log.user_id}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
