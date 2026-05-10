import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const TOKEN_KEY = 'shrinkme_token';
const LEGACY_URL_KEY = 'shrinkme_url';

/**
 * Try to extract an API token from a previously-saved ShrinkMe URL like:
 *   https://shrinkme.io/full?api=TOKEN&url=
 * so existing admin data keeps working.
 */
function extractTokenFromLegacyUrl(value: string): string {
  const match = value.match(/[?&]api=([a-zA-Z0-9]+)/);
  return match ? match[1] : '';
}

/**
 * Hook that loads the configured ShrinkMe API token and provides an async
 * `shorten` function that calls the public ShrinkMe API.
 *
 * The API responds with JSON: { status, message, shortenedUrl }.
 * If no token is configured or the request fails, the original URL is returned
 * (graceful fallback - the user still gets to the file).
 */
export function useShortener() {
  const [token, setToken] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', TOKEN_KEY)
        .single();

      let tk = data?.value ? String(data.value).trim() : '';

      if (!tk) {
        // Backwards-compat: pull token out of the old URL-style setting if present.
        const { data: legacy } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', LEGACY_URL_KEY)
          .single();
        if (legacy?.value) tk = extractTokenFromLegacyUrl(String(legacy.value));
      }

      if (!active) return;
      setToken(tk);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  /**
   * Calls the ShrinkMe API and returns a monetized short URL for `destination`.
   * Falls back to the original URL on any failure so navigation never breaks.
   */
  const shorten = useCallback(
    async (destination: string): Promise<string> => {
      if (!token) return destination;
      try {
        const apiUrl = `https://shrinkme.io/api?api=${encodeURIComponent(
          token
        )}&url=${encodeURIComponent(destination)}`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          status?: string;
          shortenedUrl?: string;
          message?: string;
        };
        if (json.status === 'success' && json.shortenedUrl) {
          return json.shortenedUrl;
        }
        console.warn('[v0] ShrinkMe API non-success:', json);
        return destination;
      } catch (err) {
        console.warn('[v0] ShrinkMe API error, falling back to direct URL:', err);
        return destination;
      }
    },
    [token]
  );

  return { token, loaded, shorten, hasToken: Boolean(token) };
}
