/**
 * Modele de donnees (version 2) : projet -> elements -> faces.
 * Une ligne du tableau de projet correspond a une face.
 *
 * References : EN 206 (classes d'exposition, tableau DNA W.1 de l'annexe ILNAS),
 * EN 1992-1-1 (tableau 4.3N, tableau 4.4N, clause 4.4.1).
 */

// ---------------------------------------------------------------------------
// Classes d'exposition
// ---------------------------------------------------------------------------

export type ClasseXC = 'XC1' | 'XC2' | 'XC3' | 'XC4';
export type ClasseXD = 'XD1' | 'XD2' | 'XD3';
export type ClasseXF = 'XF1' | 'XF2' | 'XF3' | 'XF4';
export type ClasseXA = 'XA1' | 'XA2c' | 'XA3c';
export type ClasseExposition = 'X0' | ClasseXC | ClasseXD | ClasseXF | ClasseXA;

/** Classes pour lesquelles le tableau 4.4N definit cmin,dur (hors XS, sans objet au Luxembourg). */
export type ClasseEnrobage = 'X0' | ClasseXC | ClasseXD;

// ---------------------------------------------------------------------------
// Identification
// ---------------------------------------------------------------------------

export type TypeElement =
  | 'dalle'
  | 'poutre'
  | 'poteau'
  | 'voile'
  | 'radier'
  | 'semelle'
  | 'longrine'
  | 'mur_soutenement'
  | 'escalier'
  | 'balcon'
  | 'autre';

export type PositionFace =
  | 'superieure'
  | 'inferieure'
  | 'interieure'
  | 'exterieure'
  | 'contre_terre'
  | 'coffree'
  | 'libre';

// ---------------------------------------------------------------------------
// Exposition (familles cochables, EN 206 tableau 1 et tableau 2)
// ---------------------------------------------------------------------------

export type AmbianceXC =
  | 'interieur_sec' // XC1 : sec
  | 'immerge_permanent' // XC1 : humide en permanence (immerge)
  | 'enterree_ou_eau' // XC2 : humide, rarement sec (contact de longue duree avec l'eau)
  | 'interieur_humide' // XC3 : humidite moderee, interieur a humidite elevee
  | 'exterieur_abrite' // XC3 : exterieur abrite de la pluie
  | 'exterieur_non_abrite'; // XC4 : alternance d'humidite et de sechage

/** XD1 : humidite moderee ; XD2 : humide, rarement sec ; XD3 : alternance humidite/sechage. */
export type ModeChlorures = 'aerosols' | 'humide' | 'cycles';

export type SaturationXF = 'moderee' | 'forte';

export interface ExpositionXC {
  actif: boolean;
  ambiance: AmbianceXC;
}

export interface ExpositionXD {
  actif: boolean;
  mode: ModeChlorures;
}

export interface ExpositionXF {
  actif: boolean;
  saturation: SaturationXF;
  deverglacage: boolean;
}

export interface ExpositionXA {
  actif: boolean;
  so4EauMgL: number | null;
  so4SolMgKg: number | null;
  /** Autre agressivite forte constatee (acide, lisier, effluents...) */
  autreForte: boolean;
}

export interface ExpositionFace {
  xc: ExpositionXC;
  xd: ExpositionXD;
  xf: ExpositionXF;
  xa: ExpositionXA;
}

// ---------------------------------------------------------------------------
// Enrobage
// ---------------------------------------------------------------------------

/** Betonnage contre terrain, EN 1992-1-1 4.4.1.3(4). */
export type ContreTerrain = 'non' | 'prepare' | 'sol';

/** Classe d'abrasion, EN 1992-1-1 4.4.1.2(13). */
export type ClasseAbrasion = 'aucune' | 'XM1' | 'XM2' | 'XM3';

/** Niveau de tolerance d'execution, EN 1992-1-1 4.4.1.3(1)P et (3). */
export type NiveauDeltaCDev = 'standard' | 'assurance_qualite' | 'mesure_rejet';

export interface DeltaCDev {
  niveau: NiveauDeltaCDev;
  valeurMm: number;
}

// ---------------------------------------------------------------------------
// Face, element, projet
// ---------------------------------------------------------------------------

export interface FaceBeton {
  id: string;
  position: PositionFace;
  /** Precision libre (axe, niveau, zone...) */
  repere: string;

  exposition: ExpositionFace;

