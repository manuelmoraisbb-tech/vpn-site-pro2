import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSiteSettings(keys: string[]) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', keys)
      .then(({ data }) => {
        if (data) {
          const m: Record<string, string> = {};
          for (const row of data) m[row.key] = row.value || '';
          setSettings(m);
        }
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { settings, loading };
}
