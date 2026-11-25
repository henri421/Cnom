/**
 * Moteur de calcul : classes d'exposition, categorie de beton DNA W.1,
 * classe structurale et enrobage nominal d'une face.
 *
 * References :
 * - EN 206, tableaux 1 et 2 (classes d'exposition) ; annexe ILNAS, tableau DNA W.1 ;
 * - EN 1992-1-1, tableau 4.2 (cmin,b), tableau 4.3N (classe structurale),
 *   tableau 4.4N (cmin,dur), clauses 4.4.1.2 et 4.4.1.3 ; 8.9.1 (paquets).
 * Les parametres determines au niveau national sont dans parametres-nationaux.ts.
 */

import { ParametresNationaux, parametres } from './parametres-nationaux';
import {
  CategorieBeton,
  ClasseEnrobage,
  ClasseExposition,
  ClasseStructuraleExposition,
  ClasseXA,
  ClasseXC,
  ClasseXD,
  ClasseXF,
  CritereCmin,
  ElementBeton,
  EtapeCheminement,
  ExpositionFace,
  FaceBeton,
  JeuParametres,
  ModificateurStructural,
  ResultatClasse,
  ResultatEnrobage,
  ResultatFace,
} from './types';

// ============================================================================
// 1. TABLEAU DNA W.1 - CATEGORIES DE BETON (EN 206, annexe ILNAS)
//    Donnees reprises de la version 1 de l'application, a relire sur le tableau DNA W.1.
// ============================================================================

function categorie(
  code: string,
  ordre: number,
  description: string,
  classes: ClasseExposition[],
  fckPossibles: string[]
): CategorieBeton {
  return { code, ordre, description, classesCouvertes: new Set(classes), fckPossibles };
}

const CLASSES_CAT2: ClasseExposition[] = ['X0', 'XC1', 'XC2', 'XC3', 'XC4', 'XF1', 'XA1'];
const CLASSES_CAT3: ClasseExposition[] = [...CLASSES_CAT2, 'XD1', 'XD2', 'XF2', 'XF3', 'XA2c'];
const CLASSES_CAT4LP: ClasseExposition[] = [...CLASSES_CAT3, 'XD3', 'XF4'];
const CLASSES_CAT6: ClasseExposition[] = [...CLASSES_CAT3, 'XD3', 'XA3c'];

export const DNA_W1_CATEGORIES: Record<string, CategorieBeton> = {
  '0': categorie('0', 0, 'Béton non armé.', ['X0'], ['C12/15', 'C20/25']),
  '1': categorie(
    '1',
    1,
    "Béton armé à l'intérieur de bâtiments. Béton armé hors gel, contact à long terme avec l'eau (fondations).",
    ['X0', 'XC1', 'XC2'],
    ['C20/25', 'C25/30']
  ),
  '2': categorie(
    '2',
    2,
    "Béton armé intérieur avec taux d'humidité élevé. Béton armé extérieur, surfaces horizontales abritées de la pluie ou surfaces verticales. Faible agressivité chimique.",
    CLASSES_CAT2,
    ['C25/30', 'C30/37', '>=C35/45']
  ),
  '3': categorie(
    '3',
    3,
    'Béton armé extérieur, surfaces horizontales sans agents de déverglaçage, surfaces verticales avec agents de déverglaçage. Agressivité chimique modérée, SO4(2-) <= 600 mg/l (eau) ou <= 3000 mg/kg (sol).',
    CLASSES_CAT3,
    ['C30/37', '>=C35/45']
  ),
  '3HRS': categorie(
    '3HRS',
    4,
    'Identique à la catégorie 3 pour les classes d’exposition, mais pour SO4(2-) > 600 mg/l (eau) ou > 3000 mg/kg (sol) nécessitant un ciment HRS.',
    CLASSES_CAT3,
    ['C30/37', '>=C35/45']
  ),
  '4LP': categorie(
    '4LP',
    5,
    'Béton armé extérieur, surfaces horizontales avec agents de déverglaçage (application directe, voirie). Agressivité chimique modérée, SO4(2-) <= 600 mg/l (eau) ou <= 3000 mg/kg (sol).',
    CLASSES_CAT4LP,
    ['C30/37']
  ),
  '5': categorie(
    '5',
    6,
    "Béton armé à haute résistance à la pénétration de l'eau (cuvelage, cuves étanches). Faible agressivité chimique.",
    CLASSES_CAT2,
    ['C25/30', 'C30/37', '>=C35/45']
  ),
  '6': categorie(
    '6',
    7,
    'Béton armé extérieur, surfaces horizontales sans agents de déverglaçage, surfaces verticales avec agents de déverglaçage. Béton armé hors gel, présence de chlorures. Agressivité chimique forte (XA3c), SO4(2-) <= 600 mg/l (eau) ou <= 3000 mg/kg (sol).',
    CLASSES_CAT6,
    ['>=C35/45']
  ),
  '6HRS': categorie(
    '6HRS',
    8,
    'Identique à la catégorie 6 pour les classes d’exposition, mais avec SO4(2-) > 600 mg/l (eau) ou > 3000 mg/kg (sol) nécessitant un ciment HRS.',
    CLASSES_CAT6,
    ['>=C35/45']
  ),
};

