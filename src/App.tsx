/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield,
  Wrench,
  Globe,
  Zap,
  Target,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react';
import { apps } from './constants';
import { useVpnFiles } from './hooks/useVpnFiles';
import { useShortener } from './hooks/useShortener';
import { supabase } from './lib/supabase';

const iconMap: Record<string, React.ReactNode> = {
  http_injector: <Wrench className="w-5 h-5" />,
  bd_net: <Globe className="w-5 h-5" />,
  apna_tunnel: <Zap className="w-5 h-5" />,
  maya_tun: <Target className="w-5 h-5" />,
};

const colorMap: Record<string, string> = {
  http_injector: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  bd_net: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  apna_tunnel: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  maya_tun: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const badgeColorMap: Record<string, string> = {
  http_injector: 'bg-purple-500/20 text-purple-400',
  bd_net: 'bg-emerald-500/20 text-emerald-400',
  apna_tunnel: 'bg-yellow-500/20 text-yellow-400',
  maya_tun: 'bg-cyan-500/20 text-cyan-400',
};

type Comment = {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
};

export default function App() {
  const { rows } = useVpnFiles();
  const navigate = useNavigate();
  const { shorten, hasToken } = useShortener();
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch approved comments
  useEffect(() => {
    supabase
      .from('comments')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setComments(data);
      });
  }, []);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of apps) m[a.id] = 0;
    for (const r of rows) m[r.app_id] = (m[r.app_id] || 0) + 1;
    return m;
  }, [rows]);

  const handleViewFiles = async (appId: string) => {
    if (!hasToken) {
      navigate(`/files/${appId}`);
      return;
    }
    const targetUrl = `${window.location.origin}/files/${appId}`;
    setRedirecting(appId);
    const shortened = await shorten(targetUrl);
    if (shortened && shortened !== targetUrl) {
      window.location.href = shortened;
    } else {
      // API failed - go directly so the user is never blocked.
      navigate(`/files/${appId}`);
    }
    setRedirecting(null);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentContent.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      author_name: commentName.trim(),
      content: commentContent.trim(),
    });

    setSubmitting(false);
    if (!error) {
      setCommentName('');
      setCommentContent('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  const howToSteps = [
    {
      num: '01',
      title: 'Escolhe a app',
      desc: 'Seleciona a aplicacao VPN que tens instalada no teu telemovel.',
    },
    {
      num: '02',
      title: 'Escolhe o ficheiro',
      desc: 'Ves ate 5 ficheiros. Escolhe e carrega em Download.',
    },
    {
      num: '03',
      title: 'Importa na app',
      desc: 'Abre a tua app VPN, vai a Importar e seleciona o ficheiro.',
    },
    {
      num: '04',
      title: 'Usa a password',
      desc: 'Se tiver password, carrega no botao PASS para ver e copiar.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0e14]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-black text-lg tracking-wider">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>
              VPN <span className="text-emerald-400">FREE</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 font-semibold">
            <Sparkles className="w-3 h-3" /> 100% Gratuito
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20 font-bold mb-6">
            <span>🇦🇴</span> ANGOLA - SEMPRE ACTUALIZADO
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            CONFIGURACOES
            <br />
            <span className="text-emerald-400">VPN GRATIS</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
            Ficheiros prontos para importar nas tuas apps VPN favoritas.
            <br />
            Sem registo, sem pagamento, sempre gratuito.
          </p>

          {/* Stats */}
          <div className="inline-flex items-center gap-6 bg-[#111820] rounded-2xl border border-white/5 px-8 py-4">
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">{apps.length}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                Apps VPN
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">{rows.length}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                Ficheiros
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">0 KZ</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                Custo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apps Grid Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-6">
          ESCOLHE A TUA APLICACAO
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {apps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111820] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colorMap[app.id]}`}
              >
                {iconMap[app.id]}
              </div>
              <h3 className="font-bold text-lg mb-2">{app.name}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">{app.desc}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeColorMap[app.id]}`}
                >
                  {counts[app.id]} ficheiros disponiveis
                </span>
                <button
                  onClick={() => handleViewFiles(app.id)}
                  disabled={redirecting === app.id}
                  className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-lg border border-cyan-400/20 hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  {redirecting === app.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> A redirecionar...
                    </>
                  ) : (
                    <>
                      Ver ficheiros <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How To Use Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-6">
          COMO USAR
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {howToSteps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111820] border border-white/5 rounded-2xl p-5"
            >
              <div className="text-3xl font-black text-cyan-400 mb-3">{step.num}</div>
              <h3 className="font-bold text-sm mb-2">{step.title}</h3>
              <p className="text-gray-500 text-[11px] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comments Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> COMENTARIOS
        </h2>

        {/* Comment Form */}
        <div className="bg-[#111820] border border-white/5 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-sm mb-4">Deixa o teu comentario</h3>
          {submitted ? (
            <div className="text-emerald-400 text-sm py-4 text-center">
              Obrigado! O teu comentario foi enviado e aguarda aprovacao.
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <input
                type="text"
                placeholder="O teu nome"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50"
                required
              />
              <textarea
                placeholder="Escreve o teu comentario..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50 resize-none"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 text-[11px] font-bold text-black bg-cyan-400 px-5 py-2.5 rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar Comentario
              </button>
            </form>
          )}
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              Ainda nao ha comentarios aprovados. Se o primeiro!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[#111820] border border-white/5 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm">{comment.author_name}</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-black text-sm tracking-wider">
            <span>
              VPN<span className="text-emerald-400">FREE</span>
            </span>
          </Link>
          <div className="text-[10px] text-gray-500">
            © 2026 VPN Free AO - Sempre gratuito
          </div>
        </div>
      </footer>
    </div>
  );
}
