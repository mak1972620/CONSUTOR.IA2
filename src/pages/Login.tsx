import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('marco@lexmarcorp.com');
  const [password, setPassword] = useState('LexmarCorp!2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciales incorrectas. Verifique correo y contraseña.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('LexmarCorp!2026');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 shadow-xl shadow-amber-500/20 text-2xl mx-auto tracking-wider">
            LX
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            LEXMAR<span className="text-amber-400">CORP</span> IQ
          </h1>
          <p className="text-xs text-slate-400">
            Sistema de Gestión Procesal, Plantillas Jurídicas IA & Exportación PDF
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@lexmarcorp.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500 text-xs transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500 text-xs transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Validando Credenciales...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Ingresar al Despacho
                </>
              )}
            </button>
          </form>

          {/* 1-Click Google Sign In */}
          <div className="pt-4 border-t border-slate-800">
            <a
              href="/auth/callback?email=marco0620.MAP@gmail.com"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continuar con Google (Marco Perales)</span>
            </a>
          </div>

          {/* Credenciales de Acceso Rápidas */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
              <KeyRound size={13} /> Credenciales de Acceso Disponibles:
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div
                onClick={() => handleQuickFill('marco@lexmarcorp.com')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-slate-200 font-mono font-medium block">marco@lexmarcorp.com</span>
                  <span className="text-[10px] text-amber-400/80">CEO Lic. Marco Perales (Admin)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">LexmarCorp!2026</span>
              </div>

              <div
                onClick={() => handleQuickFill('marco0620.map@gmail.com')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-slate-200 font-mono font-medium block">marco0620.map@gmail.com</span>
                  <span className="text-[10px] text-amber-400/80">Google Admin Account</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">LexmarCorp!2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500">
          LexmarCorp IQ • Todos los derechos reservados © 2026
        </div>
      </div>
    </div>
  );
};
