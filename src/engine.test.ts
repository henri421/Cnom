import { describe, expect, it } from 'vitest';
import {
  arrondiSuperieur5,
  calculerClasseStructurale,
  calculerFace,
  classesResistanceCategorie,
  DNA_W1_CATEGORIES,
  diametreEquivalent,
  extraireFck,
} from './engine';
import { creerFaceParDefaut } from './modele';
import { PARAMETRES_EN, PARAMETRES_LU } from './parametres-nationaux';
import { ClasseEnrobage, FaceBeton } from './types';

/**
 * Table de reference saisie separement du code : EN 1992-1-1, tableau 4.4N
 * (valeurs recommandees), colonnes X0, XC1, XC2/XC3, XC4, XD1, XD2, XD3 ; lignes S1 a S6.
 */
const REFERENCE_4_4N: Record<string, number[]> = {
  S1: [10, 10, 10, 15, 20, 25, 30],
  S2: [10, 10, 15, 20, 25, 30, 35],
  S3: [10, 10, 20, 25, 30, 35, 40],
  S4: [10, 15, 25, 30, 35, 40, 45],
  S5: [15, 20, 30, 35, 40, 45, 50],
  S6: [20, 25, 35, 40, 45, 50, 55],
};
const COLONNES: ClasseEnrobage[][] = [['X0'], ['XC1'], ['XC2', 'XC3'], ['XC4'], ['XD1'], ['XD2'], ['XD3']];

const elem = { id: 'e1' };

/** Face neutre : XC1, C20/25 (aucune minoration de resistance), barre 8 mm, sans arrondi. */
function face(modif: (f: FaceBeton) => void = () => {}): FaceBeton {
  const f = creerFaceParDefaut('interieure');
  f.exposition.xc = { actif: true, ambiance: 'interieur_sec' };
  f.classeResistance = 'C20/25';
  f.diametreBarreMm = 8;
  f.arrondi5mm = false;
  modif(f);
  return f;
}

describe('tableau 4.4N, cellule par cellule', () => {
  for (const [jeu, p] of [
    ['EN', PARAMETRES_EN],
    ['LU', PARAMETRES_LU],
  ] as const) {
    for (const [ligne, valeurs] of Object.entries(REFERENCE_4_4N)) {
      const s = Number(ligne.substring(1));
      COLONNES.forEach((classes, i) => {
        for (const cl of classes) {
          it(`${jeu} ${cl} ${ligne} = ${valeurs[i]} mm`, () => {
            expect(p.cminDur[cl][s - 1]).toBe(valeurs[i]);
          });
        }
      });
    }
  }

  it('ne contient aucune ligne XF ni XA', () => {
    expect(Object.keys(PARAMETRES_EN.cminDur).sort()).toEqual(
      ['X0', 'XC1', 'XC2', 'XC3', 'XC4', 'XD1', 'XD2', 'XD3'].sort()
    );
  });
});

describe('classes d exposition : un cas par classe', () => {
  const cas: [string, (f: FaceBeton) => void, string][] = [
    ['X0', (f) => (f.exposition.xc.actif = false), 'X0'],
    ['XC1 interieur sec', (f) => (f.exposition.xc.ambiance = 'interieur_sec'), 'XC1'],
    ['XC1 immerge', (f) => (f.exposition.xc.ambiance = 'immerge_permanent'), 'XC1'],
    ['XC2', (f) => (f.exposition.xc.ambiance = 'enterree_ou_eau'), 'XC2'],
    ['XC3 abrite', (f) => (f.exposition.xc.ambiance = 'exterieur_abrite'), 'XC3'],
    ['XC3 humide', (f) => (f.exposition.xc.ambiance = 'interieur_humide'), 'XC3'],
    ['XC4', (f) => (f.exposition.xc.ambiance = 'exterieur_non_abrite'), 'XC4'],
    ['XD1', (f) => (f.exposition.xd = { actif: true, mode: 'aerosols' }), 'XD1'],
    ['XD2', (f) => (f.exposition.xd = { actif: true, mode: 'humide' }), 'XD2'],
    ['XD3', (f) => (f.exposition.xd = { actif: true, mode: 'cycles' }), 'XD3'],
    ['XF1', (f) => (f.exposition.xf = { actif: true, saturation: 'moderee', deverglacage: false }), 'XF1'],
    ['XF2', (f) => (f.exposition.xf = { actif: true, saturation: 'moderee', deverglacage: true }), 'XF2'],
    ['XF3', (f) => (f.exposition.xf = { actif: true, saturation: 'forte', deverglacage: false }), 'XF3'],
    ['XF4', (f) => (f.exposition.xf = { actif: true, saturation: 'forte', deverglacage: true }), 'XF4'],
    ['XA1', (f) => (f.exposition.xa = { actif: true, so4EauMgL: 200, so4SolMgKg: null, autreForte: false }), 'XA1'],
    ['XA2c', (f) => (f.exposition.xa = { actif: true, so4EauMgL: 601, so4SolMgKg: null, autreForte: false }), 'XA2c'],
    ['XA3c sol', (f) => (f.exposition.xa = { actif: true, so4EauMgL: null, so4SolMgKg: 12001, autreForte: false }), 'XA3c'],
    ['XA3c autre', (f) => (f.exposition.xa = { actif: true, so4EauMgL: null, so4SolMgKg: null, autreForte: true }), 'XA3c'],
  ];
  for (const [nom, modif, attendue] of cas) {
    it(nom, () => {
      const r = calculerFace(face(modif), elem);
      expect(r.classesExposition).toContain(attendue);
    });
  }

  it('XA sous les seuils : pas de classe XA', () => {
    const r = calculerFace(face((f) => (f.exposition.xa = { actif: true, so4EauMgL: 150, so4SolMgKg: 1000, autreForte: false })), elem);
    expect(r.resultatXA.classe).toBeNull();
  });

  it('selection multiple : XC4 + XD3 + XF4 simultanement', () => {
    const r = calculerFace(
      face((f) => {
        f.exposition.xc.ambiance = 'exterieur_non_abrite';
        f.exposition.xd = { actif: true, mode: 'cycles' };
        f.exposition.xf = { actif: true, saturation: 'forte', deverglacage: true };
      }),
      elem
    );
    expect(r.classesExposition).toEqual(['XC4', 'XD3', 'XF4']);
    expect(r.categorieProposee?.code).toBe('4LP');
  });
});

