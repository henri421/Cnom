import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, CopyPlus, Layers, Plus, Send, Trash2, TriangleAlert } from 'lucide-react';
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

const bouton =
  'p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent';

export const ProjectTable: React.FC<Props> = (props) => {
  const { lignes, elements, selection, onSelect } = props;
  const [copieOuverte, setCopieOuverte] = useState<string | null>(null);

  return (
    <section className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-600" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Tableau du projet : {lignes.length} ligne{lignes.length > 1 ? 's' : ''} (une par face)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={props.onNouvelleLigneDepuis}
            disabled={!selection}
            title="Crée une face dans le même élément en reprenant tous les paramètres de la ligne sélectionnée"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-zinc-50 border border-zinc-300 rounded-md disabled:opacity-40"
          >
            <CopyPlus className="w-3.5 h-3.5" />
            Nouvelle ligne à partir de la sélection
          </button>
          <button
            onClick={props.onNouvelElement}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvel élément
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-100 text-zinc-700 text-[11px] text-left">
              {COLONNES_SYNTHESE.map((c) => (
                <th key={c.cle} className={`py-2 px-2 font-semibold whitespace-nowrap ${c.unite ? 'text-right' : ''}`}>
                  {titreColonne(c)}
                </th>
              ))}
              <th className="py-2 px-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {elements.map((element, ie) => (
              <React.Fragment key={element.id}>
                <tr className="bg-zinc-50 border-t border-zinc-200">
                  <td colSpan={COLONNES_SYNTHESE.length} className="py-1.5 px-2">
                    <span className="font-bold text-zinc-900">{element.nom || 'Élément sans nom'}</span>
                    <span className="ml-2 text-[11px] text-zinc-500">{libelleType(element)}</span>
                  </td>
                  <td className="py-1 px-2 text-right whitespace-nowrap">
                    <button className={bouton} title="Ajouter une face à cet élément" onClick={() => props.onAjouterFace(element.id)}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button className={bouton} title="Dupliquer l’élément et toutes ses faces" onClick={() => props.onDupliquerElement(element.id)}>
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className={bouton} title="Monter l’élément" disabled={ie === 0} onClick={() => props.onDeplacerElement(element.id, -1)}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className={bouton}
                      title="Descendre l’élément"
                      disabled={ie === elements.length - 1}
                      onClick={() => props.onDeplacerElement(element.id, 1)}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className={`${bouton} hover:text-red-600`}
                      title="Supprimer l’élément"
                      onClick={() => {
                        if (window.confirm(`Supprimer l’élément « ${element.nom} » et ses ${element.faces.length} face(s) ?`)) {
                          props.onSupprimerElement(element.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
                        onClick={() => onSelect({ elementId: element.id, faceId: l.face.id })}
                        className={`border-t border-zinc-100 cursor-pointer ${
                          active ? 'bg-sky-50 outline outline-1 outline-sky-300' : 'hover:bg-zinc-50'
                        }`}
                      >
                        {COLONNES_SYNTHESE.map((c) => (
                          <td
                            key={c.cle}
                            className={`py-1.5 px-2 ${c.unite ? 'text-right font-mono' : ''} ${
                              c.cle === 'cnom' ? 'font-bold text-sm text-zinc-950 bg-zinc-100/70' : ''
                            } ${c.cle === 'element' ? 'text-zinc-400' : ''}`}
                          >
                            {c.cle === 'face' && alerte && (
                              <TriangleAlert
                                className="inline w-3 h-3 mr-1 text-amber-600"
                                aria-label={l.resultat.avertissements.join(' ')}
                              />
                            )}
                            {c.valeur(l)}
                          </td>
                        ))}
                        <td className="py-1 px-2 text-right whitespace-nowrap relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            className={bouton}
                            title="Dupliquer la ligne (copie complète, ouverte en édition)"
                            onClick={() => props.onDupliquerLigne(element.id, l.face.id)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className={bouton}
                            title="Copier cette face vers un autre élément"
                            onClick={() => setCopieOuverte(copieOuverte === l.face.id ? null : l.face.id)}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className={bouton}
                            title="Monter"
                            disabled={l.indexFace === 0}
                            onClick={() => props.onDeplacerLigne(element.id, l.face.id, -1)}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className={bouton}
                            title="Descendre"
                            disabled={l.indexFace === element.faces.length - 1}
                            onClick={() => props.onDeplacerLigne(element.id, l.face.id, 1)}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className={`${bouton} hover:text-red-600`}
                            title="Supprimer la ligne"
                            onClick={() => {
                              if (window.confirm('Supprimer cette ligne ?')) props.onSupprimerLigne(element.id, l.face.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {copieOuverte === l.face.id && (
                            <div className="absolute right-2 top-8 z-20 bg-white border border-zinc-300 rounded-md shadow-lg p-2 text-left w-64">
                              <div className="text-[11px] font-semibold text-zinc-600 mb-1">Copier la face vers :</div>
                              {elements
                                .filter((e) => e.id !== element.id)
                                .map((e) => (
                                  <button
                                    key={e.id}
                                    className="block w-full text-left px-2 py-1 rounded hover:bg-zinc-100"
                                    onClick={() => {
                                      props.onCopierVersElement(element.id, l.face.id, e.id);
                                      setCopieOuverte(null);
                                    }}
                                  >
                                    {e.nom || 'Élément sans nom'}
                                  </button>
                                ))}
                              <button
                                className="block w-full text-left px-2 py-1 rounded hover:bg-zinc-100 font-semibold"
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