  /** Categorie DNA W.1 imposee ; null = categorie proposee automatiquement. */
  categorieDna: string | null;
  /** Classe de resistance choisie, ex. 'C30/37' ; null = non choisie. */
  classeResistance: string | null;

  // Tableau 4.3N
  dureeUtilisation: 50 | 100;
  assimilableDalle: boolean;
  maitriseQualite: boolean;

  // Enrobage
  diametreBarreMm: number;
  /** 1 = barre isolee ; >1 = paquet de nb barres (diametre equivalent, 8.9.1). */
  nombreBarresPaquet: number;
  dmaxMm: number;
  betonnageContreTerrain: ContreTerrain;
  surfaceIrreguliere: boolean;
  abrasion: ClasseAbrasion;
  deltaCDurGammaMm: number;
  deltaCDurStMm: number;
  deltaCDurAddMm: number;
  deltaCDev: DeltaCDev;
  arrondi5mm: boolean;
}

export interface ElementBeton {
  id: string;
  nom: string;
  typeElement: TypeElement;
  /** Libelle libre lorsque typeElement = 'autre'. */
  typeAutre: string;
  faces: FaceBeton[];
}

export type JeuParametres = 'EN' | 'LU';

export const VERSION_PROJET = 2 as const;

export interface ProjetCnom {
  version: typeof VERSION_PROJET;
  titre: string;
  referenceProjet: string;
  auteur: string;
  date: string;
  jeuParametres: JeuParametres;
  elements: ElementBeton[];
}

// ---------------------------------------------------------------------------
// Resultats du moteur
// ---------------------------------------------------------------------------

export interface CategorieBeton {
  code: string;
  description: string;
  classesCouvertes: Set<ClasseExposition>;
  fckPossibles: string[];
  ordre: number;
}

export interface ResultatClasse<T extends string> {
  classe: T | null;
  justification: string;
  normeRef: string;
}

export type CodeModificateur = 'duree100' | 'resistance' | 'dalle' | 'qualite';

export interface ModificateurStructural {
  code: CodeModificateur;
  libelle: string;
  explication: string;
  reference: string;
  /** Valeur appliquee si actif (+2 ou -1). */
  valeur: number;
  actif: boolean;
}

export interface ClasseStructuraleExposition {
  classe: ClasseEnrobage;
  base: number;
  modificateurs: ModificateurStructural[];
  brute: number;
  retenue: number;
  seuilResistance: string;
  cminDur: number;
}

export type CritereCmin = 'cmin,b' | 'cmin,dur' | '10 mm';

export interface ResultatEnrobage {
  diametreEquivalentMm: number;
  majorationDmaxMm: number;
  cminB: number;
  classeDeterminante: ClasseEnrobage;
  classeStructurale: number;
  cminDur: number;
  deltaCDurGamma: number;
  deltaCDurSt: number;
  deltaCDurAdd: number;
  cminDurCorrige: number;
  cmin: number;
  critereCmin: CritereCmin;
  majorationSurfaceMm: number;
  majorationAbrasionMm: number;
  cminMajore: number;
  deltaCDev: number;
  cnomCalcule: number;
  minimumContreTerrainMm: number | null;
  contreTerrainGouverne: boolean;
  cnomBrut: number;
  arrondi: boolean;
  cnomRetenu: number;
}

export interface EtapeCheminement {
  titre: string;
  reference: string;
  lignes: string[];
}

export interface ResultatFace {
  elementId: string;
  faceId: string;
  resultatXC: ResultatClasse<ClasseXC>;
  resultatXD: ResultatClasse<ClasseXD>;
  resultatXF: ResultatClasse<ClasseXF>;
  resultatXA: ResultatClasse<ClasseXA>;
  /** Classes d'exposition retenues pour la face. */
  classesExposition: ClasseExposition[];
  /** Classes prises en compte pour cmin,dur (tableau 4.4N). */
  classesEnrobage: ClasseEnrobage[];
  categoriesCompatibles: CategorieBeton[];
  categorieProposee: CategorieBeton | null;
  categorieRetenue: CategorieBeton | null;
  categorieCompatible: boolean;
  classesResistanceCompatibles: string[];
  /** null si aucune classe de resistance n'est choisie. */
  resistanceCompatible: boolean | null;
  structurales: ClasseStructuraleExposition[];
  enrobage: ResultatEnrobage;
  avertissements: string[];
  cheminement: EtapeCheminement[];
}
