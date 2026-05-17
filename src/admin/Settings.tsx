import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Loader2, ShoppingBag, Facebook, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

const KEYS = {
  affiliate: 'aliexpress_affiliate_url',
  facebook:  'facebook_page_url',
};

export default function Settings() {
  const [affiliateUrl, setAffiliateUrl]   = useState('');
  const [facebookUrl,  setFacebookUrl]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [message,  setMessage]  = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', Object.values(KEYS));

    if (data) {
      const m: Record<string, string> = {};
      for (const row of data) m[row.key] = row.value || '';
      setAffiliateUrl(m[KEYS.affiliate] || '');
      setFacebookUrl(m[KEYS.facebook]  || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const rows = [
      { key: KEYS.affiliate, value: affiliateUrl.trim(), updated_at: new Date().toISOString() },
      { key: KEYS.facebook,  value: facebookUrl.trim(),  updated_at: new Date().toISOString() },
    ];

    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      setMessage({ type: 'error', text: `Erro ao guardar: ${error.message}` });
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

        {/* AliExpress Affiliate */}
        <div className="bg-[#0d121b] border border-white/5 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Link de Afiliado AliExpress</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Quando o utilizador clicar em Download, este link sera aberto numa nova aba
                antes de o download iniciar. Deixa em branco para desactivar.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              URL do Afiliado
            </label>
            <input
              type="url"
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://s.click.aliexpress.com/e/..."
              className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-orange-400/50 transition-colors"
            />
            <p className="text-[10px] text-gray-600 mt-2">
              Cola aqui o teu link de afiliado completo do AliExpress ou outro parceiro.
            </p>
          </div>
          {affiliateUrl && (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Testar link
            </a>
          )}
        </div>

        {/* Facebook Page */}
        <div className="bg-[#0d121b] border border-white/5 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Facebook className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Pagina do Facebook</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Apos o download, aparece um modal a pedir ao utilizador para seguir a tua
                pagina do Facebook. Deixa em branco para desactivar o modal.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              URL da Pagina Facebook
            </label>
            <input
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://www.facebook.com/suapagina"
              className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-blue-400/50 transition-colors"
            />
          </div>
          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Ver pagina
            </a>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
