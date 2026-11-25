/**
 * Parametres determines au niveau national (NDP) de l'EN 1992-1-1 utilises par le moteur.
 *
 * Deux jeux :
 * - 'EN' : valeurs recommandees par l'EN 1992-1-1:2004 (notes des clauses citees) ;
 * - 'LU' : annexe nationale luxembourgeoise. Les valeurs de l'ANL n'ont pas pu etre
 *   verifiees sur le texte : chaque valeur reprend la valeur recommandee et porte
 *   la mention A VERIFIER ANL. Ne pas modifier sans la clause source.
 *
 * Aucun extrait de norme n'est reproduit ici : seules les valeurs numeriques figurent.
 */

import type { ClasseEnrobage, JeuParametres } from './types';

/** Valeurs de cmin,dur (mm) pour S1 a S6, index 0 = S1. */
export type LigneCminDur = readonly [number, number, number, number, number, number];

export interface ParametresNationaux {
  id: JeuParametres;
  libelle: string;
  source: string;
  /** EN 1992-1-1 4.4.1.2(5), tableau 4.4N : cmin,dur (armatures de beton arme). */
  cminDur: Record<ClasseEnrobage, LigneCminDur>;
  /** EN 1992-1-1 4.4.1.2(5), note : classe structurale de base pour 50 ans. */
  classeStructuraleBase: number;
  /** Tableau 4.3N : majoration pour une duree d'utilisation de projet de 100 ans. */
  majorationDuree100: number;
  /** Tableau 4.3N : classe de resistance a partir de laquelle la minoration s'applique. */
  seuilResistance: Record<ClasseEnrobage, string>;
  /** Tableau 4.3N : minorations (valeurs positives, retranchees). */
  minorationResistance: number;
  minorationDalle: number;
  minorationQualite: number;
  /** 4.4.1.2(6), (7), (8) : valeurs par defaut de Delta c_dur,gamma / ,st / ,add (mm). */
  deltaCDurGamma: number;
  deltaCDurSt: number;
  deltaCDurAdd: number;
  /** 4.4.1.2(11) : majoration minimale pour surface irreguliere (mm). */
  majorationSurfaceIrreguliere: number;
  /** 4.4.1.2(13) : k1, k2, k3 pour XM1, XM2, XM3 (mm). */
  abrasion: { XM1: number; XM2: number; XM3: number };
  /** 4.4.1.3(1)P et (3) : Delta c_dev (mm). */
  deltaCDev: {
    standard: number;
    assuranceQualite: { min: number; max: number };
    mesureRejet: { min: number; max: number };
  };
  /** 4.4.1.3(4) : k1 (contre terrain prepare ou beton de proprete), k2 (contre le sol), mm. */
  contreTerrain: { prepare: number; sol: number };
}

const RECOMMANDEES: Omit<ParametresNationaux, 'id' | 'libelle' | 'source'> = {
  // EN 1992-1-1 tableau 4.4N (valeurs recommandees)
  cminDur: {
    X0: [10, 10, 10, 10, 15, 20],
    XC1: [10, 10, 10, 15, 20, 25],
    XC2: [10, 15, 20, 25, 30, 35],
    XC3: [10, 15, 20, 25, 30, 35],
    XC4: [15, 20, 25, 30, 35, 40],
    XD1: [20, 25, 30, 35, 40, 45],
    XD2: [25, 30, 35, 40, 45, 50],
    XD3: [30, 35, 40, 45, 50, 55],
  },
  // EN 1992-1-1 4.4.1.2(5) note : S4 pour 50 ans
  classeStructuraleBase: 4,
  // EN 1992-1-1 tableau 4.3N
  majorationDuree100: 2,
  seuilResistance: {
    X0: 'C30/37',
    XC1: 'C30/37',
    XC2: 'C35/45',
    XC3: 'C35/45',
    XC4: 'C40/50',
    XD1: 'C40/50',
    XD2: 'C40/50',
    XD3: 'C45/55',
  },
  minorationResistance: 1,
  minorationDalle: 1,
  minorationQualite: 1,
  // EN 1992-1-1 4.4.1.2(6), (7), (8) : 0 mm recommande
  deltaCDurGamma: 0,
  deltaCDurSt: 0,
  deltaCDurAdd: 0,
  // EN 1992-1-1 4.4.1.2(11) : au moins 5 mm
  majorationSurfaceIrreguliere: 5,
  // EN 1992-1-1 4.4.1.2(13) : k1 = 5, k2 = 10, k3 = 15 mm recommandes
  abrasion: { XM1: 5, XM2: 10, XM3: 15 },
  // EN 1992-1-1 4.4.1.3(1)P note et 4.4.1.3(3)
  deltaCDev: {
    standard: 10,
    assuranceQualite: { min: 5, max: 10 },
    mesureRejet: { min: 0, max: 10 },
  },
  // EN 1992-1-1 4.4.1.3(4) : k1 = 40 mm, k2 = 75 mm recommandes
  contreTerrain: { prepare: 40, sol: 75 },
};

export const PARAMETRES_EN: ParametresNationaux = {
  id: 'EN',
  libelle: 'Valeurs recommandées EN 1992-1-1',
  source: 'EN 1992-1-1:2004+A1:2014, notes des clauses 4.4.1.2 et 4.4.1.3',
  ...RECOMMANDEES,
};

export const PARAMETRES_LU: ParametresNationaux = {
  id: 'LU',
  libelle: 'Annexe nationale luxembourgeoise (ANL)',
  source: 'EN 1992-1-1 ANL Luxembourg : valeurs recommandées reprises, à vérifier sur le texte de l’ANL',
  // A VERIFIER ANL : tableau 4.4N
  cminDur: { ...RECOMMANDEES.cminDur },
  // A VERIFIER ANL : classe structurale de base
  classeStructuraleBase: RECOMMANDEES.classeStructuraleBase,
  // A VERIFIER ANL : tableau 4.3N (modulations et seuils de resistance)
  majorationDuree100: RECOMMANDEES.majorationDuree100,
  seuilResistance: { ...RECOMMANDEES.seuilResistance }, // A VERIFIER ANL
  minorationResistance: RECOMMANDEES.minorationResistance, // A VERIFIER ANL
  minorationDalle: RECOMMANDEES.minorationDalle, // A VERIFIER ANL
  minorationQualite: RECOMMANDEES.minorationQualite, // A VERIFIER ANL
  deltaCDurGamma: RECOMMANDEES.deltaCDurGamma, // A VERIFIER ANL
  deltaCDurSt: RECOMMANDEES.deltaCDurSt, // A VERIFIER ANL
  deltaCDurAdd: RECOMMANDEES.deltaCDurAdd, // A VERIFIER ANL
  majorationSurfaceIrreguliere: RECOMMANDEES.majorationSurfaceIrreguliere,
  abrasion: { ...RECOMMANDEES.abrasion }, // A VERIFIER ANL
  deltaCDev: { ...RECOMMANDEES.deltaCDev }, // A VERIFIER ANL
  contreTerrain: { ...RECOMMANDEES.contreTerrain }, // A VERIFIER ANL
};

export const JEUX_PARAMETRES: Record<JeuParametres, ParametresNationaux> = {
  EN: PARAMETRES_EN,
  LU: PARAMETRES_LU,
};

export function parametres(jeu: JeuParametres): ParametresNationaux {
  return JEUX_PARAMETRES[jeu] ?? PARAMETRES_EN;
}
