import { useState, useMemo, useRef, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Upload,
  FileText,
  Loader2,
  Package,
  ClipboardList,
  CheckCircle2,
  X,
  Calendar,
} from 'lucide-react';
import { supabase, STORAGE_BUCKET } from '../lib/supabase';
import { apps } from '../constants';

const ACCEPT = '.ehi,.npx,.ovpn,.conf,.zip,.json,.txt,.vmn,.bin,.cfg';
const MAX_BYTES = 50 * 1024 * 1024;

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function UploadFile() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialApp = params.get('app') || apps[0].id;

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [appId, setAppId] = useState(initialApp);
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [region, setRegion] = useState('');
  const [order, setOrder] = useState(0);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validFrom, setValidFrom] = useState(toLocalDatetimeValue(now));
  const [validUntil, setValidUntil] = useState(toLocalDatetimeValue(in24h));

  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filesPerApp = useMemo(() => apps.map((a) => ({ ...a })), []);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError('Ficheiro acima de 50 MB');
      return;
    }
    setError(null);
    setFile(f);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Seleciona um ficheiro'); return; }
    if (!name.trim()) { setError('Indica um título'); return; }
    if (validFrom && validUntil && new Date(validFrom) >= new Date(validUntil)) {
      setError('A data de fim deve ser depois da data de início');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      setProgress('A enviar ficheiro para o storage...');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${appId}/${Date.now()}_${safeName}`;

      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream',
        });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      setProgress('A registar configuração...');
      const { error: insErr } = await supabase.from('vpn_files').insert({
        app_id: appId,
        name: name.trim(),
        region: region.trim(),
        pass: pass.trim(),
        link: publicUrl,
        storage_path: path,
        size_bytes: file.size,
        description: description.trim(),
        display_order: order,
        valid_from: validFrom ? new Date(validFrom).toISOString() : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      });
      if (insErr) throw insErr;

      setProgress('');
      setSuccess(true);
      setName('');
      setPass('');
      setRegion('');
      setDescription('');
      setOrder(0);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      const newNow = new Date();
      setValidFrom(toLocalDatetimeValue(newNow));
      setValidUntil(toLocalDatetimeValue(new Date(newNow.getTime() + 24 * 60 * 60 * 1000)));

      setTimeout(() => navigate('/admin/files'), 900);
    } catch (err: any) {
      console.error('[v0] upload error:', err);
      setError(err.message || 'Erro a enviar ficheiro');
      setProgress('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase mb-6 flex items-center gap-2">
        <Upload className="w-5 h-5 text-cyan-400" /> Enviar Ficheiro VPN
      </h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="bg-[#0d121b] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-5">
            <ClipboardList className="w-4 h-4" /> Detalhes
          </div>

          <Field label="App VPN *">
            <select
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
            >
              {filesPerApp.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Título *">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Configuração Angola TPA #1"
              className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Palavra-passe (opcional)">
              <input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Deixa vazio se não tiver"
                className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
              />
            </Field>
            <Field label="Servidor / Operadora">
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ex: UNITEL, MOVICEL"
                className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
              />
            </Field>
          </div>

          <Field label="Ordem de exibição">
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
            />
            <p className="text-[10px] text-gray-600 mt-1">
              0 = primeiro · valores maiores aparecem depois
            </p>
          </Field>

          <Field label="Descrição (opcional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Notas sobre esta configuração..."
              className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 resize-none"
            />
          </Field>
        </section>

        <section className="bg-[#0d121b] border border-cyan-400/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
            <Calendar className="w-4 h-4" /> Agendamento
          </div>
          <p className="text-[11px] text-gray-500 mb-5 leading-relaxed">
            Define quando este ficheiro deve aparecer e desaparecer no site. Podes preparar vários ficheiros para dias diferentes de uma só vez.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Início (válido a partir de)">
              <input
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-white [color-scheme:dark]"
              />
              <p className="text-[10px] text-gray-600 mt-1">
                Deixa como está para aparecer agora
              </p>
            </Field>

            <Field label="Fim (expira em)">
              <input
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-[#161c26] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-white [color-scheme:dark]"
              />
              <p className="text-[10px] text-gray-600 mt-1">
                Por defeito: 24 horas após o início
              </p>
            </Field>
          </div>

          <div className="mt-3 bg-cyan-400/5 border border-cyan-400/10 rounded-lg px-4 py-3 text-[11px] text-cyan-300 leading-relaxed">
            💡 <strong>Dica:</strong> Para agendar a semana toda, envia os 7 ficheiros agora, cada um com a sua data de início. O site mostrará automaticamente o ficheiro certo em cada dia.
          </div>
        </section>

        <section className="bg-[#0d121b] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-5">
            <Package className="w-4 h-4" /> Ficheiro
          </div>

          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-cyan-400 bg-cyan-400/5'
                : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="text-sm font-bold truncate max-w-[260px]">{file.name}</div>
                  <div className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-gray-500 hover:text-red-400 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-7 h-7 mx-auto mb-3 text-cyan-400" />
                <div className="text-sm font-bold mb-1">Clica ou arrasta o ficheiro aqui</div>
                <div className="text-[10px] text-gray-500">
                  .ehi · .npx · .ovpn · .conf · .zip · .json · .txt · .vmn · .bin · .cfg — Max 50MB
                </div>
              </>
            )}
          </label>
        </section>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Configuração guardada e agendada com sucesso!
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-cyan-400 text-black px-6 py-3 rounded-lg font-black text-xs tracking-wider hover:bg-white transition-colors disabled:opacity-60"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {progress || 'A ENVIAR...'}</>
          ) : (
            <><Upload className="w-4 h-4" /> ENVIAR E AGENDAR</>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