describe('XF et XA ne gouvernent pas cmin,dur', () => {
  it('XC1 + XF4 + XA3c : cmin,dur issu de XC1 seulement', () => {
    const r = calculerFace(
      face((f) => {
        f.exposition.xf = { actif: true, saturation: 'forte', deverglacage: true };
        f.exposition.xa = { actif: true, so4EauMgL: null, so4SolMgKg: null, autreForte: true };
      }),
      elem
    );
    expect(r.classesEnrobage).toEqual(['XC1']);
    expect(r.enrobage.cminDur).toBe(15); // XC1, S4
    expect(r.cheminement.some((e) => e.lignes.some((l) => l.includes('ne définit pas de cmin,dur')))).toBe(true);
    expect(r.avertissements.some((a) => a.includes('sans famille XD'))).toBe(true);
  });
});

describe('classe structurale : modificateurs du tableau 4.3N', () => {
  const p = PARAMETRES_EN;
  const base = { dureeUtilisation: 50 as const, classeResistance: null, assimilableDalle: false, maitriseQualite: false };

  it('base S4', () => {
    expect(calculerClasseStructurale('XC3', base, p).retenue).toBe(4);
  });
  it('100 ans : +2', () => {
    expect(calculerClasseStructurale('XC3', { ...base, dureeUtilisation: 100 }, p).retenue).toBe(6);
  });
  it('dalle : -1', () => {
    expect(calculerClasseStructurale('XC3', { ...base, assimilableDalle: true }, p).retenue).toBe(3);
  });
  it('maitrise de la qualite : -1', () => {
    expect(calculerClasseStructurale('XC3', { ...base, maitriseQualite: true }, p).retenue).toBe(3);
  });

  const seuils: [ClasseEnrobage, string, string][] = [
    ['X0', 'C30/37', 'C25/30'],
    ['XC1', 'C30/37', 'C25/30'],
    ['XC2', 'C35/45', 'C30/37'],
    ['XC3', 'C35/45', 'C30/37'],
    ['XC4', 'C40/50', 'C35/45'],
    ['XD1', 'C40/50', 'C35/45'],
    ['XD2', 'C40/50', 'C35/45'],
    ['XD3', 'C45/55', 'C40/50'],
  ];
  for (const [cl, atteint, juste] of seuils) {
    it(`resistance ${cl} : -1 a partir de ${atteint}, pas a ${juste}`, () => {
      expect(calculerClasseStructurale(cl, { ...base, classeResistance: atteint }, p).retenue).toBe(3);
      expect(calculerClasseStructurale(cl, { ...base, classeResistance: juste }, p).retenue).toBe(4);
    });
  }

  it('borne basse S1', () => {
    const s = calculerClasseStructurale(
      'XC1',
      { dureeUtilisation: 50, classeResistance: 'C50/60', assimilableDalle: true, maitriseQualite: true },
      p
    );
    expect(s.brute).toBe(1);
    expect(s.retenue).toBe(1);
  });
  it('borne haute S6 (100 ans, aucune minoration)', () => {
    const s = calculerClasseStructurale('XD3', { ...base, dureeUtilisation: 100 }, p);
    expect(s.brute).toBe(6);
    expect(s.retenue).toBe(6);
    expect(s.cminDur).toBe(55);
  });
  it('bornage effectif S1 avec base reduite', () => {
    const pBas = { ...p, classeStructuraleBase: 2 };
    const s = calculerClasseStructurale(
      'XC1',
      { dureeUtilisation: 50, classeResistance: 'C50/60', assimilableDalle: true, maitriseQualite: true },
      pBas
    );
    expect(s.brute).toBe(-1);
    expect(s.retenue).toBe(1);
  });
  it('bornage effectif S6 avec base relevee', () => {
    const s = calculerClasseStructurale('XC4', { ...base, dureeUtilisation: 100 }, { ...p, classeStructuraleBase: 5 });
    expect(s.brute).toBe(7);
    expect(s.retenue).toBe(6);
  });

  it('classe structurale calculee pour chaque classe retenue (minoration propre a chacune)', () => {
    // C40/50 : -1 pour XC4 (seuil C40/50) mais pas pour XD3 (seuil C45/55)
    const r = calculerFace(
      face((f) => {
        f.classeResistance = 'C40/50';
        f.exposition.xc.ambiance = 'exterieur_non_abrite';
        f.exposition.xd = { actif: true, mode: 'cycles' };
      }),
      elem
    );
    const xc4 = r.structurales.find((s) => s.classe === 'XC4')!;
    const xd3 = r.structurales.find((s) => s.classe === 'XD3')!;
    expect(xc4.retenue).toBe(3);
    expect(xd3.retenue).toBe(4);
    expect(r.enrobage.classeDeterminante).toBe('XD3');
    expect(r.enrobage.cminDur).toBe(45);
  });
});

