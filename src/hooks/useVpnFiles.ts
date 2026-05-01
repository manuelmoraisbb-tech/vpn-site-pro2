import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { VpnFileRow } from '../lib/types';

export function useVpnFiles(adminMode = false) {
  const [rows, setRows] = useState<VpnFileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);        'postgres_changes',
        { event: '*', schema: 'public', table: 'vpn_files' },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === 'INSERT') {
              const next = [...prev, payload.new as VpnFileRow];
              return next.sort(
                (a, b) =>
                  a.display_order - b.display_order ||
                  (a.created_at < b.created_at ? 1 : -1)
              );
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((r) =>
                r.id === (payload.new as VpnFileRow).id
                  ? (payload.new as VpnFileRow)
                  : r
              );
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((r) => r.id !== (payload.old as VpnFileRow).id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { rows, loading, error };
}
