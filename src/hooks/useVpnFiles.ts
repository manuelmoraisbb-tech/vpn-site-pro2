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
      setLoading(true);
      const now = new Date().toISOString();

      let query = supabase
        .from('vpn_files')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!adminMode) {
        query = query
          .or(`valid_from.is.null,valid_from.lte.${now}`)
          .or(`valid_until.is.null,valid_until.gte.${now}`);
      }

      const { data, error } = await query;

      if (!mounted) return;
      if (error) {
        console.error('[v0] Failed to load vpn_files:', error.message);
        setError(error.message);
      } else {
        setRows((data || []) as VpnFileRow[]);
        setError(null);
      }
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(adminMode ? 'vpn_files_admin' : 'vpn_files_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vpn_files' },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [adminMode]);

  return { rows, loading, error };
}