/** Classes de resistance proposees a la saisie (EN 206, tableau 12). */
export const CLASSES_RESISTANCE = [
  'C12/15',
  'C16/20',
  'C20/25',
  'C25/30',
  'C30/37',
  'C35/45',
  'C40/50',
  'C45/55',
  'C50/60',
] as const;

/** Resistance caracteristique sur cylindre fck (MPa) d'une classe 'Cx/y' ; 0 si illisible. */
export function extraireFck(classe: string | null | undefined): number {
  if (!classe) return 0;
  const m = /C\s*(\d+)\s*\/\s*\d+/i.exec(classe);
  return m ? parseInt(m[1], 10) : 0;
}

/** Classes de resistance admises par une categorie DNA W.1 ('>=Cx/y' = cette classe et au-dela). */
export function classesResistanceCategorie(cat: CategorieBeton): string[] {
  const admises = new Set<string>();
  for (const entree of cat.fckPossibles) {
    if (entree.startsWith('>=')) {
      const min = extraireFck(entree);
      for (const c of CLASSES_RESISTANCE) if (extraireFck(c) >= min) admises.add(c);
    } else {
      admises.add(entree);
    }
  }
  return CLASSES_RESISTANCE.filter((c) => admises.has(c));
}

// ============================================================================
// 2. CLASSES D'EXPOSITION (EN 206, tableau 1 et tableau 2)
// ============================================================================

const REF_T1 = 'EN 206, tableau 1';

export function determinerClasseXC(expo: ExpositionFace): ResultatClasse<ClasseXC> {
  if (!expo.xc.actif) {
    return { classe: null, justification: 'Famille XC non cochée.', normeRef: REF_T1 };
  }
  switch (expo.xc.ambiance) {
    case 'immerge_permanent':
      return {
        classe: 'XC1',
        justification: 'Béton immergé en permanence dans l’eau : humide en permanence.',
        normeRef: `${REF_T1} (XC1)`,
      };
    case 'enterree_ou_eau':
      return {
        classe: 'XC2',
        justification:
          'Surface soumise à un contact de longue durée avec l’eau, humide et rarement sèche (la plupart des fondations, faces enterrées).',
        normeRef: `${REF_T1} (XC2)`,
      };
    case 'interieur_humide':
      return {
        classe: 'XC3',
        justification: 'Béton à l’intérieur de bâtiments à humidité de l’air modérée ou élevée : humidité modérée.',
        normeRef: `${REF_T1} (XC3)`,
      };
    case 'exterieur_abrite':
      return {
        classe: 'XC3',
        justification: 'Béton extérieur abrité de la pluie : humidité modérée.',
        normeRef: `${REF_T1} (XC3)`,
      };
    case 'exterieur_non_abrite':
      return {
        classe: 'XC4',
        justification:
          'Surface soumise au contact de l’eau sans relever de XC2 (extérieur non abrité de la pluie) : alternance d’humidité et de séchage.',
        normeRef: `${REF_T1} (XC4)`,
      };
    case 'interieur_sec':
    default:
      return {
        classe: 'XC1',
        justification: 'Béton à l’intérieur de bâtiments à faible humidité de l’air : sec.',
        normeRef: `${REF_T1} (XC1)`,
      };
  }
}

