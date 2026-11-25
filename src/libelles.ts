/**
 * Libelles et textes d'aide de l'interface et des exports.
 * Les aides resument le critere normatif avec un exemple ; elles ne recopient pas la norme.
 */

import type {
  AmbianceXC,
  ClasseAbrasion,
  ContreTerrain,
  ElementBeton,
  ModeChlorures,
  NiveauDeltaCDev,
  PositionFace,
  TypeElement,
} from './types';

export interface Option<T extends string> {
  valeur: T;
  libelle: string;
  aide?: string;
}

export const TYPES_ELEMENT: Option<TypeElement>[] = [
  { valeur: 'dalle', libelle: 'Dalle' },
  { valeur: 'poutre', libelle: 'Poutre' },
  { valeur: 'poteau', libelle: 'Poteau' },
  { valeur: 'voile', libelle: 'Voile' },
  { valeur: 'radier', libelle: 'Radier' },
  { valeur: 'semelle', libelle: 'Semelle' },
  { valeur: 'longrine', libelle: 'Longrine' },
  { valeur: 'mur_soutenement', libelle: 'Mur de soutènement' },
  { valeur: 'escalier', libelle: 'Escalier' },
  { valeur: 'balcon', libelle: 'Balcon' },
  { valeur: 'autre', libelle: 'Autre' },
];

export const POSITIONS_FACE: Option<PositionFace>[] = [
  { valeur: 'superieure', libelle: 'Supérieure' },
  { valeur: 'inferieure', libelle: 'Inférieure' },
  { valeur: 'interieure', libelle: 'Intérieure' },
  { valeur: 'exterieure', libelle: 'Extérieure' },
  { valeur: 'contre_terre', libelle: 'Contre terre' },
  { valeur: 'coffree', libelle: 'Coffrée' },
  { valeur: 'libre', libelle: 'Libre' },
];

export const AMBIANCES_XC: Option<AmbianceXC>[] = [
  {
    valeur: 'interieur_sec',
    libelle: 'Intérieur sec → XC1',
    aide: 'Faible humidité de l’air. Ex. : bureaux, logements chauffés.',
  },
  {
    valeur: 'immerge_permanent',
    libelle: 'Immergé en permanence → XC1',
    aide: 'Humide en permanence, sans alternance. Ex. : partie toujours noyée d’un bassin.',
  },
  {
    valeur: 'enterree_ou_eau',
    libelle: 'Humide, rarement sec → XC2',
    aide: 'Contact de longue durée avec l’eau. Ex. : la plupart des fondations, faces enterrées.',
  },
  {
    valeur: 'interieur_humide',
    libelle: 'Intérieur humide → XC3',
    aide: 'Humidité de l’air modérée ou élevée. Ex. : buanderie, cuisine collective, parking couvert ventilé.',
  },
  {
    valeur: 'exterieur_abrite',
    libelle: 'Extérieur abrité de la pluie → XC3',
    aide: 'Ex. : sous-face d’auvent, coursive couverte.',
  },
  {
    valeur: 'exterieur_non_abrite',
    libelle: 'Extérieur exposé à la pluie → XC4',
    aide: 'Alternance d’humidité et de séchage. Ex. : façade, acrotère, balcon non abrité.',
  },
];

export const MODES_XD: Option<ModeChlorures>[] = [
  {
    valeur: 'aerosols',
    libelle: 'Chlorures aériens, humidité modérée → XD1',
    aide: 'Ex. : surfaces verticales à proximité d’une voirie salée, exposées aux embruns de sel.',
  },
  {
    valeur: 'humide',
    libelle: 'Humide, rarement sec → XD2',
    aide: 'Ex. : piscines, éléments en contact avec des eaux industrielles chlorurées.',
  },
  {
    valeur: 'cycles',
    libelle: 'Alternance humidité/séchage → XD3',
    aide: 'Ex. : dalles et rampes de parking, chaussées, éléments soumis aux projections directes d’eau salée.',
  },
];

export const ABRASIONS: Option<ClasseAbrasion>[] = [
  { valeur: 'aucune', libelle: 'Aucune' },
  { valeur: 'XM1', libelle: 'XM1 (k1)', aide: 'Abrasion modérée. Ex. : sol industriel, véhicules sur pneus.' },
  { valeur: 'XM2', libelle: 'XM2 (k2)', aide: 'Abrasion importante. Ex. : chariots élévateurs sur pneus pleins.' },
  { valeur: 'XM3', libelle: 'XM3 (k3)', aide: 'Abrasion extrême. Ex. : chariots à bandages, véhicules à chenilles.' },
];

export const CONTRE_TERRAIN: Option<ContreTerrain>[] = [
  { valeur: 'non', libelle: 'Non (coffré)' },
  {
    valeur: 'prepare',
    libelle: 'Terrain préparé / béton de propreté (k1)',
    aide: 'cnom au moins égal à k1 (40 mm recommandé). Ex. : radier sur béton de propreté.',
  },
  {
    valeur: 'sol',
    libelle: 'Directement contre le sol (k2)',
    aide: 'cnom au moins égal à k2 (75 mm recommandé). Ex. : semelle coulée en pleine fouille.',
  },
];

export const NIVEAUX_DCDEV: Option<NiveauDeltaCDev>[] = [
  {
    valeur: 'standard',
    libelle: 'Standard : 10 mm',
    aide: 'Valeur recommandée sans disposition particulière de contrôle (4.4.1.3(1)P).',
  },
  {
    valeur: 'assurance_qualite',
    libelle: 'Assurance qualité avec mesure des enrobages : 5 à 10 mm',
    aide: 'Système d’assurance de la qualité incluant la mesure des enrobages (4.4.1.3(3)).',
  },
  {
    valeur: 'mesure_rejet',
    libelle: 'Mesure fiable et rejet des éléments non conformes : 0 à 10 mm',
    aide: 'Appareil de mesure fiable et rejet des éléments non conformes, ex. préfabrication (4.4.1.3(3)).',
  },
];

export function libelle<T extends string>(options: Option<T>[], valeur: T): string {
  return options.find((o) => o.valeur === valeur)?.libelle ?? valeur;
}

export function libelleType(el: Pick<ElementBeton, 'typeElement' | 'typeAutre'>): string {
  if (el.typeElement === 'autre') return el.typeAutre.trim() || 'Autre';
  return libelle(TYPES_ELEMENT, el.typeElement);
}
