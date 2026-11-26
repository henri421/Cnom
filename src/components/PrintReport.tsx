import React from 'react';
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
    <div className="rapport">
      <div className="outils">
        <button type="button" onClick={onClose}>
          ← Retour au tableau
        </button>
        <button type="button" onClick={() => window.print()}>
          Imprimer / enregistrer en PDF
        </button>
      </div>

      <header className="cartouche">
        <div>
          <p className="sous-titre" style={{ margin: 0 }}>
            Note de calcul : classes d’exposition et enrobage
          </p>
          <h1>{projet.titre}</h1>
        </div>
        <div className="note" style={{ margin: 0, textAlign: 'right' }}>
          {projet.referenceProjet && <div>Référence : {projet.referenceProjet}</div>}
          {projet.auteur && <div>Auteur : {projet.auteur}</div>}
          {date && <div>Date : {date}</div>}
        </div>
      </header>

      <p className="note">
        Enrobage : EN 1992-1-1:2004+A1:2014, 4.4.1. Béton : EN 206 et tableau DNA W.1 (ILNAS). Paramètres nationaux :{' '}
        {p.libelle}.
      </p>

      <h2>1. Tableau de synthèse</h2>
      <div className="defilement">
        <table className="projet">
          <thead>
            <tr>
              {COLONNES_SYNTHESE.map((c) => (
                <th key={c.cle} className={c.unite ? 'num' : ''}>
                  {titreColonne(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.face.id} className="ligne">
                {COLONNES_SYNTHESE.map((c) => (
                  <td key={c.cle} className={`${c.unite ? 'num' : ''}${c.cle === 'cnom' ? ' cnom' : ''}`}>
                    {c.valeur(l)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>2. Justification par ligne</h2>
      {lignes.map((l, i) => (
        <article key={l.face.id}>
          <div className="entete-cadre">
            <h3 style={{ margin: 0 }}>
              {i + 1}. {l.element.nom} : {libelleFace(l.face)} <span className="clause">{libelleType(l.element)}</span>
            </h3>
            <span className="mono" style={{ fontWeight: 600 }}>
              cnom = {l.resultat.enrobage.cnomRetenu} mm
            </span>
          </div>
          {l.resultat.cheminement.map((etape) => (
            <div key={etape.titre}>
              <div className="etape-titre">
                {etape.titre} <span className="clause">{etape.reference}</span>
              </div>
              <ul style={{ margin: '0.1rem 0 0.4rem', paddingLeft: '1.2rem' }}>
                {etape.lignes.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
          {l.resultat.avertissements.length > 0 && (
            <div className="verdict alerte">
              {l.resultat.avertissements.length} avertissement(s)
              <div className="detail">
                {l.resultat.avertissements.map((a, j) => (
                  <div key={j}>{a}</div>
                ))}
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
};
