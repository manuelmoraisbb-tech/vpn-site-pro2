import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AppRow } from '../lib/types';

export function useApps() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApps = async () => {
    const { data } = await supabase
      .from('apps')
      .select('*')
      .order('display_order', { ascending: true });
    setApps((data || []) as AppRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadApps();
    const channel = supabase
      .channel('apps_public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apps' }, loadApps)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { apps, loading, reload: loadApps };
}