export function determinerClasseXD(expo: ExpositionFace): ResultatClasse<ClasseXD> {
  if (!expo.xd.actif) {
    return { classe: null, justification: 'Famille XD non cochée (pas de chlorures).', normeRef: REF_T1 };
  }
  switch (expo.xd.mode) {
    case 'cycles':
      return {
        classe: 'XD3',
        justification:
          'Alternance d’humidité et de séchage en présence de chlorures : projections directes, chaussées, dalles de parc de stationnement, rampes.',
        normeRef: `${REF_T1} (XD3)`,
      };
    case 'humide':
      return {
        classe: 'XD2',
        justification:
          'Humide, rarement sec, en présence de chlorures : piscines, éléments en contact avec des eaux industrielles chlorurées.',
        normeRef: `${REF_T1} (XD2)`,
      };
    case 'aerosols':
    default:
      return {
        classe: 'XD1',
        justification: 'Humidité modérée, surface exposée à des chlorures transportés par voie aérienne.',
        normeRef: `${REF_T1} (XD1)`,
      };
  }
}

export function determinerClasseXF(expo: ExpositionFace): ResultatClasse<ClasseXF> {
  if (!expo.xf.actif) {
    return { classe: null, justification: 'Famille XF non cochée (hors gel).', normeRef: REF_T1 };
  }
  const forte = expo.xf.saturation === 'forte';
  if (expo.xf.deverglacage) {
    return forte
      ? {
          classe: 'XF4',
          justification:
            'Forte saturation en eau avec agents de déverglaçage : surfaces de routes et tabliers exposées aux sels, surfaces soumises à des projections directes d’eau salée et au gel.',
          normeRef: `${REF_T1} (XF4)`,
        }
      : {
          classe: 'XF2',
          justification:
            'Saturation modérée en eau avec agents de déverglaçage : surfaces verticales d’ouvrages routiers exposées au gel et à l’air véhiculant des sels.',
          normeRef: `${REF_T1} (XF2)`,
        };
  }
  return forte
    ? {
        classe: 'XF3',
        justification: 'Forte saturation en eau sans agents de déverglaçage : surfaces horizontales exposées à la pluie et au gel.',
        normeRef: `${REF_T1} (XF3)`,
      }
    : {
        classe: 'XF1',
        justification: 'Saturation modérée en eau sans agents de déverglaçage : surfaces verticales exposées à la pluie et au gel.',
        normeRef: `${REF_T1} (XF1)`,
      };
}

/** Seuils SO4 : EN 206 tableau 2 (eau en mg/l, sol en mg/kg). */
export function determinerClasseXA(expo: ExpositionFace): ResultatClasse<ClasseXA> {
  const ref = 'EN 206, tableau 2';
  if (!expo.xa.actif) {
    return { classe: null, justification: 'Famille XA non cochée (milieu non agressif).', normeRef: ref };
  }
  if (expo.xa.autreForte) {
    return {
      classe: 'XA3c',
      justification: 'Agressivité chimique forte constatée (acidité, effluents, lisier, lixiviats).',
      normeRef: `${ref} (XA3)`,
    };
  }
  const eau = expo.xa.so4EauMgL ?? 0;
  const sol = expo.xa.so4SolMgKg ?? 0;
  if (eau > 3000 || sol > 12000) {
    return {
      classe: 'XA3c',
      justification: `SO4²⁻ eau = ${eau} mg/l (> 3000) ou sol = ${sol} mg/kg (> 12000) : environnement fortement agressif.`,
      normeRef: `${ref} (XA3)`,
    };
  }
  if (eau > 600 || sol > 3000) {
    return {
      classe: 'XA2c',
      justification: `SO4²⁻ eau = ${eau} mg/l (> 600) ou sol = ${sol} mg/kg (> 3000) : environnement modérément agressif.`,
      normeRef: `${ref} (XA2)`,
    };
  }
  if (eau >= 200 || sol >= 2000) {
    return {
      classe: 'XA1',
      justification: `SO4²⁻ eau = ${eau} mg/l (≥ 200) ou sol = ${sol} mg/kg (≥ 2000) : environnement faiblement agressif.`,
      normeRef: `${ref} (XA1)`,
    };
  }
  return {
    classe: null,
    justification: `Teneurs SO4²⁻ (eau ${eau} mg/l, sol ${sol} mg/kg) sous les seuils de XA1 : pas de classe XA.`,
    normeRef: ref,
  };
}

