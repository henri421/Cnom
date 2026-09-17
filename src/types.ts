/**
 * Types pour le calcul d'enrobage selon EN 1992-1-1 et EN 206 (Annexe ILNAS / DNA W.1)
 */

export type ClasseXC = 'XC1' | 'XC2' | 'XC3' | 'XC4';
export type ClasseXD = 'XD1' | 'XD2' | 'XD3';
export type ClasseXF = 'XF1' | 'XF2' | 'XF3' | 'XF4';
export type ClasseXA = 'XA1' | 'XA2c' | 'XA3c';
export type ClasseExposition = 'X0' | ClasseXC | ClasseXD | ClasseXF | ClasseXA;

export type TypeElement = 'voile' | 'dalle';

export type FrequenceSalage = 'peu_frequent' | 'frequent' | 'tres_frequent';
export type ZoneGel = 'faible_modere' | 'severe';

export type AmbianceXC =
  | 'interieur_sec'       // XC1 : sec ou humidité faible en permanence
  | 'enterree_ou_eau'     // XC2 : humide en permanence, fondations, enterré
  | 'exterieur_abrite'    // XC3 : humidité modérée, extérieur abrité de la pluie
  | 'exterieur_non_abrite'// XC4 : alternance humidité/séchage, extérieur exposé pluie
  | 'interieur_humide';   // XC3 : intérieur à forte humidité (buanderie, cuisine pro)

export interface ReponsesRisque {
  // -- Famille XC (Carbonatation) --
  ambianceXC: AmbianceXC;

  // -- Famille XD (Chlorures hors marine) --
  concerneParChlorures: boolean;
  distanceChausseeSaleeM: number | null; // distance à la voirie salée
  salageRoute: FrequenceSalage | null;
  applicationDirecteSelSurFace: boolean; // ex: dalle/marche salée directement

  // -- Famille XF (Gel / Dégel) --
  exposeAuGel: boolean;
  zoneGel: ZoneGel | null;
  presenceAgentDeverglacage: boolean;
  saturationForteEau: boolean; // surfaces horizontales stagnantes

  // -- Famille XA (Attaque chimique) --
  concerneParAgressiviteChimique: boolean;
  so4EauMgL: number | null; // Teneur en sulfates de l'eau (mg/l)
  so4SolMgKg: number | null; // Teneur en sulfates du sol (mg/kg)
  autreAgressiviteChimiqueForte: boolean; // acides, lisier, effluents
}

export interface ElementBeton {
  id: string;
  nom: string;
  typeElement: TypeElement;
  dureeUtilisationProjet: 50 | 100;
  diametreBarreMm: number;
  classeResistancePrevue?: string; // ex: C25/30, C30/37, C35/45
  qualiteControleSpeciale: boolean; // contrôle qualité continu de production (-1 classe)
  deltaCDevMm: number; // marge tolérance par défaut 10 mm
  reponses: ReponsesRisque;
}

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

export interface ResultatEnrobage {
  cminB: number;
  cminDur: number;
  cmin: number;
  deltaCDev: number;
  cnom: number;
  classeDeterminante: ClasseExposition;
}

export interface ModificateursStructuraux {
  base: number;
  modificateurDuree: number;
  modificateurResistance: number;
  modificateurGeometrie: number;
  modificateurControle: number;
  classeFinale: number;
  justification: string[];
}

export interface ResultatCalculElement {
  elementId: string;
  resultatXC: ResultatClasse<ClasseXC>;
  resultatXD: ResultatClasse<ClasseXD>;
  resultatXF: ResultatClasse<ClasseXF>;
  resultatXA: ResultatClasse<ClasseXA>;
  toutesClassesRequises: ClasseExposition[];
  categoriesCompatibles: CategorieBeton[];
  categorieOptimale: CategorieBeton | null;
  fckRecommandees: string[];
  modificateurs: ModificateursStructuraux;
  enrobage: ResultatEnrobage;
}

export interface ProjetCalcul {
  titre: string;
  referenceProjet: string;
  auteur: string;
  date: string;
  elements: ElementBeton[];
}
