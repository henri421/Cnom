/**
 * Lignes du tableau de projet (une par face) et colonnes de synthese communes
 * a l'ecran, au rapport imprime et aux exports.
 */

import { libelle, libelleType, POSITIONS_FACE } from './libelles';
import { ElementBeton, FaceBeton, ResultatFace } from './types';

export interface Selection {
  elementId: string;
  faceId: string;
}

export interface LigneTableau {
  element: ElementBeton;
  face: FaceBeton;
  indexElement: number;
  indexFace: number;
  resultat: ResultatFace;
}

export interface ColonneSynthese {
  cle: string;
  titre: string;
  unite?: string;
  largeur: number;
  valeur: (l: LigneTableau) => string | number;
}

export function libelleFace(face: FaceBeton): string {
  const pos = libelle(POSITIONS_FACE, face.position);
  return face.repere ? `${pos} (${face.repere})` : pos;
}

const fmt = (v: number) => Math.round(v * 10) / 10;

export const COLONNES_SYNTHESE: ColonneSynthese[] = [
  { cle: 'element', titre: 'Élément', largeur: 28, valeur: (l) => l.element.nom },
  { cle: 'face', titre: 'Face', largeur: 20, valeur: (l) => libelleFace(l.face) },
  { cle: 'type', titre: 'Type', largeur: 16, valeur: (l) => libelleType(l.element) },
  {
    cle: 'classes',
    titre: 'Classes d’exposition',
    largeur: 22,
    valeur: (l) => l.resultat.classesExposition.join(', '),
  },
  {
    cle: 'categorie',
    titre: 'Catégorie DNA W.1',
    largeur: 12,
    valeur: (l) => l.resultat.categorieRetenue?.code ?? 'sur étude',
  },
  { cle: 'resistance', titre: 'Classe de résistance', largeur: 13, valeur: (l) => l.face.classeResistance ?? '–' },
  {
    cle: 'structurale',
    titre: 'Classe structurale',
    largeur: 11,
    valeur: (l) => `S${l.resultat.enrobage.classeStructurale} (${l.resultat.enrobage.classeDeterminante})`,
  },
  { cle: 'cminb', titre: 'cmin,b', unite: 'mm', largeur: 9, valeur: (l) => fmt(l.resultat.enrobage.cminB) },
  { cle: 'cmindur', titre: 'cmin,dur', unite: 'mm', largeur: 9, valeur: (l) => fmt(l.resultat.enrobage.cminDur) },
  { cle: 'dcdev', titre: 'Δcdev', unite: 'mm', largeur: 8, valeur: (l) => fmt(l.resultat.enrobage.deltaCDev) },
  { cle: 'cnom', titre: 'cnom retenu', unite: 'mm', largeur: 11, valeur: (l) => fmt(l.resultat.enrobage.cnomRetenu) },
];

export function titreColonne(c: ColonneSynthese): string {
  return c.unite ? `${c.titre} (${c.unite})` : c.titre;
}
