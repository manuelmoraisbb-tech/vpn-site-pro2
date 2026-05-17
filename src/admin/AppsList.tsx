import { useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, LayoutGrid, X, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApps } from '../hooks/useApps';
import { APP_COLORS, getAppColorClasses, type AppRow } from '../lib/types';

const EMPTY_FORM = { id: '', name: '', description: '', icon: '🔒', color: 'cyan', display_order: 0 };

type FormState = typeof EMPTY_FORM;

function AppForm({
  initial,
  isEdit,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial: FormState;
  isEdit: boolean;
  onSave: (f: FormState) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (k: keyof FormState, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="bg-[#0d121b] border border-white/10 rounded-2xl p-6 space-y-4">
      <h3 className="font-bold text-lg">{isEdit ? 'Editar App' : 'Nova App VPN'}</h3>

      {/* ID (só na criacao) */}
      {!isEdit && (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            ID único (slug)
          </label>
          <input
            value={form.id}
            onChange={(e) => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="ex: nova_app"
            className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-400/50"
          />
          <p className="text-[10px] text-gray-600 mt-1">Letras minúsculas, números e _ . Não pode ser alterado depois.</p>
        </div>
      )}
      {isEdit && (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ID</label>
          <input value={form.id} disabled className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-gray-500 cursor-not-allowed" />
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nome</label>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="ex: HTTP Injector"
          className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400/50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Descricao</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          placeholder="Breve descricao da app..."
          className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 resize-none"
        />
      </div>

      {/* Icon + Color */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Icone (emoji)</label>
          <input
            value={form.icon}
            onChange={(e) => set('icon', e.target.value)}
            placeholder="🔒"
            className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-2xl focus:outline-none focus:border-cyan-400/50"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cor</label>
          <select
            value={form.color}
            onChange={(e) => set('color', e.target.value)}
            className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
          >
            {APP_COLORS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Order */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ordem de exibicao</label>
        <input
          type="number"
          value={form.display_order}
          onChange={(e) => set('display_order', Number(e.target.value))}
          className="w-full bg-[#161c26] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="flex items-center gap-2 bg-cyan-400 text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Guardar alteracoes' : 'Criar App'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 bg-white/5 text-gray-400 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </div>
  );
}

export default function AppsList() {
  const { apps, loading, reload } = useApps();
  const [showForm, setShowForm]   = useState(false);
  const [editApp,  setEditApp]    = useState<AppRow | null>(null);
  const [saving,   setSaving]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const handleCreate = async (form: FormState) => {
    if (!form.id)   return setFormError('O ID é obrigatório.');
    if (!form.name) return setFormError('O nome é obrigatório.');
    setSaving(true); setFormError(null);
    const { error } = await supabase.from('apps').insert({
      id: form.id, name: form.name, description: form.description,
      icon: form.icon, color: form.color, display_order: form.display_order,
    });
    setSaving(false);
    if (error) return setFormError(error.message);
    setShowForm(false);
    reload();
  };

  const handleEdit = async (form: FormState) => {
    if (!form.name) return setFormError('O nome é obrigatório.');
    setSaving(true); setFormError(null);
    const { error } = await supabase.from('apps').update({
      name: form.name, description: form.description,
      icon: form.icon, color: form.color, display_order: form.display_order,
    }).eq('id', form.id);
    setSaving(false);
    if (error) return setFormError(error.message);
    setEditApp(null);
    reload();
  };

  const handleDelete = async (app: AppRow) => {
    if (!confirm(`Tens a certeza que queres apagar "${app.name}"?\nTodos os ficheiros associados ficarão sem app.`)) return;
    setDeleting(app.id);
    await supabase.from('apps').delete().eq('id', app.id);
    setDeleting(null);
    reload();
  };

  type FormState = typeof EMPTY_FORM;

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-400/10 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Apps VPN</h1>
            <p className="text-xs text-gray-500">Gerir as aplicacoes disponiveis no site</p>
          </div>
        </div>
        {!showForm && !editApp && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-cyan-400 text-black px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-white transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova App
          </button>
        )}
      </header>

      <div className="space-y-4">
        {/* Create form */}
        {showForm && (
          <AppForm
            initial={EMPTY_FORM}
            isEdit={false}
            onSave={handleCreate}
            onCancel={() => { setShowForm(false); setFormError(null); }}
            saving={saving}
            error={formError}
          />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        )}

        {/* Apps list */}
        {!loading && apps.map((app) => {
          const colors = getAppColorClasses(app.color);
          const isEditing = editApp?.id === app.id;

          if (isEditing) {
            return (
              <AppForm
                key={app.id}
                initial={{ id: app.id, name: app.name, description: app.description, icon: app.icon, color: app.color, display_order: app.display_order }}
                isEdit={true}
                onSave={handleEdit}
                onCancel={() => { setEditApp(null); setFormError(null); }}
                saving={saving}
                error={formError}
              />
            );
          }

          return (
            <div key={app.id} className="bg-[#111820] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0 ${colors.card}`}>
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{app.name}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>{app.color}</span>
                  <span className="text-[9px] text-gray-600 font-mono">#{app.id}</span>
                </div>
                <p className="text-gray-500 text-xs truncate">{app.description || '—'}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { setEditApp(app); setShowForm(false); setFormError(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-400/10 hover:text-cyan-400 text-gray-400 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(app)}
                  disabled={deleting === app.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-400/10 hover:text-red-400 text-gray-400 transition-colors disabled:opacity-50"
                >
                  {deleting === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}

        {!loading && apps.length === 0 && !showForm && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4 opacity-20">📱</div>
            <p className="text-sm">Nenhuma app criada ainda.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-cyan-400 text-sm hover:underline">
              Criar a primeira app
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
