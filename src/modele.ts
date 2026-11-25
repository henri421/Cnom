/**
 * Fabriques du modele v2 : identifiants, face, element et projet par defaut,
 * duplications.
 */

import {
  ElementBeton,
  FaceBeton,
  PositionFace,
  ProjetCnom,
  TypeElement,
  VERSION_PROJET,
} from './types';

export function nouvelId(prefixe: string): string {
  return `${prefixe}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export function creerFaceParDefaut(position: PositionFace = 'exterieure'): FaceBeton {
  return {
    id: nouvelId('face'),
    position,
    repere: '',
    exposition: {
      xc: { actif: true, ambiance: 'exterieur_non_abrite' },
      xd: { actif: false, mode: 'aerosols' },
      xf: { actif: false, saturation: 'moderee', deverglacage: false },
      xa: { actif: false, so4EauMgL: null, so4SolMgKg: null, autreForte: false },
    },
    categorieDna: null,
    classeResistance: 'C30/37',
    dureeUtilisation: 50,
    assimilableDalle: false,
    maitriseQualite: false,
    diametreBarreMm: 12,
    nombreBarresPaquet: 1,
    dmaxMm: 22,
    betonnageContreTerrain: 'non',
    surfaceIrreguliere: false,
    abrasion: 'aucune',
    deltaCDurGammaMm: 0,
    deltaCDurStMm: 0,
    deltaCDurAddMm: 0,
    // EN 1992-1-1 4.4.1.3(1)P, note : valeur recommandee 10 mm
    deltaCDev: { niveau: 'standard', valeurMm: 10 },
    arrondi5mm: true,
  };
}

export function creerElementParDefaut(
  nom = 'Nouvel élément',
  typeElement: TypeElement = 'voile'
): ElementBeton {
  return {
    id: nouvelId('elem'),
    nom,
    typeElement,
    typeAutre: '',
    faces: [creerFaceParDefaut()],
  };
}

export function creerProjetVide(): ProjetCnom {
  return {
    version: VERSION_PROJET,
    titre: 'Note de calcul d’enrobage',
    referenceProjet: '',
    auteur: '',
    date: new Date().toISOString().substring(0, 10),
    jeuParametres: 'EN',
    elements: [],
  };
}

/** Copie profonde d'une face avec un nouvel identifiant. */
export function copierFace(face: FaceBeton): FaceBeton {
  const copie: FaceBeton = JSON.parse(JSON.stringify(face));
  copie.id = nouvelId('face');
  return copie;
}

/** Projet d'exemple affiche au premier lancement. */
export function creerProjetExemple(): ProjetCnom {
  const projet = creerProjetVide();
  projet.titre = 'Projet exemple';
  projet.referenceProjet = 'EX-01';

  const voile = creerElementParDefaut('Voile façade', 'voile');
  const ext = voile.faces[0];
  ext.position = 'exterieure';
  ext.exposition.xf = { actif: true, saturation: 'moderee', deverglacage: false };
  const int = creerFaceParDefaut('interieure');
  int.exposition.xc = { actif: true, ambiance: 'interieur_sec' };
  int.classeResistance = 'C30/37';
  voile.faces.push(int);

  const rampe = creerElementParDefaut('Dalle de rampe parking', 'dalle');
  const sup = rampe.faces[0];
  sup.position = 'superieure';
  sup.assimilableDalle = true;
  sup.diametreBarreMm = 14;
  sup.exposition.xd = { actif: true, mode: 'cycles' };
  sup.exposition.xf = { actif: true, saturation: 'forte', deverglacage: true };

  const radier = creerElementParDefaut('Radier', 'radier');
  const inf = radier.faces[0];
  inf.position = 'inferieure';
  inf.assimilableDalle = true;
  inf.exposition.xc = { actif: true, ambiance: 'enterree_ou_eau' };
  inf.betonnageContreTerrain = 'prepare';

  projet.elements = [voile, rampe, radier];
  return projet;
}
