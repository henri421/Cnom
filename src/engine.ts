/**
 * Moteur de calcul pour l'enrobage et les classes d'exposition
 * Références normatives :
 * - EN 1992-1-1 (Eurocode 2 - Calcul des structures en béton)
 * - EN 206 (Béton - Spécification, performances, production et conformité)
 * - Annexe Nationale Luxembourgeoise (ILNAS) & Tableau DNA W.1
 */

import {
  CategorieBeton,
  ClasseExposition,
  ClasseXC,
  ClasseXD,
  ClasseXF,
  ClasseXA,
  ElementBeton,
  ModificateursStructuraux,
  ReponsesRisque,
  ResultatCalculElement,
  ResultatClasse,
  ResultatEnrobage,
} from './types';

// ============================================================================
// 1. TABLEAU DNA W.1 - CATÉGORIES DE BÉTON (EN 206 ILNAS)
// ============================================================================

export const DNA_W1_CATEGORIES: Record<string, CategorieBeton> = {
  '0': {
    code: '0',
    description: 'Béton non armé.',
    classesCouvertes: new Set<ClasseExposition>(['X0']),
    fckPossibles: ['C12/15', 'C20/25'],
    ordre: 0,
  },
  '1': {
    code: '1',
    description:
      "Béton armé à l'intérieur de bâtiments. Béton armé hors gel, contact à long terme avec l'eau (fondations).",
    classesCouvertes: new Set<ClasseExposition>(['X0', 'XC1', 'XC2']),
    fckPossibles: ['C20/25', 'C25/30'],
    ordre: 1,
  },
  '2': {
    code: '2',
    description:
      "Béton armé intérieur avec taux d'humidité élevé. Béton armé extérieur, surfaces horizontales abritées de la pluie ou surfaces verticales. Faible agressivité chimique.",
    classesCouvertes: new Set<ClasseExposition>([
      'X0',
      'XC1',
      'XC2',
      'XC3',
      'XC4',
      'XF1',
      'XA1',
    ]),
    fckPossibles: ['C25/30', 'C30/37', '>=C35/45'],
    ordre: 2,
  },
  '3': {
    code: '3',
    description:
      'Béton armé extérieur, surfaces horizontales sans agents de déverglaçage, surfaces verticales avec agents de déverglaçage. Agressivité chimique modérée, SO4(2-) <= 600 mg/l (eau) ou <= 3000 mg/kg (sol).',
    classesCouvertes: new Set<ClasseExposition>([
      'X0',
      'XC1',
      'XC2',
      'XC3',
      'XC4',
      'XD1',
      'XD2',
      'XF1',
      'XF2',
      'XF3',
      'XA1',
      'XA2c',
    ]),
    fckPossibles: ['C30/37', '>=C35/45'],
    ordre: 3,
  },
  '3HRS': {
    code: '3HRS',
    description:
      'Identique à la catégorie 3 pour les classes d’exposition, mais pour SO4(2-) > 600 mg/l (eau) ou > 3000 mg/kg (sol) nécessitant un ciment HRS.',
    classesCouvertes: new Set<ClasseExposition>([
      'X0',
      'XC1',
      'XC2',
      'XC3',
      'XC4',
      'XD1',
      'XD2',
      'XF1',
      'XF2',
      'XF3',
      'XA1',
      'XA2c',
    ]),
    fckPossibles: ['C30/37', '>=C35/45'],
    ordre: 4,
  },
  '4LP': {
    code: '4LP',
    description:
      'Béton armé extérieur, surfaces horizontales AVEC agents de déverglaçage (application directe / voirie). Agressivité chimique modérée, SO4(2-) <= 600 mg/l (eau) ou <= 3000 mg/kg (sol).',
    classesCouvertes: new Set<ClasseExposition>([
      'X0',
      'XC1',
      'XC2',
      'XC3',
      'XC4',
      'XD1',
      'XD2',
      'XD3',
      'XF1',
      'XF2',
      'XF3',
      'XF4',
      'XA1',
      'XA2c',
    ]),
    fckPossibles: ['C30/37'],
    ordre: 5,
  },
  '5': {
    code: '5',
    description:
      "Béton armé à haute résistance à la pénétration de l'eau (cuvelage, cuves étanches). Faible agressivité chimique.",
    classesCouvertes: new Set<ClasseExposition>([
      'X0',
      'XC1',
      'XC2',
      'XC3',
      'XC4',
      'XF1',
      'XA1',
    ]),
    fckPossibles: ['C25/30', 'C30/37', '>=C35/45'],
    ordre: 6,
  },
  '6': {
    code: '6',
    description:
      'Béton armé extérieur, surfaces horizontales sans agents de déverglaçage, surfaces verticales avec agents de déverglaçage. Béton armé hors gel, présence de chlorures. Agressivité chimique forte (XA3c), SO4(2-) <= 600 mg/l (eau) ou <= 3000 mg/kg (sol).',
    classesCouvertes: new Set<ClasseExposition>([
      'X0',
      'XC1',
      'XC2',
      'XC3',
      'XC4',
      'XD1',
      'XD2',
      'XD3',
      'XF1',
      'XF2',
      'XF3',
      'XA1',
      'XA2c',
      'XA3c',
    ]),
    fckPossibles: ['>=C35/45'],
    ordre: 7,
  },
  '6HRS': {
    code: '6HRS',
    description:
      'Identique à la catégorie 6 pour les classes d’exposition, mais avec SO4(2-) > 600 mg/l (eau) ou > 3000 mg/kg (sol) nécessitant un ciment HRS.',
    classesCouvertes: new Set<ClasseExposition>([
      'X0',
      'XC1',
      'XC2',
      'XC3',
      'XC4',
      'XD1',
      'XD2',
      'XD3',
      'XF1',
      'XF2',
      'XF3',
      'XA1',
      'XA2c',
      'XA3c',
    ]),
    fckPossibles: ['>=C35/45'],
    ordre: 8,
  },
};

