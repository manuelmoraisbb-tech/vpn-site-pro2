import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Loader2, Link2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const [adflyUrl, setAdflyUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'adfly_url')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[v0] Error fetching settings:', error.message);
    }
    
    if (data) {
      setAdflyUrl(data.value || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'adfly_url', value: adflyUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });

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
        {/* Adfly Configuration */}
        <div className="bg-[#0d121b] border border-white/5 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Link2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Configuracao Adfly</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Configure o URL base do Adfly para monetizar os cliques nos botoes &quot;Ver ficheiros&quot;. 
                O URL final sera gerado automaticamente com o destino do ficheiro.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                URL Base Adfly
              </label>
              <input
                type="text"
                value={adflyUrl}
                onChange={(e) => setAdflyUrl(e.target.value)}
                placeholder="https://adf.ly/sua-id/?url="
                className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-2">
                Exemplo: https://adf.ly/1234567/?url= (o destino sera adicionado automaticamente)
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ExternalLink className="w-3 h-3" /> Como configurar
              </h3>
              <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                <li>Crie uma conta em adf.ly ou similar</li>
                <li>Va a Ferramentas {'->'} Link Full Page Script</li>
                <li>Copie o URL base (ex: https://adf.ly/ID/?url=)</li>
                <li>Cole no campo acima e guarde</li>
              </ol>
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
