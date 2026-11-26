import React, { useRef } from 'react';
import { genererJson, lireJson } from '../export/json';
import { nomFichier, telecharger } from '../export/commun';
import { JEUX_PARAMETRES } from '../parametres-nationaux';
import { JeuParametres, ProjetCnom } from '../types';

interface Props {
  projet: ProjetCnom;
  onChange: (p: ProjetCnom) => void;
  onChargerProjet: (p: ProjetCnom) => void;
  onExemple: () => void;
}

export const ProjectInfo: React.FC<Props> = ({ projet, onChange, onChargerProjet, onExemple }) => {
  const maj = <K extends keyof ProjetCnom>(k: K, v: ProjetCnom[K]) => onChange({ ...projet, [k]: v });
  const fichierRef = useRef<HTMLInputElement>(null);

  const ouvrir = async (fichier: File | undefined) => {
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

  return (
    <section className="cadre" aria-label="projet">
      <fieldset>
        <legend>Projet</legend>
        <div className="grille-champs">
          <label>
            <span>Titre</span>
            <input type="text" value={projet.titre} onChange={(e) => maj('titre', e.target.value)} />
          </label>
          <label>
            <span>Référence</span>
            <input type="text" value={projet.referenceProjet} onChange={(e) => maj('referenceProjet', e.target.value)} />
          </label>
          <label>
            <span>Auteur</span>
            <input type="text" value={projet.auteur} onChange={(e) => maj('auteur', e.target.value)} />
          </label>
          <label>
            <span>Date</span>
            <input type="date" value={projet.date} onChange={(e) => maj('date', e.target.value)} />
          </label>
          <label title={JEUX_PARAMETRES[projet.jeuParametres].source}>
            <span>Paramètres nationaux</span>
            <select value={projet.jeuParametres} onChange={(e) => maj('jeuParametres', e.target.value as JeuParametres)}>
              {Object.values(JEUX_PARAMETRES).map((j) => (
                <option key={j.id} value={j.id}>
                  {j.id === 'EN' ? 'Valeurs recommandées EN' : 'ANL Luxembourg'}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="boutons">
          <button type="button" onClick={() => telecharger(genererJson(projet), nomFichier(projet, 'json'), 'application/json')}>
            Enregistrer (JSON)
          </button>
          <button type="button" onClick={() => fichierRef.current?.click()}>
            Ouvrir un projet
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Remplacer le projet courant par le projet exemple ? Les données non enregistrées en fichier seront perdues.')) {
                onExemple();
              }
            }}
          >
            Exemple de départ
          </button>
          <input
            ref={fichierRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              ouvrir(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      </fieldset>
    </section>
  );
};