// ============================================================================
// 2. TABLEAU 4.4N (EN 1992-1-1) - CMIN,DUR ARMATURES EN MM
// ============================================================================

export const CMIN_DUR_ARMATURES: Record<ClasseExposition, Record<number, number>> = {
  X0:  { 1: 10, 2: 10, 3: 10, 4: 10, 5: 15, 6: 20 },
  XC1: { 1: 10, 2: 10, 3: 10, 4: 15, 5: 20, 6: 25 },
  XC2: { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30, 6: 35 },
  XC3: { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30, 6: 35 },
  XC4: { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35, 6: 40 },
  XD1: { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35, 6: 40 },
  XD2: { 1: 20, 2: 25, 3: 30, 4: 35, 5: 40, 6: 45 },
  XD3: { 1: 25, 2: 30, 3: 35, 4: 40, 5: 45, 6: 50 },
  // Pour XF et XA, la protection armatures contre la corrosion s'aligne
  // normativement sur le milieu humide/carbonatation équivalent selon EN 1992-1-1
  XF1: { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30, 6: 35 },
  XF2: { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35, 6: 40 },
  XF3: { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35, 6: 40 },
  XF4: { 1: 20, 2: 25, 3: 30, 4: 35, 5: 40, 6: 45 },
  XA1: { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30, 6: 35 },
  XA2c:{ 1: 15, 2: 20, 3: 25, 4: 30, 5: 35, 6: 40 },
  XA3c:{ 1: 20, 2: 25, 3: 30, 4: 35, 5: 40, 6: 45 },
};

// ============================================================================
// 3. LOGIQUE DE DÉTERMINATION DES CLASSES D'EXPOSITION (EN 206 §4.1)
// ============================================================================

/**
 * Détermination de la classe XC (Corrosion induite par carbonatation)
 */
export function determinerClasseXC(reponses: ReponsesRisque): ResultatClasse<ClasseXC> {
  switch (reponses.ambianceXC) {
    case 'enterree_ou_eau':
      return {
        classe: 'XC2',
        justification:
          'Face enterrée ou en contact permanent avec de l’eau (fondations, radiers, parois moulées). Milieu humide, rarement sec.',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XC2)',
      };
    case 'exterieur_non_abrite':
      return {
        classe: 'XC4',
        justification:
          'Face extérieure à l’air libre soumise aux intempéries (non abritée de la pluie). Milieu soumis à alternance d’humidité et de séchage.',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XC4)',
      };
    case 'exterieur_abrite':
      return {
        classe: 'XC3',
        justification:
          'Face extérieure abritée de la pluie directe (sous-face d’auvent, coursive couverte, balcon abrité). Milieu à humidité modérée.',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XC3)',
      };
    case 'interieur_humide':
      return {
        classe: 'XC3',
        justification:
          'Face intérieure avec taux d’humidité modéré à élevé (cuisines collectives, buanderies, piscines intérieures couvertes).',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XC3)',
      };
    case 'interieur_sec':
    default:
      return {
        classe: 'XC1',
        justification:
          'Face intérieure en ambiance sèche de bâtiment chauffé (locaux d’habitation, bureaux, pièces sèches). Milieu sec ou humidité constante très faible.',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XC1)',
      };
  }
}

