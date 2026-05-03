/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Download,
  Key,
  Activity,
  Lock,
  Loader2,
} from 'lucide-react';
import { apps } from './constants';
import { useVpnFiles } from './hooks/useVpnFiles';
import { supabase } from './lib/supabase';
import { formatBytes } from './lib/types';

export default function App() {
  const [currentAppId, setCurrentAppId] = useState<string>(apps[0].id);
  const { rows, loading } = useVpnFiles();

  const selectedApp = apps.find((a) => a.id === currentAppId) || apps[0];
  const files = useMemo(
    () => rows.filter((r) => r.app_id === currentAppId),
    [rows, currentAppId]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of apps) m[a.id] = 0;
    for (const r of rows) m[r.app_id] = (m[r.app_id] || 0) + 1;
    return m;
  }, [rows]);

  // --- INTEGRAÇÃO DE ANÚNCIOS ---
  useEffect(() => {
    const initAds = () => {
      // @ts-ignore - aclib é injetado via index.html
      if (window.aclib) {
        try {
          // @ts-ignore
          window.aclib.runAutoTag({
            zoneId: 'vy2ho0939z',
          });
        } catch (e) {
          console.error('Erro ao processar AutoTag:', e);
        }
      } else {
        // Se o script ainda não carregou, tenta novamente em 1 segundo
        setTimeout(initAds, 1000);
      }
    };

    initAds();
  }, [currentAppId]); // Roda ao abrir o site e sempre que trocar de App para maximizar impressões
  // ------------------------------

  const handleCopyPass = (pass: string) => {
    navigator.clipboard.writeText(pass);
    alert('Password copiada: ' + pass);
  };

  const handleDownload = async (id: string) => {
    supabase.rpc('increment_download', { file_id: id }).then(({ error }) => {
      if (error) console.error('[v0] increment_download error:', error.message);
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentAppId]);

  return (
    <div className="min-h-screen bg-[#030509] text-white font-sans selection:bg-cyan-500/30 flex flex-col md:flex-row overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <aside className="relative z-20 w-full md:w-[320px] bg-[#030509] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-8 pb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 font-black text-xl tracking-wider">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span>
                VPN <span className="text-cyan-400">FREE</span>
              </span>
            </div>
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-full border border-cyan-400/20 font-semibold hover:bg-cyan-400 hover:text-black transition-colors"
            >
              <Lock className="w-3 h-3" /> Admin
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-extrabold leading-[0.9] tracking-tighter uppercase mb-3">
              ARQUIVOS <br />
              <span className="text-cyan-400">VPN GRÁTIS</span>
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[240px]">
              Selecione uma aplicação para listar os ficheiros de configuração
              disponíveis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-[#0d121b] p-4 rounded-xl border border-white/5 text-center">
              <strong className="block text-xl font-bold text-cyan-400">
                {apps.length}
              </strong>
              <small className="text-[9px] text-gray-500 tracking-widest block uppercase">
                Apps
              </small>
            </div>
            <div className="bg-[#0d121b] p-4 rounded-xl border border-white/5 text-center">
              <strong className="block text-xl font-bold text-cyan-400">
                {rows.length}
              </strong>
              <small className="text-[9px] text-gray-500 tracking-widest block uppercase">
                Ficheiros
              </small>
            </div>
          </div>

          <nav className="space-y-2">
            <p className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-4 ml-1">
              Navegação
            </p>
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => setCurrentAppId(app.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left relative group ${
                  currentAppId === app.id
                    ? 'bg-[#111721] border-cyan-400/30 text-white'
                    : 'bg-[#0d121b] border-white/5 text-gray-400 hover:border-white/10 hover:bg-[#0e141d]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-colors ${
                    currentAppId === app.id
                      ? 'bg-cyan-400/10 text-cyan-400'
                      : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
                  }`}
                >
                  {app.icon}
                </div>
                <h3 className="text-sm font-bold flex-1">{app.name}</h3>
                <div
                  className={`text-[10px] px-2 py-1 rounded font-bold ${
                    currentAppId === app.id
                      ? 'bg-cyan-400/10 text-cyan-400'
                      : 'bg-white/5 text-gray-600'
                  }`}
                >
                  {counts[app.id] ?? 0}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 hidden md:block space-y-3">
          <div className="bg-[#0d121b] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00ff88]/5 rounded-full flex items-center justify-center text-[#00ff88]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500">
                Status do Servidor
              </p>
              <p className="text-[11px] font-bold text-[#00ff88]">
                Serviço Operacional
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 flex flex-col min-w-0 bg-[#030509]">
        <div className="flex-1 p-4 sm:p-8 flex flex-col">
          <div className="bg-[#0d121b] border border-white/5 rounded-[24px] flex-1 flex flex-col min-h-0 overflow-hidden shadow-2xl">
            <header className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-br from-white/[0.02] to-transparent">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-400/5 rounded-2xl border border-cyan-400/10 flex items-center justify-center text-3xl md:text-4xl shadow-lg shadow-cyan-400/5 shrink-0">
                {selectedApp.icon}
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                    {selectedApp.name}
                  </h2>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-cyan-400/10 text-cyan-400 px-2 py-1 rounded border border-cyan-400/10">
                      {counts[selectedApp.id] ?? 0} ficheiros
                    </span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-xl truncate sm:whitespace-normal">
                  {selectedApp.desc}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-gray-500 py-20"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-3" />
                    <p className="text-xs">A carregar configurações...</p>
                  </motion.div>
                ) : files.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-12"
                  >
                    <div className="text-[80px] mb-6 opacity-10">📬</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Sem ficheiros de momento
                    </h3>
                    <p className="text-xs max-w-xs mx-auto leading-relaxed">
                      O administrador ainda não carregou ficheiros para esta
                      aplicação. Por favor, aguarde a próxima actualização.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentAppId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {files.map((file, i) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-cyan-400/20 transition-all hover:bg-white/[0.04]"
                      >
                        <div className="text-4xl font-black text-white/[0.03] group-hover:text-cyan-400/10 transition-colors shrink-0 font-mono w-12 text-center">
                          {(i + 1).toString().padStart(2, '0')}
                        </div>

                        <div className="flex-1 w-full text-center sm:text-left min-w-0">
                          <h4 className="font-bold text-base md:text-lg mb-1.5 truncate">
                            {file.name}
                          </h4>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            {file.region && (
                              <span className="flex items-center gap-1.5">
                                🌍 Região:{' '}
                                <span className="text-gray-300">{file.region}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              📦{' '}
                              <span className="text-gray-300">
                                {formatBytes(file.size_bytes)}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              ⬇️{' '}
                              <span className="text-gray-300">
                                {file.downloads} dls
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-center">
                          {file.pass && (
                            <button
                              onClick={() => handleCopyPass(file.pass!)}
                              className="bg-[#161c26] text-cyan-400 border border-cyan-400/20 py-2.5 px-4 rounded-lg font-bold text-[11px] hover:bg-cyan-400 hover:text-black transition-all flex items-center gap-2"
                            >
                              <Key className="w-3.5 h-3.5" /> PASS
                            </button>
                          )}
                          <a
                            href={file.link}
                            download={file.name}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => handleDownload(file.id)}
                            className="bg-cyan-400 text-black py-2.5 px-5 rounded-lg font-black text-[11px] hover:bg-white transition-colors flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5" /> DOWNLOAD
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <footer className="mt-6 flex flex-col sm:flex-row justify-between items-center px-4 py-2 gap-4">
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 tracking-widest uppercase">
              <span>© 2026 VPN FREE</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <span className="text-cyan-400/50">PROFESSIONAL DASHBOARD</span>
            </div>
            <div className="text-[10px] text-gray-700 font-medium">
              Sempre gratuito • Sem registo • Alta velocidade
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}