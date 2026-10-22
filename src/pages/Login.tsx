import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500">
          LexmarCorp IQ • Todos los derechos reservados © 2026
        </div>
      </div>
    </div>
  );
};
