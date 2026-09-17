import React from 'react';
import { ElementBeton, ResultatCalculElement } from '../types';
import { TechnicalSvgDiagram } from './TechnicalSvgDiagram';
import { CheckCircle2, ChevronRight, BookOpen, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  element: ElementBeton;
  resultat: ResultatCalculElement;
  onOpenDnaModal: () => void;
}

export const ResultPanel: React.FC<Props> = ({ element, resultat, onOpenDnaModal }) => {
  const {
    enrobage,
    modificateurs,
    resultatXC,
    resultatXD,
    resultatXF,
    resultatXA,
    categorieOptimale,
    categoriesCompatibles,
    fckRecommandees,
  } = resultat;

  return (
    <div id="result-panel" className="space-y-6">
      {/* 1. PRIMARY RESULT HERO CARD */}
      <div className="bg-white rounded-lg p-6 border border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
              Enrobage nominal requis (EN 1992-1-1 §4.4.1)
            </span>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-950">
                {enrobage.cnom}
              </span>
              <span className="text-2xl font-mono text-zinc-400 font-medium">mm</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-mono font-medium">
                cnom
              </span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">Classe déterminante :</span>
              <span className="font-mono font-bold text-xs bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                {enrobage.classeDeterminante}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">Classe structurale :</span>
              <span className="font-mono font-bold text-xs bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                S{modificateurs.classeFinale}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 text-xs font-mono">
          <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200/80">
            <span className="text-zinc-500 text-[10px] block font-sans">cmin,b (∅ barre)</span>
            <span className="text-sm font-bold text-zinc-800">{enrobage.cminB} mm</span>
          </div>
          <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200/80">
            <span className="text-zinc-500 text-[10px] block font-sans">cmin,dur ({enrobage.classeDeterminante})</span>
            <span className="text-sm font-bold text-zinc-800">{enrobage.cminDur} mm</span>
          </div>
          <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200/80">
            <span className="text-zinc-500 text-[10px] block font-sans">cmin = max(b; dur)</span>
            <span className="text-sm font-bold text-zinc-900">{enrobage.cmin} mm</span>
          </div>
          <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200/80">
            <span className="text-zinc-500 text-[10px] block font-sans">Δc,dev (tolérance)</span>
            <span className="text-sm font-bold text-zinc-800">+{enrobage.deltaCDev} mm</span>
          </div>
        </div>
      </div>

      {/* 2. TECHNICAL CROSS-SECTION SVG DIAGRAM */}
      <TechnicalSvgDiagram element={element} resultat={resultat} />

      {/* 3. TABLEAU DNA W.1 - CATÉGORIE DE BÉTON PRESCRITE */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Prescription Béton (Annexe Nationale ILNAS)
            </span>
            <h4 className="text-sm font-bold text-zinc-900">
              Catégorie selon Tableau DNA W.1
            </h4>
          </div>
          <button
            onClick={onOpenDnaModal}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Voir tableau complet
          </button>
        </div>

        {categorieOptimale ? (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-300 px-2 py-0.5 rounded">
                      Catégorie {categorieOptimale.code}
                    </span>
                    <span className="text-xs font-semibold text-zinc-800">
                      Recommandée (optimale pour les classes requises)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 mt-2 leading-relaxed">
                    {categorieOptimale.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-200 flex flex-wrap items-center gap-3 text-xs">
                <span className="font-semibold text-zinc-800">
                  Classes de résistance fck admises :
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold">
                  {fckRecommandees.map((fck) => (
                    <span
                      key={fck}
                      className="px-2 py-0.5 bg-white text-zinc-800 border border-zinc-300 rounded text-xs"
                    >
                      {fck}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Other compatible categories */}
            {categoriesCompatibles.length > 1 && (
              <div className="text-xs text-zinc-600">
                <span className="font-semibold text-zinc-700">
                  Autres catégories également couvrantes :
                </span>{' '}
                {categoriesCompatibles
                  .filter((c) => c.code !== categorieOptimale.code)
                  .map((c) => `Cat. ${c.code}`)
                  .join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-zinc-50 border border-zinc-300 text-zinc-800 rounded-md text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-zinc-600" />
            <span>Aucune catégorie standard du tableau DNA W.1 ne couvre la combinaison de classes demandée. Une formulation spéciale de béton sur étude doit être prescrite.</span>
          </div>
        )}
      </div>

      {/* 4. JUSTIFICATION & TRAÇABILITÉ DES CLASSES D'EXPOSITION */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="mb-3 pb-3 border-b border-zinc-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Traçabilité Normative EN 206
          </span>
          <h4 className="text-sm font-bold text-zinc-900">
            Justification des classes retenues par famille
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-semibold">
                <th className="py-2 px-3 w-28">Famille</th>
                <th className="py-2 px-3 w-20 text-center">Classe</th>
                <th className="py-2 px-4">Justification technique &amp; référence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans">
              {/* XC */}
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-900">
                  Carbonatation (XC)
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="font-mono font-bold px-2 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                    {resultatXC.classe || 'X0'}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-zinc-700 leading-relaxed">
                  <div>{resultatXC.justification}</div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                    {resultatXC.normeRef}
                  </span>
                </td>
              </tr>

              {/* XD */}
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-900">
                  Chlorures voirie (XD)
                </td>
                <td className="py-2.5 px-3 text-center">
                  {resultatXD.classe ? (
                    <span className="font-mono font-bold px-2 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                      {resultatXD.classe}
                    </span>
                  ) : (
                    <span className="text-zinc-400 font-mono text-[11px]">—</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-zinc-700 leading-relaxed">
                  <div>{resultatXD.justification}</div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                    {resultatXD.normeRef}
                  </span>
                </td>
              </tr>

              {/* XF */}
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-900">
                  Gel / Dégel (XF)
                </td>
                <td className="py-2.5 px-3 text-center">
                  {resultatXF.classe ? (
                    <span className="font-mono font-bold px-2 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                      {resultatXF.classe}
                    </span>
                  ) : (
                    <span className="text-zinc-400 font-mono text-[11px]">—</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-zinc-700 leading-relaxed">
                  <div>{resultatXF.justification}</div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                    {resultatXF.normeRef}
                  </span>
                </td>
              </tr>

              {/* XA */}
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-900">
                  Attaque chimique (XA)
                </td>
                <td className="py-2.5 px-3 text-center">
                  {resultatXA.classe ? (
                    <span className="font-mono font-bold px-2 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                      {resultatXA.classe}
                    </span>
                  ) : (
                    <span className="text-zinc-400 font-mono text-[11px]">—</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-zinc-700 leading-relaxed">
                  <div>{resultatXA.justification}</div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                    {resultatXA.normeRef}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. DÉTAIL CLASSE STRUCTURALE (TABLEAU 4.3N) */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="mb-3 pb-3 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              EN 1992-1-1 Tableau 4.3N
            </span>
            <h4 className="text-sm font-bold text-zinc-900">
              Détermination de la classe structurale : S{modificateurs.classeFinale}
            </h4>
          </div>
          <span className="font-mono text-xs px-2.5 py-0.5 bg-zinc-100 text-zinc-800 font-bold rounded border border-zinc-200">
            S{modificateurs.classeFinale}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-zinc-700">
          {modificateurs.justification.map((just, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-zinc-400 mt-0.5">•</span>
              <span>{just}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
