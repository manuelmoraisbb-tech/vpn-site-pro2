import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Trash2, ExternalLink, Upload, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useVpnFiles } from '../hooks/useVpnFiles';
import { supabase, STORAGE_BUCKET } from '../lib/supabase';
import { apps } from '../constants';
import { formatBytes, formatDateTime, getFileStatus, type FileStatus } from '../lib/types';

const STATUS_LABEL: Record<FileStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: {
    label: 'Ativo',
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  scheduled: {
    label: 'Agendado',
    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    icon: <Clock className="w-3 h-3" />,
  },
  expired: {
    label: 'Expirado',
    color: 'text-red-400 bg-red-400/10 border-red-400/20',
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function FilesList() {
  const [params, setParams] = useSearchParams();
  const filterApp = params.get('app') || 'all';
  const { rows, loading } = useVpnFiles(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filterApp === 'all' ? rows : rows.filter((r) => r.app_id === filterApp)),
    [rows, filterApp]
  );

  const onDelete = async (id: string, storagePath: string | null) => {
    if (!confirm('Apagar esta configuração definitivamente?')) return;
    setDeleting(id);
    try {
      if (storagePath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      }
      const { error } = await supabase.from('vpn_files').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      console.error('[v0] delete error:', err);
      alert(err.message || 'Erro a apagar');
    } finally {
      setDeleting(null);
    }
  };

  const counts = useMemo(() => {
    const active = rows.filter((r) => getFileStatus(r) === 'active').length;
    const scheduled = rows.filter((r) => getFileStatus(r) === 'scheduled').length;
    const expired = rows.filter((r) => getFileStatus(r) === 'expired').length;
    return { active, scheduled, expired };
  }, [rows]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase">Ficheiros</h1>
          <p className="text-xs text-gray-500 mt-1">
            O site público mostra apenas os ficheiros <span className="text-emerald-400 font-bold">Ativos</span> no momento atual.
          </p>
        </div>
        <Link
          to="/admin/upload"
          className="inline-flex items-center gap-2 bg-cyan-400 text-black px-5 py-2.5 rounded-lg font-black text-xs tracking-wider hover:bg-white transition-colors self-start"
        >
          <Upload className="w-4 h-4" /> Novo Ficheiro
        </Link>
      </div>

      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#0d121b] border border-emerald-400/10 rounded-xl p-4 text-center">
            <strong className="block text-xl font-bold text-emerald-400">{counts.active}</strong>
            <small className="text-[9px] text-gray-500 tracking-widest uppercase">Ativos agora</small>
          </div>
          <div className="bg-[#0d121b] border border-cyan-400/10 rounded-xl p-4 text-center">
            <strong className="block text-xl font-bold text-cyan-400">{counts.scheduled}</strong>
            <small className="text-[9px] text-gray-500 tracking-widest uppercase">Agendados</small>
          </div>
          <div className="bg-[#0d121b] border border-red-400/10 rounded-xl p-4 text-center">
            <strong className="block text-xl font-bold text-red-400">{counts.expired}</strong>
            <small className="text-[9px] text-gray-500 tracking-widest uppercase">Expirados</small>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        <FilterChip
          label={`Todos (${rows.length})`}
          active={filterApp === 'all'}
          onClick={() => setParams({})}
        />
        {apps.map((a) => {
          const count = rows.filter((r) => r.app_id === a.id).length;
          return (
            <FilterChip
              key={a.id}
              label={`${a.icon} ${a.name} (${count})`}
              active={filterApp === a.id}
              onClick={() => setParams({ app: a.id })}
            />
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> A carregar...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d121b] border border-dashed border-white/10 rounded-2xl p-12 text-center">
          <div className="text-4xl opacity-20 mb-3">📭</div>
          <p className="text-sm font-bold mb-1">Nenhum ficheiro carregado</p>
          <p className="text-xs text-gray-500 mb-4">
            Quando enviares uma configuração, ela aparece aqui e no site público.
          </p>
          <Link
            to="/admin/upload"
            className="inline-flex items-center gap-2 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-4 py-2 rounded-lg text-xs font-bold hover:bg-cyan-400 hover:text-black transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Enviar primeiro ficheiro
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const app = apps.find((a) => a.id === r.app_id);
            const status = getFileStatus(r);
            const statusInfo = STATUS_LABEL[status];
            return (
              <div
                key={r.id}
                className={`bg-[#0d121b] border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
                  status === 'expired' ? 'border-white/5 opacity-60' : 'border-white/5'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">
                  {app?.icon ?? '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm truncate">{r.name}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-1 uppercase tracking-widest font-bold">
                    <span>{app?.name || r.app_id}</span>
                    {r.region && <span>· {r.region}</span>}
                    <span>· {formatBytes(r.size_bytes)}</span>
                    <span>· {r.downloads} dls</span>
                    {r.pass && <span className="text-cyan-400">· protegido</span>}
                  </div>
                  <div className="text-[10px] text-gray-600 flex flex-wrap gap-x-3 mt-1 font-medium">
                    <span>🕐 Início: {formatDateTime(r.valid_from)}</span>
                    <span>⏳ Fim: {formatDateTime(r.valid_until)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/5 text-gray-300 border border-white/10 px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" /> Abrir
                  </a>
                  <button
                    onClick={() => onDelete(r.id, r.storage_path)}
                    disabled={deleting === r.id}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {deleting === r.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Apagar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[11px] font-bold border transition-colors ${
        active
          ? 'bg-cyan-400 text-black border-cyan-400'
          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