/**
 * Détermination de la classe XD (Corrosion induite par les chlorures non marins)
 */
export function determinerClasseXD(reponses: ReponsesRisque): ResultatClasse<ClasseXD> {
  if (!reponses.concerneParChlorures) {
    return {
      classe: null,
      justification: 'Élément non concerné par un environnement chloruré.',
      normeRef: 'EN 206 §4.1 (Hors chlorures)',
    };
  }

  const distance = reponses.distanceChausseeSaleeM;
  const salage = reponses.salageRoute || 'peu_frequent';
  const applicationDirecte = reponses.applicationDirecteSelSurFace;

  // Si application directe de sel avec stagnation / cycles humidité-séchage
  if (applicationDirecte) {
    return {
      classe: 'XD3',
      justification:
        'Face soumise à l’application directe d’agents de déverglaçage avec cycles d’humidité et de séchage (dalle de parking, rampe, marche extérieure).',
      normeRef: 'EN 206 §4.1 - Tableau 1 (XD3)',
    };
  }

  // Distance <= 6 m d'une chaussée salée
  if (distance !== null && distance <= 6) {
    if (salage === 'peu_frequent') {
      return {
        classe: 'XD1',
        justification:
          'Face située à moins de 6 m d’une voie salée recevant des projections d’eau chlorurée avec salage peu fréquent (surfaces verticales / voiles).',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XD1)',
      };
    } else {
      // Salage fréquent ou très fréquent -> XD3 (selon le cahier des charges DNA W.1)
      return {
        classe: 'XD3',
        justification:
          'Face située à moins de 6 m d’une voirie avec salage fréquent ou très fréquent recevant de fortes projections (selon document de référence ILNAS).',
        normeRef: 'EN 206 ILNAS & Tableau DNA W.1 (XD3)',
      };
    }
  }

  // Distance > 6 m mais exposée à l'air véhiculant des chlorures
  return {
    classe: 'XD1',
    justification:
      'Face située au-delà de 6 m mais exposée à un air véhiculant des aérosols de chlorures ou projections indirectes modérées.',
    normeRef: 'EN 206 §4.1 - Tableau 1 (XD1)',
  };
}

/**
 * Détermination de la classe XF (Attaque gel / dégel avec ou sans agents de déverglaçage)
 */
export function determinerClasseXF(reponses: ReponsesRisque): ResultatClasse<ClasseXF> {
  if (!reponses.exposeAuGel) {
    return {
      classe: null,
      justification: 'Élément intérieur chauffé ou maintenu hors gel en permanence.',
      normeRef: 'EN 206 §4.1 (Hors gel)',
    };
  }

  const avecSel = reponses.presenceAgentDeverglacage;
  const severeOuHoriz = reponses.zoneGel === 'severe' || reponses.saturationForteEau;

  if (avecSel) {
    if (severeOuHoriz) {
      return {
        classe: 'XF4',
        justification:
          'Forte saturation en eau avec agents de déverglaçage (surfaces horizontales de voirie, dalles extérieures ou zone de gel sévère avec sels).',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XF4)',
      };
    } else {
      return {
        classe: 'XF2',
        justification:
          'Saturation modérée en eau avec agents de déverglaçage (surfaces verticales extérieures soumises aux projections d’eau et de sels).',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XF2)',
      };
    }
  } else {
    // Sans sel
    if (severeOuHoriz) {
      return {
        classe: 'XF3',
        justification:
          'Forte saturation en eau sans agents de déverglaçage (surfaces horizontales extérieures non salées, réservoirs d’eau exposés au gel).',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XF3)',
      };
    } else {
      return {
        classe: 'XF1',
        justification:
          'Saturation modérée en eau sans agents de déverglaçage (surfaces verticales extérieures exposées à la pluie et au gel sans déverglaçage).',
        normeRef: 'EN 206 §4.1 - Tableau 1 (XF1)',
      };
    }
  }
}

