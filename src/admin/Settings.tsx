import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Loader2, Link2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SETTING_KEY = 'shrinkme_token';
const LEGACY_URL_KEY = 'shrinkme_url';

function extractTokenFromLegacyUrl(value: string): string {
  const match = value.match(/[?&]api=([a-zA-Z0-9]+)/);
  return match ? match[1] : '';
}

export default function Settings() {
  const [shrinkmeToken, setShrinkmeToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);

    // Preferred: read the token directly.
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTING_KEY)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[v0] Error fetching settings:', error.message);
    }

    if (data?.value) {
      setShrinkmeToken(String(data.value).trim());
    } else {
      // Backwards-compat: try to extract a token from a previously saved URL.
      const { data: legacy } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', LEGACY_URL_KEY)
        .single();
      if (legacy?.value) {
        const t = extractTokenFromLegacyUrl(String(legacy.value));
        if (t) setShrinkmeToken(t);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: SETTING_KEY,
          value: shrinkmeToken.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('[v0] Error saving settings:', error);
      const isMissingTable =
        error.code === '42P01' ||
        error.message?.toLowerCase().includes('site_settings') ||
        error.message?.toLowerCase().includes('relation') ||
        error.message?.toLowerCase().includes('does not exist');
      setMessage({
        type: 'error',
        text: isMissingTable
          ? 'A tabela "site_settings" nao existe na base de dados. Execute o script SQL em scripts/001_create_site_settings.sql no Supabase SQL Editor.'
          : `Erro ao guardar: ${error.message || 'desconhecido'}`,
      });
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
                Cole apenas o seu API Token do ShrinkMe.io. O site chama a API para gerar links
                curtos em tempo real ao clicar em &quot;Ver ficheiros&quot; e DOWNLOAD.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                API Token ShrinkMe
              </label>
              <input
                type="text"
                value={shrinkmeToken}
                onChange={(e) => setShrinkmeToken(e.target.value)}
                placeholder="ex: 7cdb7ca63ac4f55cbc9f1921fb28b317261d1173"
                className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-2">
                Apenas o token (sequencia de letras/numeros). Sem &quot;https://&quot; nem
                &quot;?api=&quot;.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ExternalLink className="w-3 h-3" /> Como obter o token
              </h3>
              <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                <li>Crie uma conta em shrinkme.io</li>
                <li>No painel, abra Tools {'->'} Developer API</li>
                <li>Copie o valor do campo &quot;API Token&quot;</li>
                <li>Cole aqui em cima e clique em Guardar</li>
              </ol>
              <p className="text-[10px] text-gray-600 mt-3 leading-relaxed">
                Deixe vazio para desactivar o encurtador (downloads passam a ser directos).
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
