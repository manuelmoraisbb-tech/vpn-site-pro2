import { NavLink, Navigate, Outlet, Link } from 'react-router-dom';
import {
  LayoutGrid, Upload, FolderOpen, Globe, LogOut,
  Shield, Loader2, Settings, MessageSquare, Smartphone,
} from 'lucide-react';
import { useAuth } from './AuthContext';

const navItems = [
  { to: '/admin',          label: 'Dashboard',        icon: LayoutGrid,  end: true },
  { to: '/admin/apps',     label: 'Apps VPN',         icon: Smartphone,  end: false },
  { to: '/admin/upload',   label: 'Enviar Ficheiro',  icon: Upload,      end: false },
  { to: '/admin/files',    label: 'Ficheiros',        icon: FolderOpen,  end: false },
  { to: '/admin/comments', label: 'Comentarios',      icon: MessageSquare, end: false },
  { to: '/admin/settings', label: 'Configuracoes',    icon: Settings,    end: false },
];

export default function AdminLayout() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030509] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-[#030509] text-white font-sans flex flex-col md:flex-row">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <aside className="relative z-20 w-full md:w-[260px] md:min-h-screen border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2 font-black text-base tracking-wider">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span>ADMIN</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1">VPN Free AO</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
          >
            <Globe className="w-4 h-4" />
            Ver Site
          </Link>
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="text-[10px] text-gray-600 px-3 mb-2 truncate">{session.user.email}</div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Terminar sessão
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