/**
 * Détermination de la classe XA (Attaque chimique du sol ou des eaux souterraines)
 */
export function determinerClasseXA(reponses: ReponsesRisque): ResultatClasse<ClasseXA> {
  if (!reponses.concerneParAgressiviteChimique) {
    return {
      classe: null,
      justification: 'Milieu non chimiquement agressif (teneurs en sulfates et acidité naturelles normales).',
      normeRef: 'EN 206 §4.1 (Non agressif)',
    };
  }

  if (reponses.autreAgressiviteChimiqueForte) {
    return {
      classe: 'XA3c',
      justification:
        'Agressivité chimique forte constatée (pH acide < 4.5, effluents industriels, lisier ou lixiviats).',
      normeRef: 'EN 206 §4.1 - Tableau 2 (XA3c)',
    };
  }

  const eau = reponses.so4EauMgL ?? 0;
  const sol = reponses.so4SolMgKg ?? 0;

  if (eau > 3000 || sol > 12000) {
    return {
      classe: 'XA3c',
      justification: `Environnement chimique fortement agressif (SO4²⁻ eau = ${eau} mg/l > 3000 ou sol = ${sol} mg/kg > 12000).`,
      normeRef: 'EN 206 §4.1 - Tableau 2 (XA3c)',
    };
  }

  if (eau > 600 || sol > 3000) {
    return {
      classe: 'XA2c',
      justification: `Environnement chimique modérément agressif (600 < SO4²⁻ eau <= 3000 mg/l ou 3000 < sol <= 12000 mg/kg). Ciment résistant aux sulfates requis.`,
      normeRef: 'EN 206 §4.1 - Tableau 2 (XA2c)',
    };
  }

  if (eau > 200 || sol > 2000) {
    return {
      classe: 'XA1',
      justification: `Environnement chimique faiblement agressif (200 < SO4²⁻ eau <= 600 mg/l ou 2000 < sol <= 3000 mg/kg).`,
      normeRef: 'EN 206 §4.1 - Tableau 2 (XA1)',
    };
  }

  return {
    classe: null,
    justification: 'Teneurs mesurées en dessous des seuils d’agressivité chimique de l’EN 206 (SO4 eau <= 200 mg/l et sol <= 2000 mg/kg).',
    normeRef: 'EN 206 §4.1 - Tableau 2',
  };
}

// ============================================================================
// 4. DÉTERMINATION DE LA CATÉGORIE DE BÉTON (TABLEAU DNA W.1)
// ============================================================================

export function determinerCategoriesBeton(
  classesRequises: Set<ClasseExposition>,
  reponses?: ReponsesRisque
): {
  compatibles: CategorieBeton[];
  optimale: CategorieBeton | null;
  fckPossibles: string[];
} {
  const compatibles: CategorieBeton[] = [];
  const so4Eleve =
    reponses &&
    ((reponses.so4EauMgL !== null && reponses.so4EauMgL > 600) ||
      (reponses.so4SolMgKg !== null && reponses.so4SolMgKg > 3000));

  for (const cat of Object.values(DNA_W1_CATEGORIES)) {
    let couvreTout = true;
    for (const cl of classesRequises) {
      if (!cat.classesCouvertes.has(cl)) {
        couvreTout = false;
        break;
      }
    }

    if (couvreTout) {
      // Si SO4 > 600 mg/l ou > 3000 mg/kg, les catégories 3 ou 6 standards ne conviennent pas,
      // il faut les variantes HRS
      if (so4Eleve) {
        if (cat.code === '3' || cat.code === '6') {
          continue; // écarter les versions non-HRS
        }
      } else {
        // Si pas de besoin HRS, on n'a pas besoin d'imposer 3HRS ou 6HRS si la standard suffit
        if (cat.code === '3HRS' || cat.code === '6HRS') {
          // On peut la garder en compatible, mais elle ne sera pas l'optimale par défaut
        }
      }
      compatibles.push(cat);
    }
  }

  // Tri par ordre de sévérité croissante
  compatibles.sort((a, b) => a.ordre - b.ordre);

  const optimale = compatibles.length > 0 ? compatibles[0] : null;
  const fckPossibles = optimale ? optimale.fckPossibles : [];

  return { compatibles, optimale, fckPossibles };
}

