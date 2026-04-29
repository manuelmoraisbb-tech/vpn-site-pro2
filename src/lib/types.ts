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
