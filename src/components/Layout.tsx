import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  DollarSign,
  CheckSquare,
  Shield,
  LayoutDashboard,
  LogOut,
  FolderOpen,
  Menu,
  X,
  FileCode2,
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Expedientes', path: '/cases', icon: Briefcase, badge: 'PDF' },
    { label: 'Plantillas IA', path: '/templates', icon: FileCode2, highlight: true },
    { label: 'Clientes', path: '/clients', icon: Users },
    { label: 'Documentos', path: '/documents', icon: FolderOpen },
    { label: 'Diligencias / Tareas', path: '/tasks', icon: CheckSquare },
    { label: 'Finanzas & Pagos', path: '/payments', icon: DollarSign },
    ...(user?.role === 'admin'
      ? [{ label: 'Auditoría & Usuarios', path: '/admin', icon: Shield }]
      : [])
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 select-none">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20 text-lg tracking-wider">
              LX
            </div>
            <div>
              <span className="font-bold text-base tracking-wide text-white block leading-none">
                LEXMAR<span className="text-amber-500">CORP</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-amber-400/80 tracking-widest mt-1 block">
                IQ Legal Suite
              </span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Módulos Principales
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles size={10} /> IA
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {user?.name || 'Usuario'}
                </span>
                <span className="text-[10px] text-amber-400/90 capitalize block truncate">
                  {user?.role || 'Abogado'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm">
            LX
          </div>
          <span className="font-bold text-sm tracking-wide text-white">
            LEXMAR<span className="text-amber-500">CORP</span> IQ
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-amber-400" />
                <span>{item.label}</span>
              </div>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-950">
        {children}
      </main>
    </div>
  );
};
