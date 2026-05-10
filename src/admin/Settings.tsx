import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Loader2, Link2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SETTING_KEY = 'shrinkme_url';

export default function Settings() {
  const [shrinkmeUrl, setShrinkmeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    // Try the new key first, fall back to the legacy adfly_url so existing data is preserved.
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTING_KEY)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[v0] Error fetching settings:', error.message);
    }

    if (data?.value) {
      setShrinkmeUrl(data.value || '');
    } else {
      // Legacy fallback: read old adfly_url if present so the admin can review/migrate it.
      const { data: legacy } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'adfly_url')
        .single();
      if (legacy?.value) setShrinkmeUrl(legacy.value);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key: SETTING_KEY, value: shrinkmeUrl, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('[v0] Error saving settings:', error.message);
      setMessage({ type: 'error', text: 'Erro ao guardar configuracoes.' });
    } else {
      setMessage({ type: 'success', text: 'Configuracoes guardadas com sucesso!' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Configuracoes</h1>
            <p className="text-xs text-gray-500">Gerir definicoes do site</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl space-y-6">
        {/* ShrinkMe Configuration */}
        <div className="bg-[#0d121b] border border-white/5 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Link2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Configuracao ShrinkMe</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Configure o URL base do ShrinkMe.io para monetizar os cliques em &quot;Ver
                ficheiros&quot; e nos botoes DOWNLOAD. O destino e adicionado automaticamente.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                URL Base ShrinkMe
              </label>
              <input
                type="text"
                value={shrinkmeUrl}
                onChange={(e) => setShrinkmeUrl(e.target.value)}
                placeholder="https://shrinkme.io/full?api=SEU_TOKEN&url="
                className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-2">
                Exemplo: https://shrinkme.io/full?api=SEU_TOKEN&url= (o destino sera adicionado
                automaticamente)
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ExternalLink className="w-3 h-3" /> Como configurar
              </h3>
              <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                <li>Crie uma conta em shrinkme.io</li>
                <li>
                  Va a Tools {'->'} Developer API e copie o seu API Token
                </li>
                <li>
                  Cole o URL no formato: https://shrinkme.io/full?api=SEU_TOKEN&url=
                </li>
                <li>Guarde - o site vai usar este URL para encurtar todos os links</li>
              </ol>
              <p className="text-[10px] text-gray-600 mt-3 leading-relaxed">
                Tambem aceita outros encurtadores compativeis (AdFly, ouo.io, etc) desde que sigam
                o padrao &quot;...?url=&quot; ou &quot;...?api=TOKEN&amp;url=&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Configuracoes
          </button>

          {message && (
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
