import React, { useState } from 'react';
import { KeyRound, Copy, Check, X, ShieldCheck, User } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const credentials = [
    {
      role: 'Administrador Principal',
      email: 'marco@lexmarcorp.com',
      password: 'LexmarCorp!2026',
      desc: 'Acceso total: gestión de usuarios, auditoría, facturación y configuración.',
    },
    {
      role: 'Administrador Secundario (Google)',
      email: 'marco0620.map@gmail.com',
      password: 'LexmarCorp!2026',
      desc: 'Cuenta de desarrollador y supervisor con privilegios elevados.',
    },
    {
      role: 'Abogado Asociado',
      email: 'abogado@lexmarcorp.com',
      password: 'LexmarCorp!2026',
      desc: 'Gestión procesal: expedientes, plantillas, clientes y exportaciones PDF.',
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Credenciales de Acceso al Sistema</h3>
              <p className="text-xs text-slate-400">Cuentas preconfiguradas para pruebas y auditoría</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Credentials List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {credentials.map((cred, idx) => (
            <div
              key={idx}
              className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  {cred.role}
                </span>
                <span className="text-[10px] text-slate-400">Rol Activo</span>
              </div>
              <p className="text-[11px] text-slate-400">{cred.desc}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Email */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                  <div className="min-w-0 mr-2">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Email</p>
                    <p className="text-xs font-mono text-slate-200 truncate">{cred.email}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(cred.email, `email-${idx}`)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 transition-all rounded"
                    title="Copiar email"
                  >
                    {copiedKey === `email-${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Password */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                  <div className="min-w-0 mr-2">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Contraseña</p>
                    <p className="text-xs font-mono text-amber-300 truncate">{cred.password}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(cred.password, `pass-${idx}`)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 transition-all rounded"
                    title="Copiar contraseña"
                  >
                    {copiedKey === `pass-${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