// ============================================================================
// 3. CATEGORIE DNA W.1
// ============================================================================

export function determinerCategoriesBeton(
  classes: ClasseExposition[],
  so4Eleve: boolean
): { compatibles: CategorieBeton[]; proposee: CategorieBeton | null } {
  const compatibles = Object.values(DNA_W1_CATEGORIES)
    .filter((cat) => cat.code !== '0') // categorie 0 : beton non arme
    .filter((cat) => classes.every((cl) => cat.classesCouvertes.has(cl)))
    .filter((cat) => !(so4Eleve && (cat.code === '3' || cat.code === '6')))
    .sort((a, b) => a.ordre - b.ordre);
  // Sans besoin HRS, la variante HRS reste compatible mais n'est pas proposee en premier.
  const proposee =
    compatibles.find((c) => so4Eleve || !c.code.endsWith('HRS')) ?? compatibles[0] ?? null;
  return { compatibles, proposee };
}

// ============================================================================
// 4. CLASSE STRUCTURALE (EN 1992-1-1, tableau 4.3N) PAR CLASSE D'EXPOSITION
// ============================================================================

export function calculerClasseStructurale(
  classe: ClasseEnrobage,
  face: Pick<FaceBeton, 'dureeUtilisation' | 'classeResistance' | 'assimilableDalle' | 'maitriseQualite'>,
  p: ParametresNationaux
): ClasseStructuraleExposition {
  const seuil = p.seuilResistance[classe];
  const fck = extraireFck(face.classeResistance);
  const resistanceOk = fck > 0 && fck >= extraireFck(seuil);

  const modificateurs: ModificateurStructural[] = [
    {
      code: 'duree100',
      libelle: 'Durée d’utilisation de projet de 100 ans',
      explication: 'Ouvrages à durée d’utilisation de 100 ans (catégorie 5 de l’EN 1990, ponts, ouvrages monumentaux).',
      reference: 'EN 1992-1-1, tableau 4.3N',
      valeur: +p.majorationDuree100,
      actif: face.dureeUtilisation === 100,
    },
    {
      code: 'resistance',
      libelle: `Classe de résistance ≥ ${seuil} (pour ${classe})`,
      explication: face.classeResistance
        ? `Classe choisie ${face.classeResistance} ${resistanceOk ? '≥' : '<'} ${seuil}.`
        : 'Aucune classe de résistance choisie : minoration non appliquée.',
      reference: 'EN 1992-1-1, tableau 4.3N',
      valeur: -p.minorationResistance,
      actif: resistanceOk,
    },
    {
      code: 'dalle',
      libelle: 'Élément assimilable à une dalle',
      explication:
        'Géométrie de dalle et position des armatures non affectée par le procédé de construction (réponse explicite de l’utilisateur).',
      reference: 'EN 1992-1-1, tableau 4.3N',
      valeur: -p.minorationDalle,
      actif: face.assimilableDalle,
    },
    {
      code: 'qualite',
      libelle: 'Maîtrise particulière de la qualité de production du béton',
      explication: 'Contrôle de la qualité de production du béton assuré de façon particulière.',
      reference: 'EN 1992-1-1, tableau 4.3N',
      valeur: -p.minorationQualite,
      actif: face.maitriseQualite,
    },
  ];

  const base = p.classeStructuraleBase;
  const brute = base + modificateurs.reduce((s, m) => s + (m.actif ? m.valeur : 0), 0);
  // Bornes S1 et S6 du tableau 4.4N
  const retenue = Math.max(1, Math.min(6, brute));
  return {
    classe,
    base,
    modificateurs,
    brute,
    retenue,
    seuilResistance: seuil,
    cminDur: p.cminDur[classe][retenue - 1],
  };
}

