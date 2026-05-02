import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { VpnFileRow } from '../lib/types';

export function useVpnFiles(adminMode = false) {
  const [rows, setRows] = useState<VpnFileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
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

      const { data, error: err } = await query;

      if (err) throw err;
      setRows((data || []) as VpnFileRow[]);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel(adminMode ? 'admin_changes' : 'public_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vpn_files' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminMode]);

  return { rows, loading, error };
  }        setError(null);
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