describe('enrobage', () => {
  it('cas de base : XC4, S4, Ø12 -> cnom = 30 + 10 = 40', () => {
    const r = calculerFace(face((f) => ((f.exposition.xc.ambiance = 'exterieur_non_abrite'), (f.diametreBarreMm = 12))), elem);
    expect(r.enrobage.cmin).toBe(30);
    expect(r.enrobage.cnomRetenu).toBe(40);
  });

  it('cmin,b gouverne pour un gros diametre ; Dmax > 32 mm ajoute 5 mm', () => {
    const r = calculerFace(face((f) => ((f.diametreBarreMm = 25), (f.dmaxMm = 40))), elem);
    expect(r.enrobage.cminB).toBe(30);
    expect(r.enrobage.cmin).toBe(30);
    expect(r.enrobage.critereCmin).toBe('cmin,b');
    const r32 = calculerFace(face((f) => ((f.diametreBarreMm = 25), (f.dmaxMm = 32))), elem);
    expect(r32.enrobage.cminB).toBe(25);
  });

  it('paquet : diametre equivalent', () => {
    expect(diametreEquivalent(20, 2)).toBeCloseTo(28.3, 1);
    expect(diametreEquivalent(20, 1)).toBe(20);
    const r = calculerFace(face((f) => ((f.diametreBarreMm = 20), (f.nombreBarresPaquet = 2))), elem);
    expect(r.enrobage.cminB).toBeCloseTo(28.3, 1);
  });

  it('plancher de 10 mm', () => {
    const r = calculerFace(
      face((f) => {
        f.classeResistance = 'C30/37';
        f.assimilableDalle = true;
        f.diametreBarreMm = 6;
      }),
      elem
    );
    // XC1, S2 : cmin,dur = 10
    expect(r.enrobage.cmin).toBe(10);
  });

  it('Delta c_dur : gamma ajoute, st et add retranchent', () => {
    const r = calculerFace(
      face((f) => {
        f.exposition.xc.ambiance = 'exterieur_non_abrite'; // 30
        f.deltaCDurGammaMm = 5;
        f.deltaCDurStMm = 5;
        f.deltaCDurAddMm = 10;
      }),
      elem
    );
    expect(r.enrobage.cminDurCorrige).toBe(20);
    expect(r.enrobage.cmin).toBe(20);
  });

  it('surface irreguliere +5 et abrasion XM1/XM2/XM3 = +5/+10/+15', () => {
    const base = calculerFace(face(), elem).enrobage.cnomRetenu; // 15 + 10 = 25
    expect(base).toBe(25);
    expect(calculerFace(face((f) => (f.surfaceIrreguliere = true)), elem).enrobage.cnomRetenu).toBe(30);
    expect(calculerFace(face((f) => (f.abrasion = 'XM1')), elem).enrobage.cnomRetenu).toBe(30);
    expect(calculerFace(face((f) => (f.abrasion = 'XM2')), elem).enrobage.cnomRetenu).toBe(35);
    expect(calculerFace(face((f) => (f.abrasion = 'XM3')), elem).enrobage.cnomRetenu).toBe(40);
  });

  it('Delta c_dev : 10 en standard, saisie libre bornee sinon', () => {
    expect(calculerFace(face((f) => (f.deltaCDev = { niveau: 'standard', valeurMm: 3 })), elem).enrobage.deltaCDev).toBe(10);
    expect(calculerFace(face((f) => (f.deltaCDev = { niveau: 'assurance_qualite', valeurMm: 7 })), elem).enrobage.deltaCDev).toBe(7);
    const borne = calculerFace(face((f) => (f.deltaCDev = { niveau: 'assurance_qualite', valeurMm: 2 })), elem);
    expect(borne.enrobage.deltaCDev).toBe(5);
    expect(borne.avertissements.some((a) => a.includes('hors de la plage'))).toBe(true);
    expect(calculerFace(face((f) => (f.deltaCDev = { niveau: 'mesure_rejet', valeurMm: 0 })), elem).enrobage.deltaCDev).toBe(0);
  });

  it('contre terrain prepare : cnom >= 40 ; contre le sol : cnom >= 75', () => {
    const prep = calculerFace(face((f) => (f.betonnageContreTerrain = 'prepare')), elem);
    expect(prep.enrobage.cnomCalcule).toBe(25);
    expect(prep.enrobage.contreTerrainGouverne).toBe(true);
    expect(prep.enrobage.cnomRetenu).toBe(40);
    const sol = calculerFace(face((f) => (f.betonnageContreTerrain = 'sol')), elem);
    expect(sol.enrobage.cnomRetenu).toBe(75);
    // minimum deja respecte
    const fort = calculerFace(
      face((f) => {
        f.exposition.xd = { actif: true, mode: 'cycles' }; // XD3 S4 = 45 -> cnom 55
        f.betonnageContreTerrain = 'prepare';
      }),
      elem
    );
    expect(fort.enrobage.contreTerrainGouverne).toBe(false);
    expect(fort.enrobage.cnomRetenu).toBe(55);
  });

  it('arrondi optionnel au multiple de 5 mm superieur', () => {
    const brut = calculerFace(face((f) => (f.diametreBarreMm = 16)), elem); // cmin 16 -> 26
    expect(brut.enrobage.cnomBrut).toBe(26);
    expect(brut.enrobage.cnomRetenu).toBe(26);
    const arr = calculerFace(face((f) => ((f.diametreBarreMm = 16), (f.arrondi5mm = true))), elem);
    expect(arr.enrobage.cnomBrut).toBe(26);
    expect(arr.enrobage.cnomRetenu).toBe(30);
    expect(arrondiSuperieur5(30)).toBe(30);
    expect(arrondiSuperieur5(28.3)).toBe(30);
  });
});

