import React from 'react';
import { BookOpen, TriangleAlert } from 'lucide-react';
import { ElementBeton, FaceBeton, ResultatFace } from '../types';
import { libelleFace } from '../lignes';
import { TechnicalSvgDiagram } from './TechnicalSvgDiagram';

interface Props {
  element: ElementBeton;
  face: FaceBeton;
  resultat: ResultatFace;
  onOpenDnaModal: () => void;
}

const Chiffre: React.FC<{ libelle: string; valeur: string; fort?: boolean }> = ({ libelle, valeur, fort }) => (
  <div className={`rounded-md border px-3 py-2 ${fort ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-zinc-200 bg-white'}`}>
    <div className={`text-[10px] uppercase tracking-wider ${fort ? 'text-zinc-300' : 'text-zinc-500'}`}>{libelle}</div>
    <div className={`font-mono font-bold ${fort ? 'text-2xl' : 'text-base text-zinc-900'}`}>{valeur}</div>
  </div>
);

export const ResultPanel: React.FC<Props> = ({ element, face, resultat, onOpenDnaModal }) => {
  const e = resultat.enrobage;
  return (
    <div className="space-y-4">
      <section className="bg-white border border-zinc-200 rounded-lg p-4">
        <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-zinc-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">6. Résultat</h3>
          <span className="text-xs text-zinc-500 truncate ml-2">
            {element.nom} · {libelleFace(face)}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Chiffre libelle="cnom retenu" valeur={`${e.cnomRetenu} mm`} fort />
          <Chiffre libelle="cnom brut" valeur={`${e.cnomBrut} mm`} />
          <Chiffre libelle="cmin" valeur={`${e.cminMajore} mm`} />
          <Chiffre libelle="Δcdev" valeur={`${e.deltaCDev} mm`} />
          <Chiffre libelle="Classes" valeur={resultat.classesExposition.join(' ')} />
          <Chiffre libelle="Déterminante" valeur={`${e.classeDeterminante} / S${e.classeStructurale}`} />
          <Chiffre libelle="cmin,b" valeur={`${e.cminB} mm`} />
          <Chiffre libelle="cmin,dur" valeur={`${e.cminDur} mm`} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span>
            Catégorie DNA W.1 :{' '}
            <span className="font-mono font-bold">{resultat.categorieRetenue?.code ?? 'sur étude'}</span>
            {face.classeResistance && <span className="ml-2 font-mono">{face.classeResistance}</span>}
          </span>
          <button
            onClick={onOpenDnaModal}
            className="inline-flex items-center gap-1 px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-50"
          >
            <BookOpen className="w-3.5 h-3.5" /> Tableau DNA W.1
          </button>
        </div>
        {resultat.avertissements.length > 0 && (
          <ul className="mt-3 space-y-1">
            {resultat.avertissements.map((a, i) => (
              <li key={i} className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 flex gap-1.5">
                <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {a}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-zinc-200 rounded-lg p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
          Cheminement
        </h3>
        <ol className="space-y-3">
          {resultat.cheminement.map((etape) => (
            <li key={etape.titre}>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-zinc-900">{etape.titre}</span>
                <span className="text-[10px] font-mono text-zinc-400 ml-2 text-right">{etape.reference}</span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {etape.lignes.map((l, i) => (
                  <li key={i} className="text-[11px] text-zinc-700 leading-snug">
                    {l}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <TechnicalSvgDiagram element={element} face={face} resultat={resultat} />
    </div>
  );
};