// ============================================================================
// 5. CLASSE STRUCTURALE (EN 1992-1-1, TABLEAU 4.3N)
// ============================================================================

export function calculerClasseStructurale(
  dureeAnnees: 50 | 100,
  typeElement: 'voile' | 'dalle',
  classeDeterminante: ClasseExposition,
  classeResistanceChoisie?: string,
  controleQualiteAssure: boolean = false
): ModificateursStructuraux {
  const base = 4; // S4 par défaut pour 50 ans
  const justifications: string[] = [];
  justifications.push('Classe de base : S4 (durée d’utilisation de référence de 50 ans selon EN 1992-1-1).');

  let modDuree = 0;
  if (dureeAnnees === 100) {
    modDuree = +2;
    justifications.push('+2 classes pour durée de projet de 100 ans (bâtiments exceptionnels / génie civil).');
  }

  let modGeom = 0;
  if (typeElement === 'dalle') {
    modGeom = -1;
    justifications.push('-1 classe pour géométrie de dalle (élément bidimensionnel plan selon tableau 4.3N).');
  }

  let modResist = 0;
  if (classeResistanceChoisie) {
    // Règle tableau 4.3N :
    // Pour XC1 : si >= C20/25 -> -1 classe
    // Pour XC2/XC3 : si >= C30/37 -> -1 classe
    // Pour XC4, XD1, XD2, XD3 : si >= C35/45 -> -1 classe
    const isXC1 = classeDeterminante === 'XC1' || classeDeterminante === 'X0';
    const isXC23 = classeDeterminante === 'XC2' || classeDeterminante === 'XC3';
    const isHigh =
      classeDeterminante === 'XC4' ||
      classeDeterminante.startsWith('XD') ||
      classeDeterminante.startsWith('XF') ||
      classeDeterminante.startsWith('XA');

    const fckNum = extraireFck(classeResistanceChoisie);

    if (isXC1 && fckNum >= 20) {
      modResist = -1;
      justifications.push(`-1 classe pour classe de résistance ${classeResistanceChoisie} >= C20/25 en ambiance ${classeDeterminante}.`);
    } else if (isXC23 && fckNum >= 30) {
      modResist = -1;
      justifications.push(`-1 classe pour classe de résistance ${classeResistanceChoisie} >= C30/37 en ambiance ${classeDeterminante}.`);
    } else if (isHigh && fckNum >= 35) {
      modResist = -1;
      justifications.push(`-1 classe pour classe de résistance ${classeResistanceChoisie} >= C35/45 en ambiance ${classeDeterminante}.`);
    }
  }

  let modControle = 0;
  if (controleQualiteAssure) {
    modControle = -1;
    justifications.push('-1 classe pour système d’assurance de la qualité spécial du contrôle de production (clause 4.4.1.2(5)).');
  }

  let total = base + modDuree + modGeom + modResist + modControle;
  const classeFinale = Math.max(1, Math.min(6, total));

  if (classeFinale !== total) {
    justifications.push(`Bornage normatif strict entre S1 et S6 -> S${classeFinale} retenue.`);
  }

  return {
    base,
    modificateurDuree: modDuree,
    modificateurResistance: modResist,
    modificateurGeometrie: modGeom,
    modificateurControle: modControle,
    classeFinale,
    justification: justifications,
  };
}

function extraireFck(classe: string): number {
  if (classe.includes('35/45')) return 35;
  if (classe.includes('30/37')) return 30;
  if (classe.includes('25/30')) return 25;
  if (classe.includes('20/25')) return 20;
  if (classe.includes('12/15')) return 12;
  return 0;
}

// ============================================================================
// 6. CALCUL DE L'ENROBAGE NOMINAL (EN 1992-1-1, CLAUSE 4.4.1)
// ============================================================================

export function determinerClasseDeterminante(
  classesRequises: ClasseExposition[],
  classeStructurale: number
): ClasseExposition {
  let maxCminDur = -1;
  let determinante: ClasseExposition = 'X0';

  for (const cl of classesRequises) {
    const table = CMIN_DUR_ARMATURES[cl];
    const val = table ? table[classeStructurale] ?? 10 : 10;
    if (val > maxCminDur) {
      maxCminDur = val;
      determinante = cl;
    }
  }

  return determinante;
}

