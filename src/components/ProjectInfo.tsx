import React from 'react';
import { JEUX_PARAMETRES } from '../parametres-nationaux';
import { JeuParametres, ProjetCnom } from '../types';

interface Props {
  projet: ProjetCnom;
  onChange: (p: ProjetCnom) => void;
}

const champ =
  'w-full text-sm px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900';

export const ProjectInfo: React.FC<Props> = ({ projet, onChange }) => {
  const maj = <K extends keyof ProjetCnom>(k: K, v: ProjetCnom[K]) => onChange({ ...projet, [k]: v });
  const jeu = JEUX_PARAMETRES[projet.jeuParametres];

  return (
    <section className="bg-white border border-zinc-200 rounded-lg p-4 print:hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <label className="lg:col-span-2 text-xs font-semibold text-zinc-700">
          Titre du projet
          <input className={champ} value={projet.titre} onChange={(e) => maj('titre', e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-zinc-700">
          Référence
          <input
            className={champ}
            value={projet.referenceProjet}
            onChange={(e) => maj('referenceProjet', e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold text-zinc-700">
          Auteur
          <input className={champ} value={projet.auteur} onChange={(e) => maj('auteur', e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-zinc-700">
          Date
          <input type="date" className={champ} value={projet.date} onChange={(e) => maj('date', e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-zinc-700" title={jeu.source}>
          Paramètres nationaux
          <select
            className={champ}
            value={projet.jeuParametres}
            onChange={(e) => maj('jeuParametres', e.target.value as JeuParametres)}
          >
            {Object.values(JEUX_PARAMETRES).map((j) => (
              <option key={j.id} value={j.id}>
                {j.libelle}
              </option>
            ))}
          </select>
        </label>
      </div>
      {projet.jeuParametres === 'LU' && (
        <p className="mt-2 text-[11px] text-amber-700">
          Jeu ANL : les valeurs de l’annexe nationale luxembourgeoise de l’EN 1992-1-1 n’ont pas pu être vérifiées ;
          les valeurs recommandées sont reprises en attendant (à vérifier).
        </p>
      )}
    </section>
  );
};
