import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FolderOpen, Download, Smartphone } from 'lucide-react';
import { useVpnFiles } from '../hooks/useVpnFiles';
import { apps } from '../constants';

export default function Dashboard() {
  const { rows, loading } = useVpnFiles();

  const totalFiles = rows.length;
  const totalDownloads = rows.reduce((s, r) => s + (r.downloads || 0), 0);

  const filesPerApp = apps.map((a) => ({
    ...a,
    count: rows.filter((r) => r.app_id === a.id).length,
  }));

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">DASHBOARD</h1>
          <p className="text-xs text-gray-500 mt-1">
            Visão geral das configurações publicadas no site público.
          </p>
        </div>
        <Link
          to="/admin/upload"
          className="inline-flex items-center gap-2 bg-cyan-400 text-black px-5 py-2.5 rounded-lg font-black text-xs tracking-wider hover:bg-white transition-colors"
        >
          <Upload className="w-4 h-4" /> Novo Ficheiro
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          icon={<FolderOpen className="w-5 h-5" />}
          tone="cyan"
          value={loading ? '—' : String(totalFiles)}
          label="Ficheiros totais"
        />
        <StatCard
          icon={<Download className="w-5 h-5" />}
          tone="green"
          value={loading ? '—' : String(totalDownloads)}
          label="Downloads"
        />
        <StatCard
          icon={<Smartphone className="w-5 h-5" />}
          tone="purple"
          value={String(apps.length)}
          label="Apps VPN"
        />
      </div>

      <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase mb-3">
        Apps VPN
      </div>
      <div className="space-y-2">
        {filesPerApp.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-4 bg-[#0d121b] border border-white/5 rounded-xl p-4"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{a.name}</div>
              <div className="text-[11px] text-gray-500">
                {a.count} {a.count === 1 ? 'ficheiro carregado' : 'ficheiros carregados'}
              </div>
            </div>
            <Link
              to={`/admin/upload?app=${a.id}`}
              className="bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-cyan-400 hover:text-black transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3 h-3" /> Upload
            </Link>
            <Link
              to={`/admin/files?app=${a.id}`}
              className="bg-white/5 text-gray-300 border border-white/10 px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <FolderOpen className="w-3 h-3" /> Ver
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  tone: 'cyan' | 'green' | 'purple';
}) {
  const toneMap = {
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    purple: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20',
  } as const;
  return (
    <div className="bg-[#0d121b] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${toneMap[tone]}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-black ${toneMap[tone].split(' ')[0]}`}>{value}</div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          {label}
        </div>
      </div>
    </div>
  );
}
