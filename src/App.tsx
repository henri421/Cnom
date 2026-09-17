import React, { useState, useEffect, useMemo } from 'react';
import { ElementBeton, ResultatCalculElement } from './types';
import {
  calculerElementComplet,
  creerElementParDefaut,
} from './engine';
import { Header } from './components/Header';
import { ElementList } from './components/ElementList';
import { ElementForm } from './components/ElementForm';
import { ResultPanel } from './components/ResultPanel';
import { PrintReport } from './components/PrintReport';
import { DnaW1Modal } from './components/DnaW1Modal';

const STORAGE_KEY = 'enrobage_ec2_project_v1';

// Initial realistic engineering dataset
const ELEMENTS_INITIAUX: ElementBeton[] = [
  {
    id: 'elem-1',
    nom: 'Voile façade - Face extérieure',
    typeElement: 'voile',
    dureeUtilisationProjet: 50,
    diametreBarreMm: 12,
    classeResistancePrevue: 'C30/37',
    qualiteControleSpeciale: false,
    deltaCDevMm: 10,
    reponses: {
      ambianceXC: 'exterieur_non_abrite', // XC4
      concerneParChlorures: false,
      distanceChausseeSaleeM: null,
      salageRoute: null,
      applicationDirecteSelSurFace: false,
      exposeAuGel: true,
      zoneGel: 'faible_modere',
      presenceAgentDeverglacage: false,
      saturationForteEau: false, // XF1
      concerneParAgressiviteChimique: false,
      so4EauMgL: null,
      so4SolMgKg: null,
      autreAgressiviteChimiqueForte: false,
    },
  },
  {
    id: 'elem-2',
    nom: 'Voile façade - Face intérieure',
    typeElement: 'voile',
    dureeUtilisationProjet: 50,
    diametreBarreMm: 12,
    classeResistancePrevue: 'C25/30',
    qualiteControleSpeciale: false,
    deltaCDevMm: 10,
    reponses: {
      ambianceXC: 'interieur_sec', // XC1
      concerneParChlorures: false,
      distanceChausseeSaleeM: null,
      salageRoute: null,
      applicationDirecteSelSurFace: false,
      exposeAuGel: false,
      zoneGel: null,
      presenceAgentDeverglacage: false,
      saturationForteEau: false,
      concerneParAgressiviteChimique: false,
      so4EauMgL: null,
      so4SolMgKg: null,
      autreAgressiviteChimiqueForte: false,
    },
  },
  {
    id: 'elem-3',
    nom: 'Dalle de rampe parking - Face circulée',
    typeElement: 'dalle',
    dureeUtilisationProjet: 50,
    diametreBarreMm: 14,
    classeResistancePrevue: 'C30/37',
    qualiteControleSpeciale: false,
    deltaCDevMm: 10,
    reponses: {
      ambianceXC: 'exterieur_non_abrite', // XC4
      concerneParChlorures: true,
      distanceChausseeSaleeM: 1,
      salageRoute: 'frequent',
      applicationDirecteSelSurFace: true, // XD3
      exposeAuGel: true,
      zoneGel: 'faible_modere',
      presenceAgentDeverglacage: true,
      saturationForteEau: true, // XF4
      concerneParAgressiviteChimique: false,
      so4EauMgL: null,
      so4SolMgKg: null,
      autreAgressiviteChimiqueForte: false,
    },
  },
];

export default function App() {
  const [elements, setElements] = useState<ElementBeton[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return ELEMENTS_INITIAUX;
  });

  const [activeElementId, setActiveElementId] = useState<string>(() => {
    return elements[0]?.id || 'elem-1';
  });

  const [isDnaModalOpen, setIsDnaModalOpen] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
    } catch {
      // ignore
    }
  }, [elements]);

  // Compute results for all elements
  const calculsMap = useMemo(() => {
    const map: Record<string, ResultatCalculElement> = {};
    for (const el of elements) {
      map[el.id] = calculerElementComplet(el);
    }
    return map;
  }, [elements]);

  // Active element & calculation
  const activeElement = useMemo(() => {
    return elements.find((e) => e.id === activeElementId) || elements[0] || ELEMENTS_INITIAUX[0];
  }, [elements, activeElementId]);

  const activeResultat = useMemo(() => {
    return calculsMap[activeElement.id] || calculerElementComplet(activeElement);
  }, [calculsMap, activeElement]);

  // Handlers
  const handleUpdateActiveElement = (updated: ElementBeton) => {
    setElements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleAddElement = () => {
    const nouveau = creerElementParDefaut(`Face #${elements.length + 1}`, 'voile');
    setElements((prev) => [...prev, nouveau]);
    setActiveElementId(nouveau.id);
  };

  const handleDuplicateElement = (idToDup: string) => {
    const source = elements.find((e) => e.id === idToDup);
    if (!source) return;

    const copie: ElementBeton = {
      ...JSON.parse(JSON.stringify(source)),
      id: 'elem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nom: `${source.nom} (autre face)`,
    };
    setElements((prev) => [...prev, copie]);
    setActiveElementId(copie.id);
  };

  const handleDeleteElement = (idToDelete: string) => {
    if (elements.length <= 1) return;
    const filtered = elements.filter((e) => e.id !== idToDelete);
    setElements(filtered);
    if (activeElementId === idToDelete) {
      setActiveElementId(filtered[0].id);
    }
  };

  const handleResetProject = () => {
    setElements(ELEMENTS_INITIAUX);
    setActiveElementId(ELEMENTS_INITIAUX[0].id);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (isPrintView) {
    return (
      <PrintReport
        elements={elements}
        calculsMap={calculsMap}
        onClose={() => setIsPrintView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans flex flex-col antialiased">
      {/* Top Navbar */}
      <Header
        onOpenDnaModal={() => setIsDnaModalOpen(true)}
        onTogglePrintView={() => setIsPrintView(!isPrintView)}
        isPrintView={isPrintView}
        onResetProject={handleResetProject}
        elementsCount={elements.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Element Selector Bar */}
        <ElementList
          elements={elements}
          activeElementId={activeElement.id}
          onSelectElement={setActiveElementId}
          onAddElement={handleAddElement}
          onDuplicateElement={handleDuplicateElement}
          onDeleteElement={handleDeleteElement}
          calculsMap={calculsMap}
        />

        {/* Work Area: 2-column layout (Form Left, Live Results Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Technical Input Form */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6">
            <ElementForm
              element={activeElement}
              onChange={handleUpdateActiveElement}
            />
          </div>

          {/* Right Column: Live Technical Results & Schemas */}
          <div className="lg:col-span-6 xl:col-span-6 sticky top-20 space-y-6">
            <ResultPanel
              element={activeElement}
              resultat={activeResultat}
              onOpenDnaModal={() => setIsDnaModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Reference Table DNA W.1 Modal */}
      <DnaW1Modal
        isOpen={isDnaModalOpen}
        onClose={() => setIsDnaModalOpen(false)}
        activeClasses={activeResultat.toutesClassesRequises}
        selectedCategoryCode={activeResultat.categorieOptimale?.code}
      />

      {/* Simple Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-12 py-4 text-center text-xs text-zinc-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Calcul d'Enrobage • Conforme EN 1992-1-1:2004 (clause 4.4.1) &amp; EN 206 (Annexe Nationale ILNAS)
          </span>
          <span className="font-mono text-[11px] text-zinc-400">
            PWA locale • Sans transmission de données • 100% Hors-ligne
          </span>
        </div>
      </footer>
    </div>
  );
}
