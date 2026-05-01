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

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
