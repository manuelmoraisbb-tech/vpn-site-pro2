/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ArrowLeft, MousePointerClick, X } from 'lucide-react';

const STORAGE_KEY = 'vpn_ad_warning_accepted';

export default function AdWarningModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mostra apenas uma vez por sessão
    const accepted = sessionStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-[#0a0f1a] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">

              {/* Glow top */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-32 bg-cyan-400/10 blur-3xl rounded-full pointer-events-none" />

              {/* Header */}
              <div className="px-6 pt-7 pb-5 flex items-start gap-4 border-b border-white/5">
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-white">
                    Aviso sobre Anúncios
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                    Leia antes de continuar
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">

                {/* Item 1 */}
                <div className="flex gap-3 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-cyan-400/8 border border-cyan-400/15 flex items-center justify-center mt-0.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Este site contém <span className="text-white font-bold">anúncios</span>.
                    Ao clicar em qualquer área da página, poderá ser{' '}
                    <span className="text-amber-400 font-bold">redirecionado</span> para
                    um site externo de anúncios.
                  </p>
                </div>

                {/* Item 2 */}
                <div className="flex gap-3 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-cyan-400/8 border border-cyan-400/15 flex items-center justify-center mt-0.5">
                    <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Se isso acontecer,{' '}
                    <span className="text-white font-bold">clique em Voltar</span> no
                    seu navegador (ou pressione{' '}
                    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/8 border border-white/10 text-[10px] font-mono text-gray-300">
                      Alt + ←
                    </kbd>
                    ) para regressar ao site e continuar a baixar as configurações.
                  </p>
                </div>

                {/* Tip box */}
                <div className="bg-cyan-400/5 border border-cyan-400/15 rounded-2xl px-4 py-3">
                  <p className="text-[11px] text-cyan-300/80 leading-relaxed font-medium">
                    💡 <span className="text-cyan-300">Dica:</span> Os anúncios ajudam
                    a manter este serviço gratuito. Obrigado pela compreensão!
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={handleAccept}
                  className="w-full bg-cyan-400 hover:bg-white text-black font-black text-sm py-3.5 rounded-2xl transition-all duration-200 tracking-wide flex items-center justify-center gap-2 group"
                >
                  <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
                  Entendi, continuar para o site
                </button>
              </div>

              {/* Bottom glow */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
