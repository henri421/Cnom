/**
 * Migration versionnee des projets enregistres (localStorage ou fichier JSON).
 *
 * v1 : tableau d'ElementBetonV1, un enregistrement par face, sous la cle
 *      'enrobage_ec2_project_v1' (ou objet { titre, ..., elements: [...] }).
 * v2 : ProjetCnom { version: 2, ..., elements: [{ ..., faces: [...] }] }.
 *
 * Les donnees saisies sont conservees ; seuls les resultats peuvent changer,
 * du fait des corrections normatives du moteur v2.
 */

import type { ElementBetonV1 } from './legacy/types-v1';
import { creerProjetVide, nouvelId } from './modele';
import {
  AmbianceXC,
  ElementBeton,
  FaceBeton,
  JeuParametres,
  ModeChlorures,
  NiveauDeltaCDev,
  PositionFace,
  ProjetCnom,
  VERSION_PROJET,
} from './types';

export const CLE_STOCKAGE = 'cnom_projet';
export const CLE_STOCKAGE_V1 = 'enrobage_ec2_project_v1';

const AMBIANCES_V1: AmbianceXC[] = [
  'interieur_sec',
  'enterree_ou_eau',
  'exterieur_abrite',
  'exterieur_non_abrite',
  'interieur_humide',
];

function estObjet(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function nombreOuNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function positionDepuisAmbiance(ambiance: AmbianceXC): PositionFace {
  if (ambiance === 'enterree_ou_eau') return 'contre_terre';
  if (ambiance.startsWith('interieur')) return 'interieure';
  return 'exterieure';
}

function niveauDepuisValeur(valeur: number): NiveauDeltaCDev {
  if (valeur >= 10) return 'standard';
  if (valeur >= 5) return 'assurance_qualite';
  return 'mesure_rejet';
}

/** Convertit un enregistrement v1 (une face) en element v2 a une face. */
export function migrerElementV1(ancien: ElementBetonV1): ElementBeton {
  const r = ancien.reponses ?? ({} as ElementBetonV1['reponses']);
  const ambiance: AmbianceXC = AMBIANCES_V1.includes(r.ambianceXC)
    ? r.ambianceXC
    : 'interieur_sec';

  // XD : l'ancien arbre (distance a la chaussee et frequence de salage) est
  // traduit dans le mode d'exposition qui redonne la meme classe.
  const salage = r.salageRoute || 'peu_frequent';
  let mode: ModeChlorures = 'aerosols';
  if (r.applicationDirecteSelSurFace) mode = 'cycles';
  else if (r.distanceChausseeSaleeM !== null && r.distanceChausseeSaleeM <= 6 && salage !== 'peu_frequent') {
    mode = 'cycles';
  }

  const deltaCDevMm = typeof ancien.deltaCDevMm === 'number' ? ancien.deltaCDevMm : 10;

  const face: FaceBeton = {
    id: nouvelId('face'),
    position: positionDepuisAmbiance(ambiance),
    repere: '',
    exposition: {
      xc: { actif: true, ambiance },
      xd: { actif: !!r.concerneParChlorures, mode },
      xf: {
        actif: !!r.exposeAuGel,
        saturation: r.zoneGel === 'severe' || r.saturationForteEau ? 'forte' : 'moderee',
        deverglacage: !!r.presenceAgentDeverglacage,
      },
      xa: {
        actif: !!r.concerneParAgressiviteChimique,
        so4EauMgL: nombreOuNull(r.so4EauMgL),
        so4SolMgKg: nombreOuNull(r.so4SolMgKg),
        autreForte: !!r.autreAgressiviteChimiqueForte,
      },
    },
    categorieDna: null,
    classeResistance: ancien.classeResistancePrevue ?? null,
    dureeUtilisation: ancien.dureeUtilisationProjet === 100 ? 100 : 50,
    // En v1, le type 'dalle' imposait la minoration de geometrie : on la conserve
    // comme reponse explicite.
    assimilableDalle: ancien.typeElement === 'dalle',
    maitriseQualite: !!ancien.qualiteControleSpeciale,
    diametreBarreMm: typeof ancien.diametreBarreMm === 'number' ? ancien.diametreBarreMm : 12,
    nombreBarresPaquet: 1,
    dmaxMm: 22,
    betonnageContreTerrain: 'non',
    surfaceIrreguliere: false,
    abrasion: 'aucune',
    deltaCDurGammaMm: 0,
    deltaCDurStMm: 0,
    deltaCDurAddMm: 0,
    deltaCDev: { niveau: niveauDepuisValeur(deltaCDevMm), valeurMm: deltaCDevMm },
    arrondi5mm: false,
  };

  return {
    id: typeof ancien.id === 'string' && ancien.id ? ancien.id : nouvelId('elem'),
    nom: ancien.nom ?? '',
    typeElement: ancien.typeElement === 'dalle' ? 'dalle' : 'voile',
    typeAutre: '',
    faces: [face],
  };
}

function migrerV1(elementsV1: unknown[], entete?: Record<string, unknown>): ProjetCnom {
  const projet = creerProjetVide();
  if (entete) {
    if (typeof entete.titre === 'string') projet.titre = entete.titre;
    if (typeof entete.referenceProjet === 'string') projet.referenceProjet = entete.referenceProjet;
    if (typeof entete.auteur === 'string') projet.auteur = entete.auteur;
    if (typeof entete.date === 'string') projet.date = entete.date;
  }
  projet.elements = elementsV1.filter(estObjet).map((e) => migrerElementV1(e as unknown as ElementBetonV1));
  return projet;
}

/**
 * Relit un projet de n'importe quelle version connue.
 * Renvoie null si la donnee n'est pas reconnue.
 */
export function migrerProjet(brut: unknown): ProjetCnom | null {
  if (Array.isArray(brut)) return migrerV1(brut);
  if (!estObjet(brut)) return null;

  const version = brut.version;
  if (version === VERSION_PROJET && Array.isArray(brut.elements)) {
    const vide = creerProjetVide();
    const jeu: JeuParametres = brut.jeuParametres === 'LU' ? 'LU' : 'EN';
    return {
      ...vide,
      ...(brut as unknown as ProjetCnom),
      version: VERSION_PROJET,
      jeuParametres: jeu,
    };
  }
  if (version === undefined && Array.isArray(brut.elements)) {
    // Objet ProjetCalcul v1
    return migrerV1(brut.elements, brut);
  }
  return null;
}

/** Lecture depuis le stockage local, avec reprise de l'ancienne cle v1. */
export function chargerDepuisStockage(stockage: Pick<Storage, 'getItem'>): ProjetCnom | null {
  try {
    const v2 = stockage.getItem(CLE_STOCKAGE);
    if (v2) {
      const projet = migrerProjet(JSON.parse(v2));
      if (projet) return projet;
    }
    const v1 = stockage.getItem(CLE_STOCKAGE_V1);
    if (v1) return migrerProjet(JSON.parse(v1));
  } catch {
    // donnee illisible : on repart du projet exemple
  }
  return null;
}
