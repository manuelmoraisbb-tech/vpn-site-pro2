/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield, ArrowLeft, Download, Key, Clock, FileText,
  Calendar, Loader2, Sparkles, ExternalLink, Facebook,
} from 'lucide-react';
import { useVpnFiles } from './hooks/useVpnFiles';
import { useApps } from './hooks/useApps';
import { useSiteSettings } from './hooks/useSiteSettings';
import { supabase } from './lib/supabase';
import { formatBytes, formatDateTime, getFileStatus, getAppColorClasses } from './lib/types';

const PASS_KEY = 'vpn_pending_pass';

export default function FilesPage() {
  const { appId } = useParams<{ appId: string }>();
  const { rows, loading } = useVpnFiles();
  const { apps } = useApps();
  const { settings } = useSiteSettings(['aliexpress_affiliate_url', 'facebook_page_url']);

  const affiliateUrl = settings['aliexpress_affiliate_url'] || '';
  const facebookUrl  = settings['facebook_page_url'] || '';

  const selectedApp = apps.find((a) => a.id === appId) ?? apps[0];
  const files = useMemo(() => rows.filter((r) => r.app_id === appId), [rows, appId]);

  // ─── Quando o utilizador volta depois de ver o afiliado, mostra a password ───
  useEffect(() => {
    const raw = sessionStorage.getItem(PASS_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PASS_KEY);
    const { pass } = JSON.parse(raw) as { pass: string };
    if (pass) alert('🔑 Password: ' + pass);
  }, []);

  // ─── PASS: abre afiliado → quando volta mostra a password ────────────────────
  const handlePassClick = (pass: string) => {
    if (affiliateUrl) {
      sessionStorage.setItem(PASS_KEY, JSON.stringify({ pass }));
      window.location.href = affiliateUrl;
    } else {
      alert('🔑 Password: ' + pass);
    }
  };

  // ─── DOWNLOAD: abre o link directamente ──────────────────────────────────────
  const handleDownloadClick = (fileId: string, fileLink: string) => {
    if (!fileLink) return;
    supabase.rpc('increment_download', { file_id: fileId }).catch(() => {});
    window.open(fileLink, '_blank', 'noopener,noreferrer');
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
                          onClick={() => handlePassClick(file.pass!)}
                          className="bg-[#161c26] text-cyan-400 border border-cyan-400/20 py-2.5 px-4 rounded-lg font-bold text-[11px] hover:bg-cyan-400 hover:text-black transition-all flex items-center gap-2"
                        >
                          <Key className="w-3.5 h-3.5" /> PASS
                        </button>
                      )}
                      <a
                        href={isExpired ? undefined : file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => !isExpired && supabase.rpc('increment_download', { file_id: file.id }).catch(() => {})}
                        className={`py-2.5 px-5 rounded-lg font-black text-[11px] flex items-center gap-2 transition-colors ${
                          isExpired
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed pointer-events-none'
                            : 'bg-cyan-400 text-black hover:bg-white'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        {isExpired ? 'EXPIRADO' : 'DOWNLOAD'}
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Facebook Banner */}
        {facebookUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-[#111820] border border-[#1877F2]/20 rounded-2xl p-5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#1877F2]/10 rounded-xl flex items-center justify-center shrink-0">
                <Facebook className="w-5 h-5 text-[#1877F2]" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Siga a nossa página no Facebook</p>
                <p className="text-xs text-gray-500 mt-0.5">Para mais actualizações de configurações VPN gratuitas 🇦🇴</p>
              </div>
            </div>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#1565D8] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Seguir
            </a>
          </motion.div>
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

