export type VpnFileRow = {
  id: string;
  app_id: string;
  name: string;
  region: string | null;
  pass: string | null;
  link: string;
  storage_path: string | null;
  size_bytes: number | null;
  description: string | null;
  display_order: number;
  downloads: number;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
};

export type AppRow = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
  created_at: string;
};

export const APP_COLORS: { key: string; label: string }[] = [
  { key: 'purple',  label: 'Roxo'    },
  { key: 'emerald', label: 'Verde'   },
  { key: 'yellow',  label: 'Amarelo' },
  { key: 'cyan',    label: 'Ciano'   },
  { key: 'blue',    label: 'Azul'    },
  { key: 'rose',    label: 'Rosa'    },
  { key: 'amber',   label: 'Laranja' },
  { key: 'indigo',  label: 'Índigo'  },
];

export function getAppColorClasses(color: string) {
  const map: Record<string, { card: string; badge: string }> = {
    purple:  { card: 'bg-purple-500/20 text-purple-400 border-purple-500/30',    badge: 'bg-purple-500/20 text-purple-400' },
    emerald: { card: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400' },
    yellow:  { card: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',    badge: 'bg-yellow-500/20 text-yellow-400' },
    cyan:    { card: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',           badge: 'bg-cyan-500/20 text-cyan-400' },
    blue:    { card: 'bg-blue-500/20 text-blue-400 border-blue-500/30',           badge: 'bg-blue-500/20 text-blue-400' },
    rose:    { card: 'bg-rose-500/20 text-rose-400 border-rose-500/30',           badge: 'bg-rose-500/20 text-rose-400' },
    amber:   { card: 'bg-amber-500/20 text-amber-400 border-amber-500/30',        badge: 'bg-amber-500/20 text-amber-400' },
    indigo:  { card: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',     badge: 'bg-indigo-500/20 text-indigo-400' },
  };
  return map[color] ?? map['cyan'];
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export type FileStatus = 'active' | 'scheduled' | 'expired';

export function getFileStatus(row: VpnFileRow): FileStatus {
  const now = new Date();
  if (row.valid_until && new Date(row.valid_until) < now) return 'expired';
  if (row.valid_from && new Date(row.valid_from) > now) return 'scheduled';
  return 'active';
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
