import React, { useState, useEffect, useRef } from 'react';
import { FileText, BookOpen, RotateCcw, Smartphone, HardDrive, FileSpreadsheet, FileDown, Save, FolderOpen } from 'lucide-react';
import { LigneTableau } from '../lignes';
import { ProjetCnom } from '../types';
import { nomFichier, telecharger } from '../export/commun';
import { genererCsv } from '../export/csv';
import { genererJson, lireJson } from '../export/json';

const boutonBarre =
  'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 shadow-2xs disabled:opacity-50';

interface Props {
  projet: ProjetCnom;
  lignes: LigneTableau[];
  onOpenDnaModal: () => void;
  onOpenPrintView: () => void;
  onChargerProjet: (p: ProjetCnom) => void;
  onResetProject: () => void;
}

export const Header: React.FC<Props> = ({
  projet,
  lignes,
  onOpenDnaModal,
  onOpenPrintView,
  onChargerProjet,
  onResetProject,
}) => {
  const [exportEnCours, setExportEnCours] = useState(false);
  const fichierRef = useRef<HTMLInputElement>(null);

  const exporterExcel = async () => {
    setExportEnCours(true);
    try {
      const { exporterExcel: exporter } = await import('../export/excel');
      await exporter(projet, lignes);
    } catch (e) {
      window.alert(`Export Excel impossible : ${(e as Error).message}`);
    } finally {
      setExportEnCours(false);
    }
  };

  const ouvrirFichier = async (fichier: File | undefined) => {
    if (!fichier) return;
    try {
      const nouveau = lireJson(await fichier.text());
      if (window.confirm(`Remplacer le projet courant par « ${nouveau.titre} » (${nouveau.elements.length} élément(s)) ?`)) {
        onChargerProjet(nouveau);
      }
    } catch (e) {
      window.alert((e as Error).message);
    }
  };

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
                    v2.0
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

            <button onClick={exporterExcel} disabled={exportEnCours} className={boutonBarre} title="Classeur .xlsx : synthèse, justification, paramètres nationaux">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              {exportEnCours ? 'Export…' : 'Exporter en Excel'}
            </button>
            <button
              onClick={() => telecharger(genererCsv(lignes), nomFichier(projet, 'csv'), 'text/csv;charset=utf-8')}
              className={boutonBarre}
              title="CSV point-virgule, UTF-8 avec BOM (Excel francophone)"
            >
              <FileDown className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={() => telecharger(genererJson(projet), nomFichier(projet, 'json'), 'application/json')}
              className={boutonBarre}
              title="Sauvegarder le projet dans un fichier JSON local"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Sauvegarder</span>
            </button>
            <button onClick={() => fichierRef.current?.click()} className={boutonBarre} title="Ouvrir un projet JSON (v1 ou v2)">
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Ouvrir</span>
            </button>
            <input
              ref={fichierRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                ouvrirFichier(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            {/* Print Note de Calcul */}
            <button
              onClick={onOpenPrintView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shadow-2xs bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rapport PDF</span>
            </button>

            {/* Reset / Clean */}
            <button
              onClick={() => {
                if (window.confirm('Remplacer le projet courant par le projet exemple ? Les données non sauvegardées en fichier seront perdues.')) {
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
