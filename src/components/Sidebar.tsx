import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileCode2,
  FolderOpen,
  CreditCard,
  ShieldAlert,
  LogOut,
  Scale,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onShowCredentials: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onShowCredentials }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Panel Principal', path: '/', icon: LayoutDashboard },
    { name: 'Expedientes', path: '/cases', icon: Briefcase },
    { name: 'Clientes', path: '/clients', icon: Users },
    { name: 'Plantillas Jurídicas', path: '/templates', icon: FileCode2 },
    { name: 'Documentos', path: '/documents', icon: FolderOpen },
    { name: 'Honorarios & Pagos', path: '/billing', icon: CreditCard },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Auditoría & Admin', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Scale size={22} />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white block">
              Lexmar<span className="text-amber-400">Corp</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              Sistema Jurídico IQ
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <item.icon size={17} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Credentials modal button & User profile */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {/* Quick Access Credentials Banner Button */}
        <button
          onClick={onShowCredentials}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-semibold"
        >
          <span className="flex items-center gap-2">
            <KeyRound size={15} />
            Credenciales de Acceso
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 uppercase font-bold">
            Demo
          </span>
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role || 'Abogado'}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Cerrar sesión"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