// ============================================================================
// 5. ENROBAGE NOMINAL (EN 1992-1-1, 4.4.1)
// ============================================================================

/** Diametre equivalent d'un paquet : phi_n = phi * racine(n_b), EN 1992-1-1 8.9.1(2). */
export function diametreEquivalent(diametreMm: number, nombreBarres: number): number {
  const nb = Math.max(1, Math.round(nombreBarres || 1));
  return nb === 1 ? diametreMm : Math.round(diametreMm * Math.sqrt(nb) * 10) / 10;
}

export function arrondiSuperieur5(valeur: number): number {
  return Math.ceil(valeur / 5 - 1e-9) * 5;
}

function bornerDeltaCDev(face: FaceBeton, p: ParametresNationaux): { valeur: number; ajustee: boolean } {
  const { niveau, valeurMm } = face.deltaCDev;
  if (niveau === 'standard') return { valeur: p.deltaCDev.standard, ajustee: valeurMm !== p.deltaCDev.standard };
  const plage = niveau === 'assurance_qualite' ? p.deltaCDev.assuranceQualite : p.deltaCDev.mesureRejet;
  const v = Number.isFinite(valeurMm) ? valeurMm : plage.max;
  const borne = Math.max(plage.min, Math.min(plage.max, v));
  return { valeur: borne, ajustee: borne !== v };
}

export function calculerEnrobage(
  face: FaceBeton,
  determinante: ClasseStructuraleExposition,
  p: ParametresNationaux
): ResultatEnrobage {
  // Tableau 4.2 : cmin,b = diametre (ou diametre equivalent), + 5 mm si Dmax > 32 mm
  const phiN = diametreEquivalent(face.diametreBarreMm, face.nombreBarresPaquet);
  const majorationDmaxMm = face.dmaxMm > 32 ? 5 : 0;
  const cminB = phiN + majorationDmaxMm;

  // Expression (4.2)
  const cminDur = determinante.cminDur;
  const cminDurCorrige = cminDur + face.deltaCDurGammaMm - face.deltaCDurStMm - face.deltaCDurAddMm;
  const cmin = Math.max(cminB, cminDurCorrige, 10);
  const critereCmin: CritereCmin = cmin === cminB ? 'cmin,b' : cmin === cminDurCorrige ? 'cmin,dur' : '10 mm';

  // 4.4.1.2(11) et (13)
  const majorationSurfaceMm = face.surfaceIrreguliere ? p.majorationSurfaceIrreguliere : 0;
  const majorationAbrasionMm = face.abrasion === 'aucune' ? 0 : p.abrasion[face.abrasion];
  const cminMajore = cmin + majorationSurfaceMm + majorationAbrasionMm;

  // 4.4.1.3 : cnom = cmin + Delta c_dev
  const deltaCDev = bornerDeltaCDev(face, p).valeur;
  const cnomCalcule = cminMajore + deltaCDev;

  // 4.4.1.3(4) : betonnage contre terrain (applique sur cnom, conformement au cahier des charges)
  const minimumContreTerrainMm =
    face.betonnageContreTerrain === 'prepare'
      ? p.contreTerrain.prepare
      : face.betonnageContreTerrain === 'sol'
        ? p.contreTerrain.sol
        : null;
  const contreTerrainGouverne = minimumContreTerrainMm !== null && minimumContreTerrainMm > cnomCalcule;
  const cnomBrut = contreTerrainGouverne ? minimumContreTerrainMm! : cnomCalcule;
  const cnomRetenu = face.arrondi5mm ? arrondiSuperieur5(cnomBrut) : cnomBrut;

  return {
    diametreEquivalentMm: phiN,
    majorationDmaxMm,
    cminB,
    classeDeterminante: determinante.classe,
    classeStructurale: determinante.retenue,
    cminDur,
    deltaCDurGamma: face.deltaCDurGammaMm,
    deltaCDurSt: face.deltaCDurStMm,
    deltaCDurAdd: face.deltaCDurAddMm,
    cminDurCorrige,
    cmin,
    critereCmin,
    majorationSurfaceMm,
    majorationAbrasionMm,
    cminMajore,
    deltaCDev,
    cnomCalcule,
    minimumContreTerrainMm,
    contreTerrainGouverne,
    cnomBrut,
    arrondi: face.arrondi5mm,
    cnomRetenu,
  };
}