export function calculerEnrobage(
  classeDeterminante: ClasseExposition,
  diametreBarreMm: number,
  classeStructurale: number,
  deltaCDevMm: number = 10
): ResultatEnrobage {
  const cminB = diametreBarreMm;
  const table = CMIN_DUR_ARMATURES[classeDeterminante] || CMIN_DUR_ARMATURES['X0'];
  const cminDur = table[classeStructurale] ?? 10;
  const cmin = Math.max(cminB, cminDur, 10);
  const cnom = cmin + deltaCDevMm;

  return {
    cminB,
    cminDur,
    cmin,
    deltaCDev: deltaCDevMm,
    cnom,
    classeDeterminante,
  };
}

// ============================================================================
// 7. ORCHESTRATION GLOBALE D'UN ÉLÉMENT (UNE FACE)
// ============================================================================

export function calculerElementComplet(element: ElementBeton): ResultatCalculElement {
  const resXC = determinerClasseXC(element.reponses);
  const resXD = determinerClasseXD(element.reponses);
  const resXF = determinerClasseXF(element.reponses);
  const resXA = determinerClasseXA(element.reponses);

  const classesRequisesSet = new Set<ClasseExposition>(['X0']);
  if (resXC.classe) classesRequisesSet.add(resXC.classe);
  if (resXD.classe) classesRequisesSet.add(resXD.classe);
  if (resXF.classe) classesRequisesSet.add(resXF.classe);
  if (resXA.classe) classesRequisesSet.add(resXA.classe);

  const toutesClassesRequises = Array.from(classesRequisesSet);

  // Estimation préalable de la classe structurale (avec classe provisoire pour trouver la classe déterminante)
  const structProvisoire = calculerClasseStructurale(
    element.dureeUtilisationProjet,
    element.typeElement,
    resXC.classe || 'XC1',
    element.classeResistancePrevue,
    element.qualiteControleSpeciale
  );

  const classeDeterminante = determinerClasseDeterminante(
    toutesClassesRequises,
    structProvisoire.classeFinale
  );

  // Recalcul précis de la classe structurale avec la classe d'exposition déterminante
  const modificateurs = calculerClasseStructurale(
    element.dureeUtilisationProjet,
    element.typeElement,
    classeDeterminante,
    element.classeResistancePrevue,
    element.qualiteControleSpeciale
  );

  const enrobage = calculerEnrobage(
    classeDeterminante,
    element.diametreBarreMm,
    modificateurs.classeFinale,
    element.deltaCDevMm
  );

  const { compatibles, optimale, fckPossibles } = determinerCategoriesBeton(
    classesRequisesSet,
    element.reponses
  );

  return {
    elementId: element.id,
    resultatXC: resXC,
    resultatXD: resXD,
    resultatXF: resXF,
    resultatXA: resXA,
    toutesClassesRequises,
    categoriesCompatibles: compatibles,
    categorieOptimale: optimale,
    fckRecommandees: fckPossibles,
    modificateurs,
    enrobage,
  };
}

// ============================================================================
// ÉLÉMENT INITIAL PAR DÉFAUT
// ============================================================================

export function creerElementParDefaut(nom: string = 'Voile façade - Face extérieure', type: 'voile' | 'dalle' = 'voile'): ElementBeton {
  return {
    id: 'elem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    nom,
    typeElement: type,
    dureeUtilisationProjet: 50,
    diametreBarreMm: 12,
    classeResistancePrevue: 'C30/37',
    qualiteControleSpeciale: false,
    deltaCDevMm: 10,
    reponses: {
      ambianceXC: 'exterieur_non_abrite',
      concerneParChlorures: false,
      distanceChausseeSaleeM: null,
      salageRoute: null,
      applicationDirecteSelSurFace: false,
      exposeAuGel: true,
      zoneGel: 'faible_modere',
      presenceAgentDeverglacage: false,
      saturationForteEau: false,
      concerneParAgressiviteChimique: false,
      so4EauMgL: null,
      so4SolMgKg: null,
      autreAgressiviteChimiqueForte: false,
    },
  };
}
