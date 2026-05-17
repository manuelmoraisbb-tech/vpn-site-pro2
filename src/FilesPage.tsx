/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield, ArrowLeft, Download, Key, Clock, FileText,
  Calendar, Loader2, Sparkles, ExternalLink, X,
} from 'lucide-react';
import { useVpnFiles } from './hooks/useVpnFiles';
import { useApps } from './hooks/useApps';
import { useSiteSettings } from './hooks/useSiteSettings';
import { supabase } from './lib/supabase';
import { formatBytes, formatDateTime, getFileStatus, getAppColorClasses } from './lib/types';

const PENDING_KEY = 'vpn_pending_download';

// Modal "Segue no Facebook"
function FacebookModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111820] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-black mb-2">Download iniciado!</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Segue a nossa pagina no Facebook para ficares sempre a par das ultimas
          configuracoes VPN gratuitas para Angola.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1565D8] transition-colors mb-3"
        >
          <ExternalLink className="w-4 h-4" />
          Seguir no Facebook
        </a>
        <button
          onClick={onClose}
          className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
        >
          Talvez mais tarde
        </button>
      </motion.div>
    </div>
  );
}

export default function FilesPage() {
  const { appId } = useParams<{ appId: string }>();
  const { rows, loading } = useVpnFiles();
  const { apps } = useApps();
  const { settings } = useSiteSettings(['aliexpress_affiliate_url', 'facebook_page_url']);

  const [waitingReturn, setWaitingReturn] = useState<string | null>(null);
  const [showFbModal, setShowFbModal] = useState(false);
  const affiliateUrl = settings['aliexpress_affiliate_url'] || '';
  const facebookUrl = settings['facebook_page_url'] || '';

  const selectedApp = apps.find((a) => a.id === appId) ?? apps[0];
  const files = useMemo(() => rows.filter((r) => r.app_id === appId), [rows, appId]);

  // ─── Affiliate / pending download logic ─────────────────────────────────────
  const triggerDownload = (link: string, id: string) => {
    supabase.rpc('increment_download', { file_id: id }).catch(() => {});
    window.open(link, '_blank', 'noopener,noreferrer');
    if (facebookUrl) setShowFbModal(true);
  };

  // On mount: check if user is returning from affiliate (sessionStorage pending)
  useEffect(() => {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (raw) {
      try {
        const { id, link } = JSON.parse(raw) as { id: string; link: string };
        sessionStorage.removeItem(PENDING_KEY);
        setWaitingReturn(null);
        triggerDownload(link, id);
      } catch {
        sessionStorage.removeItem(PENDING_KEY);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facebookUrl]);

  // visibilitychange: detect when user switches back to this tab
  const waitingRef = useRef(waitingReturn);
  useEffect(() => { waitingRef.current = waitingReturn; }, [waitingReturn]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return;
      try {
        const { id, link } = JSON.parse(raw) as { id: string; link: string };
        sessionStorage.removeItem(PENDING_KEY);
        setWaitingReturn(null);
        triggerDownload(link, id);
      } catch {
        sessionStorage.removeItem(PENDING_KEY);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facebookUrl]);

  const handleDownloadClick = (fileId: string, fileLink: string) => {
    if (!affiliateUrl) {
      // Sem link de afiliado: download direto
      triggerDownload(fileLink, fileId);
      return;
    }
    // Guardar download pendente e abrir afiliado
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ id: fileId, link: fileLink }));
    setWaitingReturn(fileId);
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPass = (pass: string) => {
    navigator.clipboard.writeText(pass);
    alert('Password copiada: ' + pass);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-2 py-1 rounded-full">Expirado</span>;
      case 'scheduled':
        return <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">Agendado</span>;
      default:
        return <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Activo</span>;
    }
  };

  const appColors = selectedApp ? getAppColorClasses(selectedApp.color) : getAppColorClasses('cyan');

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white font-sans">
      {/* Facebook Modal */}
      {showFbModal && facebookUrl && (
        <FacebookModal url={facebookUrl} onClose={() => setShowFbModal(false)} />
      )}

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0e14]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-black text-lg tracking-wider">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>VPN <span className="text-emerald-400">FREE</span></span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 font-semibold">
            <Sparkles className="w-3 h-3" /> 100% Gratuito
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar as aplicacoes
        </Link>

        {/* App Header */}
        {selectedApp && (
          <div className="bg-[#111820] border border-white/5 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${appColors.card}`}>
                {selectedApp.icon}
              </div>
              <h1 className="text-2xl font-black">{selectedApp.name}</h1>
            </div>
            <p className="text-gray-500 text-sm">{selectedApp.description}</p>
            <div className="mt-4 text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-full inline-block">
              {files.length} ficheiros disponiveis
            </div>
          </div>
        )}

        {/* Waiting banner */}
        {waitingReturn && affiliateUrl && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <p className="text-sm text-amber-300 font-medium">
                A aguardar o teu regresso... Quando voltares, o download inicia automaticamente.
              </p>
            </div>
            <button
              onClick={() => {
                const raw = sessionStorage.getItem(PENDING_KEY);
                if (raw) {
                  try {
                    const { id, link } = JSON.parse(raw);
                    sessionStorage.removeItem(PENDING_KEY);
                    setWaitingReturn(null);
                    triggerDownload(link, id);
                  } catch { sessionStorage.removeItem(PENDING_KEY); }
                }
                setWaitingReturn(null);
              }}
              className="shrink-0 text-[11px] font-bold text-black bg-amber-400 px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors"
            >
              Continuar Download
            </button>
          </motion.div>
        )}

        {/* Files List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-3" />
            <p className="text-xs">A carregar ficheiros...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-6 opacity-20">📭</div>
            <h3 className="text-xl font-bold text-white mb-2">Sem ficheiros de momento</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              O administrador ainda nao carregou ficheiros para esta aplicacao.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file, i) => {
              const status = getFileStatus(file);
              const isExpired = status === 'expired';
              const isWaiting = waitingReturn === file.id;

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-[#111820] border rounded-2xl p-6 ${
                    isExpired ? 'border-red-500/20 opacity-60' : 'border-white/5 hover:border-white/10'
                  } transition-all`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="font-bold text-lg">{file.name}</h3>
                        {getStatusBadge(status)}
                      </div>
                      {file.description && (
                        <div className="flex items-start gap-2 mb-3 text-gray-400 text-sm">
                          <FileText className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                          <p>{file.description}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        {file.region && (
                          <span className="flex items-center gap-1.5">
                            🌍 Regiao: <span className="text-gray-300">{file.region}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          📦 <span className="text-gray-300">{formatBytes(file.size_bytes)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          ⬇️ <span className="text-gray-300">{file.downloads} downloads</span>
                        </span>
                      </div>
                      {(file.valid_from || file.valid_until) && (
                        <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-gray-500">
                          {file.valid_from && (
                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Valido desde:</span>
                              <span className="text-gray-300">{formatDateTime(file.valid_from)}</span>
                            </div>
                          )}
                          {file.valid_until && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isExpired ? 'bg-red-500/10' : 'bg-white/5'}`}>
                              <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-red-400' : 'text-amber-400'}`} />
                              <span>Expira em:</span>
                              <span className={isExpired ? 'text-red-400' : 'text-gray-300'}>
                                {formatDateTime(file.valid_until)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {file.pass && (
                        <button
                          onClick={() => handleCopyPass(file.pass!)}
                          className="bg-[#161c26] text-cyan-400 border border-cyan-400/20 py-2.5 px-4 rounded-lg font-bold text-[11px] hover:bg-cyan-400 hover:text-black transition-all flex items-center gap-2"
                        >
                          <Key className="w-3.5 h-3.5" /> PASS
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isExpired || isWaiting}
                        onClick={() => handleDownloadClick(file.id, file.link)}
                        className={`py-2.5 px-5 rounded-lg font-black text-[11px] flex items-center gap-2 transition-colors ${
                          isExpired
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : isWaiting
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30 cursor-wait'
                            : 'bg-cyan-400 text-black hover:bg-white'
                        }`}
                      >
                        {isWaiting ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> A AGUARDAR...</>
                        ) : isExpired ? (
                          <><Download className="w-3.5 h-3.5" /> EXPIRADO</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" /> DOWNLOAD</>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-black text-sm tracking-wider">
            VPN<span className="text-emerald-400">FREE</span>
          </Link>
          <div className="text-[10px] text-gray-500">© 2026 VPN Free AO - Sempre gratuito</div>
        </div>
      </footer>
    </div>
  );
}
