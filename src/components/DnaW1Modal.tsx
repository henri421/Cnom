import React from 'react';
import { DNA_W1_CATEGORIES } from '../engine';
import { ClasseExposition } from '../types';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeClasses?: ClasseExposition[];
  selectedCategoryCode?: string | null;
}

export const DnaW1Modal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeClasses = [],
  selectedCategoryCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div
        id="dna-w1-modal"
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-zinc-200 text-zinc-800 rounded">
                EN 206 • Annexe Nationale ILNAS
              </span>
              <span className="text-xs text-zinc-500">Document normatif de référence</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mt-1">
              Tableau DNA W.1 — Catégories de béton
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Note technique d'application :</span> Les catégories de béton du tableau DNA W.1 permettent de prescrire un béton couvrant simultanément plusieurs classes d'exposition selon les pratiques de construction au Luxembourg. Chaque catégorie impose des classes de résistance fck minimales admissibles.
            </div>
          </div>

          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200 font-semibold">
                  <th className="py-2.5 px-3 w-20">Catégorie</th>
                  <th className="py-2.5 px-4">Description d'utilisation & champ d'application</th>
                  <th className="py-2.5 px-3">Classes couvertes</th>
                  <th className="py-2.5 px-3 w-32">Classes fck admises</th>
                  <th className="py-2.5 px-3 w-24 text-center">Statut actuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {Object.values(DNA_W1_CATEGORIES).map((cat) => {
                  const isSelected = selectedCategoryCode === cat.code;
                  // check if it covers current active classes
                  const coversAllActive =
                    activeClasses.length > 0 &&
                    activeClasses.every((c) => cat.classesCouvertes.has(c));

                  return (
                    <tr
                      key={cat.code}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-sky-50/80 font-medium'
                          : coversAllActive
                          ? 'bg-emerald-50/40 hover:bg-zinc-50'
                          : 'hover:bg-zinc-50'
                      }`}
                    >
                      <td className="py-3 px-3 align-top font-mono font-bold text-sm text-zinc-900">
                        Cat. {cat.code}
                      </td>
                      <td className="py-3 px-4 align-top text-zinc-700 leading-relaxed">
                        {cat.description}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(cat.classesCouvertes).map((cl) => {
                            const isReq = activeClasses.includes(cl);
                            return (
                              <span
                                key={cl}
                                className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                  isReq
                                    ? 'bg-zinc-900 text-white font-bold'
                                    : 'bg-zinc-100 text-zinc-600'
                                }`}
                              >
                                {cl}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top font-mono text-zinc-800">
                        {cat.fckPossibles.join(', ')}
                      </td>
                      <td className="py-3 px-3 align-top text-center">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Retenue
                          </span>
                        ) : coversAllActive ? (
                          <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Compatible
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Non conforme</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>Source : EN 206 Annexe Nationale Luxembourgeoise (ILNAS)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
