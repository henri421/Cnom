import React from 'react';
import { ElementBeton, ResultatCalculElement } from '../types';
import { Printer, ArrowLeft, ShieldCheck, FileCheck } from 'lucide-react';

interface Props {
  elements: ElementBeton[];
  calculsMap: Record<string, ResultatCalculElement>;
  onClose: () => void;
  projetNom?: string;
}

export const PrintReport: React.FC<Props> = ({
  elements,
  calculsMap,
  onClose,
  projetNom = 'NOTE DE CALCUL D’ENROBAGE',
}) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white min-h-screen py-8 px-4 sm:px-8 max-w-5xl mx-auto text-zinc-900 font-sans print:p-0 print:m-0 print:max-w-none">
      {/* Top action toolbar (hidden in print) */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-200 print:hidden">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'éditeur
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            Prêt pour export PDF / impression A4
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-md transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            Imprimer / Enregistrer en PDF
          </button>
        </div>
      </div>

      {/* DOCUMENT HEADER */}
      <header className="border-b border-zinc-300 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
              BUREAU D'ÉTUDES STRUCTURE • CALCUL DE BÉTON ARMÉ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 mt-1">
              {projetNom}
            </h1>
            <p className="text-xs text-zinc-600 mt-1 font-medium">
              Détermination des classes d'exposition, catégorie de béton DNA W.1 et enrobage nominal
            </p>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="font-mono text-zinc-500">Date : {currentDate}</div>
            <div className="font-mono text-zinc-700 font-semibold">
              Référence : EN 1992-1-1 / EN 206
            </div>
            <div className="font-mono text-zinc-500">Annexe : ILNAS (Luxembourg)</div>
          </div>
        </div>

        {/* Normative Frame Box */}
        <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-700 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="font-semibold block text-zinc-900">Norme Enrobage :</span>
            EN 1992-1-1:2004+A1:2014 clause 4.4.1
          </div>
          <div>
            <span className="font-semibold block text-zinc-900">Norme Béton :</span>
            EN 206:2013+A2:2021 &amp; Tableau DNA W.1
          </div>
          <div>
            <span className="font-semibold block text-zinc-900">Marge d'exécution :</span>
            Δc,dev = 10 mm (recommandée standard)
          </div>
        </div>
      </header>

      {/* 1. SYNTHESIS TABLE */}
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-zinc-800" />
          1. Tableau récapitulatif des éléments &amp; faces analysées
        </h2>

        <div className="border border-zinc-300 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 text-zinc-800 border-b border-zinc-300 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Face de l'élément</th>
                <th className="py-2.5 px-2 text-center">Type</th>
                <th className="py-2.5 px-2 text-center">Durée</th>
                <th className="py-2.5 px-2 text-center">∅ (mm)</th>
                <th className="py-2.5 px-3">Classes d'exposition</th>
                <th className="py-2.5 px-2 text-center">Cl. dét.</th>
                <th className="py-2.5 px-2 text-center">Struct.</th>
                <th className="py-2.5 px-2 text-center">cmin</th>
                <th className="py-2.5 px-2 text-center">Δc,dev</th>
                <th className="py-2.5 px-3 text-center bg-zinc-200 font-bold">cnom</th>
                <th className="py-2.5 px-3">Cat. DNA W.1</th>
                <th className="py-2.5 px-3">fck admises</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {elements.map((el) => {
                const calc = calculsMap[el.id];
                if (!calc) return null;
                const { enrobage, modificateurs, categorieOptimale, fckRecommandees } = calc;

                const classesList = [
                  calc.resultatXC.classe,
                  calc.resultatXD.classe,
                  calc.resultatXF.classe,
                  calc.resultatXA.classe,
                ]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <tr key={el.id} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 px-3 font-semibold text-zinc-950">
                      {el.nom}
                    </td>
                    <td className="py-2.5 px-2 text-center capitalize font-mono text-[11px]">
                      {el.typeElement}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {el.dureeUtilisationProjet} ans
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold">
                      {el.diametreBarreMm}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[11px] text-zinc-800">
                      {classesList}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-sky-800">
                      {enrobage.classeDeterminante}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-zinc-800">
                      S{modificateurs.classeFinale}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-zinc-700">
                      {enrobage.cmin}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-zinc-500">
                      +{enrobage.deltaCDev}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-sm bg-zinc-100 text-zinc-950">
                      {enrobage.cnom} mm
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 text-[11px]">
                      {categorieOptimale ? `Cat. ${categorieOptimale.code}` : 'Sur étude'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-700">
                      {fckRecommandees.join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. DETAILED BREAKDOWN PER ELEMENT */}
      <section className="space-y-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-4">
          2. Justifications techniques détaillées par élément
        </h2>

        {elements.map((el, idx) => {
          const calc = calculsMap[el.id];
          if (!calc) return null;
          const { enrobage, modificateurs, resultatXC, resultatXD, resultatXF, resultatXA, categorieOptimale } = calc;

          return (
            <div
              key={el.id}
              className="border border-zinc-200 rounded p-4 break-inside-avoid bg-white"
            >
              <div className="flex justify-between items-baseline border-b border-zinc-200 pb-2 mb-3">
                <h3 className="text-sm font-extrabold text-zinc-900">
                  {idx + 1}. {el.nom} ({el.typeElement.toUpperCase()})
                </h3>
                <span className="font-mono text-xs font-bold text-zinc-900">
                  cnom = {enrobage.cnom} mm (cmin: {enrobage.cmin} mm + Δc,dev: {enrobage.deltaCDev} mm)
                </span>
              </div>

              {/* Exposure classes justifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                <div className="p-2.5 bg-zinc-50 rounded border border-zinc-100">
                  <span className="font-semibold text-zinc-900 block mb-0.5">
                    Carbonatation : {resultatXC.classe || 'X0'}
                  </span>
                  <p className="text-zinc-600 leading-snug">{resultatXC.justification}</p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">{resultatXC.normeRef}</span>
                </div>

                <div className="p-2.5 bg-zinc-50 rounded border border-zinc-100">
                  <span className="font-semibold text-zinc-900 block mb-0.5">
                    Chlorures non marins : {resultatXD.classe || 'Néant'}
                  </span>
                  <p className="text-zinc-600 leading-snug">{resultatXD.justification}</p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">{resultatXD.normeRef}</span>
                </div>

                <div className="p-2.5 bg-zinc-50 rounded border border-zinc-100">
                  <span className="font-semibold text-zinc-900 block mb-0.5">
                    Gel / Dégel : {resultatXF.classe || 'Néant'}
                  </span>
                  <p className="text-zinc-600 leading-snug">{resultatXF.justification}</p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">{resultatXF.normeRef}</span>
                </div>

                <div className="p-2.5 bg-zinc-50 rounded border border-zinc-100">
                  <span className="font-semibold text-zinc-900 block mb-0.5">
                    Agressivité chimique : {resultatXA.classe || 'Néant'}
                  </span>
                  <p className="text-zinc-600 leading-snug">{resultatXA.justification}</p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">{resultatXA.normeRef}</span>
                </div>
              </div>

              {/* Concrete Category & Structural class */}
              <div className="p-3 bg-zinc-50 rounded border border-zinc-200 text-xs flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="font-semibold text-zinc-900">
                    Béton prescrit : Catégorie {categorieOptimale?.code ?? 'N/A'} (Tableau DNA W.1)
                  </span>
                  <p className="text-zinc-600 mt-0.5">{categorieOptimale?.description}</p>
                </div>
                <div className="text-right sm:shrink-0 font-mono text-[11px] text-zinc-700">
                  <div>Classe structurale : S{modificateurs.classeFinale}</div>
                  <div>Classe déterminante : {enrobage.classeDeterminante}</div>
                  <div>cmin,dur = {enrobage.cminDur} mm</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* FOOTER SIGNATURE BLOCK */}
      <footer className="mt-12 pt-6 border-t-2 border-zinc-900 grid grid-cols-2 gap-6 text-xs text-zinc-600 break-inside-avoid">
        <div>
          <span className="font-bold text-zinc-900 block mb-1">Visa Ingénieur d'Études :</span>
          <div className="h-16 border border-dashed border-zinc-300 rounded p-2 text-zinc-400">
            Date &amp; Signature
          </div>
        </div>
        <div>
          <span className="font-bold text-zinc-900 block mb-1">Visa Contrôle Technique (SECO / ILNAS) :</span>
          <div className="h-16 border border-dashed border-zinc-300 rounded p-2 text-zinc-400">
            Observations / Visa
          </div>
        </div>
      </footer>
    </div>
  );
};
