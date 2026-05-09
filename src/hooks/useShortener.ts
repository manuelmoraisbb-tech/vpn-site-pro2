import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to fetch the configured ShrinkMe (or compatible) shortener base URL
 * from site_settings and provides a `wrap` helper to build a redirect URL.
 *
 * Accepted base URL formats (admin pastes one of these):
 *  - https://shrinkme.io/full?api=TOKEN&url=          (ends with `url=` - destination is appended)
 *  - https://shrinkme.io/full?api=TOKEN              (no url param - we append `&url=DEST`)
 *  - https://example.com/redirect/                    (no query string - we append `?url=DEST`)
 */
export function useShortener() {
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'shrinkme_url')
      .single()
      .then(({ data }) => {
        if (!active) return;
        if (data?.value) setBaseUrl(String(data.value).trim());
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const wrap = (destination: string): string => {
    if (!baseUrl) return destination;
    const encoded = encodeURIComponent(destination);
    // If the admin already ended the base URL with `url=`, just append the destination.
    if (/[?&]url=$/.test(baseUrl)) {
      return `${baseUrl}${encoded}`;
    }
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${sep}url=${encoded}`;
  };

  return { baseUrl, loaded, wrap };
}
