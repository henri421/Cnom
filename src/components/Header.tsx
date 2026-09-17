import React, { useState, useEffect } from 'react';
import { Download, FileText, BookOpen, RotateCcw, Smartphone, Check, HardDrive } from 'lucide-react';

interface Props {
  onOpenDnaModal: () => void;
  onTogglePrintView: () => void;
  isPrintView: boolean;
  onResetProject: () => void;
  elementsCount: number;
}

export const Header: React.FC<Props> = ({
  onOpenDnaModal,
  onTogglePrintView,
  isPrintView,
  onResetProject,
  elementsCount,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Normative tags */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-300 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                C<sub className="text-[9px] -mb-0.5">nom</sub>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-zinc-900 tracking-tight">
                    Calcul d'Enrobage
                  </h1>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded border border-zinc-200 font-semibold">
                    v1.0 ILNAS
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-normal">
                  Eurocode 2 (EN 1992-1-1) &amp; EN 206 (DNA W.1 Luxembourg)
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 pl-4 border-l border-zinc-200 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200 font-mono text-[11px]">
                <HardDrive className="w-3 h-3 text-emerald-600" />
                Local &amp; Hors-ligne
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Install PWA Button if available */}
            {deferredPrompt && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md border border-zinc-300 transition-colors"
                title="Installer l'application sur l'appareil pour un usage autonome"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-700" />
                Installer PWA
              </button>
            )}

            {/* Reference Table DNA W.1 */}
            <button
              onClick={onOpenDnaModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 transition-colors shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Tableau</span> DNA W.1
            </button>

            {/* Print Note de Calcul */}
            <button
              onClick={onTogglePrintView}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shadow-2xs ${
                isPrintView
                  ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
                  : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isPrintView ? 'Retour saisie' : 'Note de calcul'}</span>
            </button>

            {/* Reset / Clean */}
            <button
              onClick={() => {
                if (window.confirm('Réinitialiser tous les éléments aux valeurs d’exemple par défaut ?')) {
                  onResetProject();
                }
              }}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
              title="Réinitialiser le projet"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
