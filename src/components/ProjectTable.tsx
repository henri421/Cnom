import React, { useState } from 'react';
import { COLONNES_SYNTHESE, LigneTableau, Selection, titreColonne } from '../lignes';
import { libelleType } from '../libelles';
import { ElementBeton } from '../types';

interface Props {
  lignes: LigneTableau[];
  elements: ElementBeton[];
  selection: Selection | null;
  onSelect: (s: Selection) => void;
  onNouvelElement: () => void;
  onNouvelleLigneDepuis: () => void;
  onDupliquerLigne: (elementId: string, faceId: string) => void;
  onCopierVersElement: (elementId: string, faceId: string, cibleId: string) => void;
  onSupprimerLigne: (elementId: string, faceId: string) => void;
  onDeplacerLigne: (elementId: string, faceId: string, sens: -1 | 1) => void;
  onDupliquerElement: (elementId: string) => void;
  onSupprimerElement: (elementId: string) => void;
  onDeplacerElement: (elementId: string, sens: -1 | 1) => void;
  onAjouterFace: (elementId: string) => void;
}

// La colonne Element est portee par la ligne d'en-tete de chaque element.
const COLONNES = COLONNES_SYNTHESE.filter((c) => c.cle !== 'element' && c.cle !== 'type');

export const ProjectTable: React.FC<Props> = (props) => {
  const { lignes, elements, selection, onSelect } = props;
  const [copieOuverte, setCopieOuverte] = useState<string | null>(null);
  const nbCol = COLONNES.length + 1;

  return (
    <section className="cadre" aria-label="tableau du projet">
      <div className="entete-cadre">
        <h2>
          Tableau du projet{' '}
          <span className="clause">
            {lignes.length} ligne{lignes.length > 1 ? 's' : ''}, une par face
          </span>
        </h2>
        <div className="boutons" style={{ marginTop: 0 }}>
          <button
            type="button"
            onClick={props.onNouvelleLigneDepuis}
            disabled={!selection}
            title="Crée une face dans le même élément en reprenant tous les paramètres de la ligne sélectionnée"
          >
            Nouvelle ligne à partir de la sélection
          </button>
          <button type="button" onClick={props.onNouvelElement}>
            Nouvel élément
          </button>
        </div>
      </div>

      <div className="defilement">
        <table className="projet">
          <thead>
            <tr>
              {COLONNES.map((c) => (
                <th key={c.cle} className={c.unite ? 'num' : ''}>
                  {titreColonne(c)}
                </th>
              ))}
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {elements.map((element, ie) => (
              <React.Fragment key={element.id}>
                <tr className="element">
                  <td colSpan={nbCol - 1}>
                    <span className="nom-element">{element.nom || 'Élément sans nom'}</span>
                    <span className="type-element">{libelleType(element)}</span>
                  </td>
                  <td className="actions">
                    <button type="button" className="mini" title="Ajouter une face à cet élément" onClick={() => props.onAjouterFace(element.id)}>
                      + face
                    </button>
                    <button type="button" className="mini" title="Dupliquer l’élément et toutes ses faces" onClick={() => props.onDupliquerElement(element.id)}>
                      Dupliquer
                    </button>
                    <button type="button" className="mini" title="Monter l’élément" disabled={ie === 0} onClick={() => props.onDeplacerElement(element.id, -1)}>
                      ↑
                    </button>
                    <button
                      type="button"
                      className="mini"
                      title="Descendre l’élément"
                      disabled={ie === elements.length - 1}
                      onClick={() => props.onDeplacerElement(element.id, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="mini"
                      title="Supprimer l’élément"
                      onClick={() => {
                        if (window.confirm(`Supprimer l’élément « ${element.nom} » et ses ${element.faces.length} face(s) ?`)) {
                          props.onSupprimerElement(element.id);
                        }
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
                {lignes
                  .filter((l) => l.element.id === element.id)
                  .map((l) => {
                    const active = selection?.faceId === l.face.id;
                    const alerte = l.resultat.avertissements.length > 0;
                    return (
                      <tr
                        key={l.face.id}
                        className={`ligne${active ? ' active' : ''}`}
                        onClick={() => onSelect({ elementId: element.id, faceId: l.face.id })}
                        aria-selected={active}
                      >
                        {COLONNES.map((c) => (
                          <td key={c.cle} className={`${c.unite ? 'num' : ''}${c.cle === 'cnom' ? ' cnom' : ''}`}>
                            {c.cle === 'face' && alerte && (
                              <span className="repere-alerte" title={l.resultat.avertissements.join('\n')}>
                                !
                              </span>
                            )}
                            {c.valeur(l)}
                          </td>
                        ))}
                        <td className="actions" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="mini"
                            title="Dupliquer la ligne (copie complète, ouverte en édition)"
                            onClick={() => props.onDupliquerLigne(element.id, l.face.id)}
                          >
                            Dupliquer
                          </button>
                          <button
                            type="button"
                            className="mini"
                            title="Copier cette face vers un autre élément"
                            onClick={() => setCopieOuverte(copieOuverte === l.face.id ? null : l.face.id)}
                          >
                            Copier vers…
                          </button>
                          <button
                            type="button"
                            className="mini"
                            title="Monter"
                            disabled={l.indexFace === 0}
                            onClick={() => props.onDeplacerLigne(element.id, l.face.id, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="mini"
                            title="Descendre"
                            disabled={l.indexFace === element.faces.length - 1}
                            onClick={() => props.onDeplacerLigne(element.id, l.face.id, 1)}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="mini"
                            title="Supprimer la ligne"
                            onClick={() => {
                              if (window.confirm('Supprimer cette ligne ?')) props.onSupprimerLigne(element.id, l.face.id);
                            }}
                          >
                            ×
                          </button>
                          {copieOuverte === l.face.id && (
                            <div className="menu-copie">
                              <div className="sous-groupe">Copier la face vers :</div>
                              {elements
                                .filter((e) => e.id !== element.id)
                                .map((e) => (
                                  <button
                                    type="button"
                                    key={e.id}
                                    onClick={() => {
                                      props.onCopierVersElement(element.id, l.face.id, e.id);
                                      setCopieOuverte(null);
                                    }}
                                  >
                                    {e.nom || 'Élément sans nom'}
                                  </button>
                                ))}
                              <button
                                type="button"
                                onClick={() => {
                                  props.onCopierVersElement(element.id, l.face.id, 'nouveau');
                                  setCopieOuverte(null);
                                }}
                              >
                                + Nouvel élément
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