describe('categorie DNA W.1 et classe de resistance', () => {
  it('extraireFck lit toutes les classes', () => {
    expect(extraireFck('C45/55')).toBe(45);
    expect(extraireFck('>=C35/45')).toBe(35);
    expect(extraireFck(null)).toBe(0);
  });
  it('classes admises par categorie', () => {
    expect(classesResistanceCategorie(DNA_W1_CATEGORIES['6'])).toEqual(['C35/45', 'C40/50', 'C45/55', 'C50/60']);
    expect(classesResistanceCategorie(DNA_W1_CATEGORIES['4LP'])).toEqual(['C30/37']);
  });
  it('XC1 seul : categorie 1 proposee (0 ecartee, beton non arme)', () => {
    const r = calculerFace(face(), elem);
    expect(r.categorieProposee?.code).toBe('1');
  });
  it('avertit si la classe de resistance est incompatible', () => {
    const r = calculerFace(face((f) => (f.classeResistance = 'C12/15')), elem);
    expect(r.resistanceCompatible).toBe(false);
    expect(r.avertissements.length).toBeGreaterThan(0);
  });
  it('SO4 eleve : variante HRS proposee', () => {
    const r = calculerFace(
      face((f) => (f.exposition.xa = { actif: true, so4EauMgL: 1000, so4SolMgKg: null, autreForte: false })),
      elem
    );
    expect(r.categorieProposee?.code).toBe('3HRS');
  });
  it('XD2 couvert par la categorie 3', () => {
    const r = calculerFace(face((f) => (f.exposition.xd = { actif: true, mode: 'humide' })), elem);
    expect(r.categorieProposee?.code).toBe('3');
  });
});
