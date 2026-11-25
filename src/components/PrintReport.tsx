import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { COLONNES_SYNTHESE, LigneTableau, libelleFace, titreColonne } from '../lignes';
import { libelleType } from '../libelles';
import { parametres } from '../parametres-nationaux';
import { ProjetCnom } from '../types';

interface Props {
  projet: ProjetCnom;
  lignes: LigneTableau[];
  onClose: () => void;
}

export const PrintReport: React.FC<Props> = ({ projet, lignes, onClose }) => {
  const p = parametres(projet.jeuParametres);
  const date = projet.date
    ? new Date(projet.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="bg-white min-h-screen py-8 px-4 sm:px-8 max-w-6xl mx-auto text-zinc-900 font-sans print:p-0 print:m-0 print:max-w-none">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-200 print:hidden">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white hover:bg-zinc-50 border border-zinc-300 rounded-md"
        >
          <Printer className="w-4 h-4" />
          Imprimer / enregistrer en PDF
        </button>
      </div>

      <header className="border-b border-zinc-300 pb-4 mb-6">
        <div className="flex justify-between items-start gap-6">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
              Note de calcul : classes d’exposition et enrobage
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 mt-1">{projet.titre}</h1>
          </div>
          <div className="text-right text-xs space-y-0.5 font-mono">
            {projet.referenceProjet && <div>Référence : {projet.referenceProjet}</div>}
            {projet.auteur && <div>Auteur : {projet.auteur}</div>}
            {date && <div>Date : {date}</div>}
          </div>
        </div>
        <div className="mt-3 p-2 bg-zinc-50 border border-zinc-200 rounded text-[11px] text-zinc-700 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="font-semibold block text-zinc-900">Enrobage</span>EN 1992-1-1:2004+A1:2014, 4.4.1
          </div>
          <div>
            <span className="font-semibold block text-zinc-900">Béton</span>EN 206 et tableau DNA W.1 (ILNAS)
          </div>
          <div>
            <span className="font-semibold block text-zinc-900">Paramètres nationaux</span>
            {p.libelle}
          </div>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">1. Tableau de synthèse</h2>
        <table className="w-full text-left text-[10px] border-collapse border border-zinc-300">
          <thead>
            <tr className="bg-zinc-100">
              {COLONNES_SYNTHESE.map((c) => (
                <th key={c.cle} className={`py-1.5 px-1.5 border border-zinc-300 ${c.unite ? 'text-right' : ''}`}>
                  {titreColonne(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, i) => (
              <tr key={l.face.id} className={i % 2 ? 'bg-zinc-50' : ''}>
                {COLONNES_SYNTHESE.map((c) => (
                  <td
                    key={c.cle}
                    className={`py-1 px-1.5 border border-zinc-200 ${c.unite ? 'text-right font-mono' : ''} ${
                      c.cle === 'cnom' ? 'font-bold bg-zinc-100' : ''
                    }`}
                  >
                    {c.valeur(l)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider">2. Justification par ligne</h2>
        {lignes.map((l, i) => (
          <article key={l.face.id} className="border border-zinc-300 rounded p-3 break-inside-avoid">
            <div className="flex justify-between items-baseline border-b border-zinc-200 pb-1 mb-2">
              <h3 className="text-xs font-bold">
                {i + 1}. {l.element.nom} : {libelleFace(l.face)}{' '}
                <span className="font-normal text-zinc-500">({libelleType(l.element)})</span>
              </h3>
              <span className="text-sm font-mono font-extrabold">cnom = {l.resultat.enrobage.cnomRetenu} mm</span>
            </div>
            {l.resultat.cheminement.map((etape) => (
              <div key={etape.titre} className="mb-1.5">
                <div className="text-[10px] font-semibold">
                  {etape.titre} <span className="font-mono font-normal text-zinc-500">[{etape.reference}]</span>
                </div>
                {etape.lignes.map((t, j) => (
                  <div key={j} className="text-[10px] text-zinc-700 pl-3">
                    {t}
                  </div>
                ))}
              </div>
            ))}
            {l.resultat.avertissements.length > 0 && (
              <div className="mt-1 text-[10px] text-amber-800">
                {l.resultat.avertissements.map((a, j) => (
                  <div key={j}>Avertissement : {a}</div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};