// ============================================================================
// 6. ORCHESTRATION D'UNE FACE
// ============================================================================

const signe = (v: number) => (v > 0 ? `+${v}` : `${v}`);

export function calculerFace(
  face: FaceBeton,
  element: Pick<ElementBeton, 'id'>,
  jeu: JeuParametres | ParametresNationaux = 'EN'
): ResultatFace {
  const p = typeof jeu === 'string' ? parametres(jeu) : jeu;
  const expo = face.exposition;
  const avertissements: string[] = [];

  // --- Exposition
  const resultatXC = determinerClasseXC(expo);
  const resultatXD = determinerClasseXD(expo);
  const resultatXF = determinerClasseXF(expo);
  const resultatXA = determinerClasseXA(expo);
  const classesExposition: ClasseExposition[] = [
    resultatXC.classe,
    resultatXD.classe,
    resultatXF.classe,
    resultatXA.classe,
  ].filter((c): c is NonNullable<typeof c> => c !== null);
  if (classesExposition.length === 0) classesExposition.push('X0');

  const classesEnrobage: ClasseEnrobage[] = [];
  if (resultatXC.classe) classesEnrobage.push(resultatXC.classe);
  if (resultatXD.classe) classesEnrobage.push(resultatXD.classe);
  if (classesEnrobage.length === 0) classesEnrobage.push('X0');

  if (!expo.xc.actif && (expo.xd.actif || expo.xf.actif || expo.xa.actif)) {
    avertissements.push(
      'Famille XC non cochée : en béton armé, une classe de carbonatation accompagne normalement les autres familles (EN 206, tableau 1).'
    );
  }
  if (expo.xf.actif && expo.xf.deverglacage && !expo.xd.actif) {
    avertissements.push(
      `Gel avec agents de déverglaçage (${resultatXF.classe}) sans famille XD cochée : les sels de déverglaçage exposent aussi les armatures aux chlorures (XD1 pour des surfaces verticales, XD3 pour des surfaces horizontales directement salées), cf. EN 206 tableau 1 et tableau DNA W.1.`
    );
  }
  if (resultatXF.classe === 'XF4' && resultatXD.classe && resultatXD.classe !== 'XD3') {
    avertissements.push(
      'XF4 (forte saturation avec sels) avec une classe XD inférieure à XD3 : vérifier l’exposition aux chlorures (projections directes, surfaces horizontales salées).'
    );
  }

  // --- Categorie DNA W.1
  const so4Eleve =
    expo.xa.actif &&
    ((expo.xa.so4EauMgL ?? 0) > 600 || (expo.xa.so4SolMgKg ?? 0) > 3000);
  const { compatibles, proposee } = determinerCategoriesBeton(classesExposition, so4Eleve);
  const imposee = face.categorieDna ? DNA_W1_CATEGORIES[face.categorieDna] ?? null : null;
  const categorieRetenue = imposee ?? proposee;
  const categorieCompatible = categorieRetenue
    ? compatibles.some((c) => c.code === categorieRetenue.code)
    : false;
  if (!categorieRetenue) {
    avertissements.push('Aucune catégorie DNA W.1 ne couvre toutes les classes : béton à prescrire sur étude.');
  } else if (!categorieCompatible) {
    avertissements.push(
      `La catégorie ${categorieRetenue.code} imposée ne couvre pas toutes les classes d’exposition (${classesExposition.join(', ')}).`
    );
  }
  const classesResistanceCompatibles = categorieRetenue ? classesResistanceCategorie(categorieRetenue) : [];
  let resistanceCompatible: boolean | null = null;
  if (face.classeResistance) {
    // Compatible si la resistance atteint la plus faible classe listee pour la categorie.
    const fckMin = Math.min(...classesResistanceCompatibles.map(extraireFck));
    resistanceCompatible = classesResistanceCompatibles.length > 0 && extraireFck(face.classeResistance) >= fckMin;
    if (!resistanceCompatible && categorieRetenue) {
      avertissements.push(
        `Classe de résistance ${face.classeResistance} inférieure aux classes admises par la catégorie ${categorieRetenue.code} (${classesResistanceCompatibles.join(', ') || 'aucune'}).`
      );
    }
  }

  // --- Classe structurale pour chaque classe d'exposition relevant du tableau 4.4N
  const structurales = classesEnrobage.map((cl) => calculerClasseStructurale(cl, face, p));
  const determinante = structurales.reduce((max, s) => (s.cminDur > max.cminDur ? s : max), structurales[0]);

  // --- Enrobage
  const phiN = diametreEquivalent(face.diametreBarreMm, face.nombreBarresPaquet);
  if (face.nombreBarresPaquet > 1 && phiN > 55) {
    avertissements.push(`Diamètre équivalent du paquet ${phiN} mm > 55 mm (EN 1992-1-1, 8.9.1(2)).`);
  }
  const dev = bornerDeltaCDev(face, p);
  if (dev.ajustee && face.deltaCDev.niveau !== 'standard') {
    avertissements.push(`Δcdev saisi ${face.deltaCDev.valeurMm} mm hors de la plage admise : ${dev.valeur} mm retenu.`);
  }
  const enrobage = calculerEnrobage(face, determinante, p);

  // --- Cheminement
  const cheminement: EtapeCheminement[] = [];
  cheminement.push({
    titre: '1. Classes d’exposition',
    reference: 'EN 206, tableaux 1 et 2',
    lignes: [
      ...[resultatXC, resultatXD, resultatXF, resultatXA]
        .filter((r) => r.classe)
        .map((r) => `${r.classe} : ${r.justification} [${r.normeRef}]`),
      ...(classesExposition[0] === 'X0' && classesExposition.length === 1
        ? ['X0 : aucun risque de corrosion ou d’attaque retenu.']
        : []),
      `Classes retenues : ${classesExposition.join(', ')}.`,
    ],
  });
  cheminement.push({
    titre: '2. Catégorie de béton et classe de résistance',
    reference: 'EN 206, annexe ILNAS, tableau DNA W.1',
    lignes: [
      `Catégories couvrant toutes les classes : ${compatibles.map((c) => c.code).join(', ') || 'aucune'} (catégorie 0 écartée : béton non armé).`,
      `Catégorie proposée : ${proposee?.code ?? 'sur étude'}${imposee ? ` ; catégorie imposée : ${imposee.code}` : ''}.`,
      `Classes de résistance admises : ${classesResistanceCompatibles.join(', ') || '–'}.`,
      `Classe de résistance choisie : ${face.classeResistance ?? 'non choisie'}${resistanceCompatible === false ? ' (incompatible)' : ''}.`,
    ],
  });
  cheminement.push({
    titre: '3. Classe structurale',
    reference: 'EN 1992-1-1, 4.4.1.2(5) et tableau 4.3N',
    lignes: structurales.flatMap((s) => [
      `${s.classe} : base S${s.base}` +
        s.modificateurs.map((m) => ` ${m.actif ? signe(m.valeur) : '±0'} (${m.libelle}${m.actif ? '' : ' : non'})`).join('') +
        ` = ${s.brute}${s.brute !== s.retenue ? ` → borné à S${s.retenue}` : ''} ⇒ S${s.retenue}, cmin,dur = ${s.cminDur} mm.`,
    ]),
  });
  const ignorees = classesExposition.filter((c) => c.startsWith('XF') || c.startsWith('XA'));
  cheminement.push({
    titre: '4. cmin,dur',
    reference: 'EN 1992-1-1, tableau 4.4N',
    lignes: [
      `Classe déterminante : ${determinante.classe} en S${determinante.retenue} : cmin,dur = ${determinante.cminDur} mm (maximum sur ${classesEnrobage.join(', ')}).`,
      ...(ignorees.length
        ? [
            `${ignorees.join(', ')} : le tableau 4.4N ne définit pas de cmin,dur pour ces classes ; elles gouvernent la catégorie de béton et la résistance minimale, l’enrobage est gouverné par les classes XC et XD associées.`,
          ]
        : []),
    ],
  });
  cheminement.push({
    titre: '5. cmin',
    reference: 'EN 1992-1-1, 4.4.1.2, tableau 4.2 et expression (4.2)',
    lignes: [
      face.nombreBarresPaquet > 1
        ? `Paquet de ${face.nombreBarresPaquet} Ø${face.diametreBarreMm} : φn = ${phiN} mm (8.9.1(2)).`
        : `Barre isolée Ø${face.diametreBarreMm} mm.`,
      `cmin,b = ${phiN}${enrobage.majorationDmaxMm ? ` + ${enrobage.majorationDmaxMm} (Dmax = ${face.dmaxMm} mm > 32 mm)` : ''} = ${enrobage.cminB} mm.`,
      `cmin,dur + Δcdur,γ − Δcdur,st − Δcdur,add = ${enrobage.cminDur} + ${enrobage.deltaCDurGamma} − ${enrobage.deltaCDurSt} − ${enrobage.deltaCDurAdd} = ${enrobage.cminDurCorrige} mm.`,
      `cmin = max(${enrobage.cminB} ; ${enrobage.cminDurCorrige} ; 10) = ${enrobage.cmin} mm (gouverné par ${enrobage.critereCmin}).`,
      ...(enrobage.majorationSurfaceMm
        ? [`Surface irrégulière ou granulats apparents : +${enrobage.majorationSurfaceMm} mm (4.4.1.2(11)).`]
        : []),
      ...(enrobage.majorationAbrasionMm
        ? [`Abrasion ${face.abrasion} : +${enrobage.majorationAbrasionMm} mm (4.4.1.2(13)).`]
        : []),
      ...(enrobage.cminMajore !== enrobage.cmin ? [`cmin majoré = ${enrobage.cminMajore} mm.`] : []),
    ],
  });
  cheminement.push({
    titre: '6. cnom',
    reference: 'EN 1992-1-1, 4.4.1.1 et 4.4.1.3',
    lignes: [
      `cnom = cmin + Δcdev = ${enrobage.cminMajore} + ${enrobage.deltaCDev} = ${enrobage.cnomCalcule} mm.`,
      ...(enrobage.minimumContreTerrainMm !== null
        ? [
            `Bétonnage ${face.betonnageContreTerrain === 'sol' ? 'directement contre le sol (k2' : 'contre terrain préparé ou béton de propreté (k1'} = ${enrobage.minimumContreTerrainMm} mm, 4.4.1.3(4)) : ${enrobage.contreTerrainGouverne ? `minimum déterminant, cnom = ${enrobage.cnomBrut} mm` : 'minimum respecté'}.`,
          ]
        : []),
      enrobage.arrondi
        ? `Valeur brute ${enrobage.cnomBrut} mm, arrondie au multiple de 5 mm supérieur : cnom retenu = ${enrobage.cnomRetenu} mm.`
        : `cnom retenu = ${enrobage.cnomRetenu} mm (sans arrondi).`,
    ],
  });

  return {
    elementId: element.id,
    faceId: face.id,
    resultatXC,
    resultatXD,
    resultatXF,
    resultatXA,
    classesExposition,
    classesEnrobage,
    categoriesCompatibles: compatibles,
    categorieProposee: proposee,
    categorieRetenue,
    categorieCompatible,
    classesResistanceCompatibles,
    resistanceCompatible,
    structurales,
    enrobage,
    avertissements,
    cheminement,
  };
}
