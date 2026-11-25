import { describe, expect, it } from 'vitest';
import type { ElementBetonV1 } from './legacy/types-v1';
import { CLE_STOCKAGE, CLE_STOCKAGE_V1, chargerDepuisStockage, migrerProjet } from './migration';
import { creerProjetExemple } from './modele';

function v1(partiel: Partial<ElementBetonV1['reponses']> = {}, autres: Partial<ElementBetonV1> = {}): ElementBetonV1 {
  return {
    id: 'elem-1',
    nom: 'Voile façade - Face extérieure',
    typeElement: 'voile',
    dureeUtilisationProjet: 50,
    diametreBarreMm: 16,
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
      ...partiel,
    },
    ...autres,
  };
}

describe('migration v1 -> v2', () => {
  it('convertit un tableau v1 en projet v2, une face par enregistrement', () => {
    const p = migrerProjet([v1(), v1({}, { id: 'elem-2', nom: 'B' })]);
    expect(p).not.toBeNull();
    expect(p!.version).toBe(2);
    expect(p!.jeuParametres).toBe('EN');
    expect(p!.elements).toHaveLength(2);
    expect(p!.elements[0].faces).toHaveLength(1);
    expect(p!.elements[0].id).toBe('elem-1');
    expect(p!.elements[0].nom).toBe('Voile façade - Face extérieure');
  });

  it('conserve toutes les saisies', () => {
    const f = migrerProjet([
      v1(
        { concerneParAgressiviteChimique: true, so4EauMgL: 700, so4SolMgKg: 100, autreAgressiviteChimiqueForte: false },
        { dureeUtilisationProjet: 100, qualiteControleSpeciale: true, deltaCDevMm: 7, classeResistancePrevue: 'C35/45' }
      ),
    ])!.elements[0].faces[0];
    expect(f.diametreBarreMm).toBe(16);
    expect(f.classeResistance).toBe('C35/45');
    expect(f.dureeUtilisation).toBe(100);
    expect(f.maitriseQualite).toBe(true);
    expect(f.deltaCDev).toEqual({ niveau: 'assurance_qualite', valeurMm: 7 });
    expect(f.exposition.xc).toEqual({ actif: true, ambiance: 'exterieur_non_abrite' });
    expect(f.exposition.xf).toEqual({ actif: true, saturation: 'moderee', deverglacage: false });
    expect(f.exposition.xa).toEqual({ actif: true, so4EauMgL: 700, so4SolMgKg: 100, autreForte: false });
    expect(f.position).toBe('exterieure');
    expect(f.arrondi5mm).toBe(false);
  });

  it('le type dalle v1 devient une reponse explicite "assimilable a une dalle"', () => {
    const e = migrerProjet([v1({}, { typeElement: 'dalle' })])!.elements[0];
    expect(e.typeElement).toBe('dalle');
    expect(e.faces[0].assimilableDalle).toBe(true);
    const v = migrerProjet([v1()])!.elements[0];
    expect(v.faces[0].assimilableDalle).toBe(false);
  });

  it('traduit l ancien arbre XD dans le mode qui redonne la meme classe', () => {
    const direct = migrerProjet([v1({ concerneParChlorures: true, applicationDirecteSelSurFace: true })])!;
    expect(direct.elements[0].faces[0].exposition.xd).toEqual({ actif: true, mode: 'cycles' });
    const proche = migrerProjet([
      v1({ concerneParChlorures: true, distanceChausseeSaleeM: 3, salageRoute: 'frequent' }),
    ])!;
    expect(proche.elements[0].faces[0].exposition.xd.mode).toBe('cycles');
    const procheRare = migrerProjet([
      v1({ concerneParChlorures: true, distanceChausseeSaleeM: 3, salageRoute: 'peu_frequent' }),
    ])!;
    expect(procheRare.elements[0].faces[0].exposition.xd.mode).toBe('aerosols');
    const loin = migrerProjet([v1({ concerneParChlorures: true, distanceChausseeSaleeM: 20 })])!;
    expect(loin.elements[0].faces[0].exposition.xd).toEqual({ actif: true, mode: 'aerosols' });
    const sans = migrerProjet([v1()])!;
    expect(sans.elements[0].faces[0].exposition.xd.actif).toBe(false);
  });

  it('traduit l ancien arbre XF (zone severe ou forte saturation -> forte)', () => {
    const severe = migrerProjet([v1({ zoneGel: 'severe', presenceAgentDeverglacage: true })])!;
    expect(severe.elements[0].faces[0].exposition.xf).toEqual({ actif: true, saturation: 'forte', deverglacage: true });
    const horsGel = migrerProjet([v1({ exposeAuGel: false, zoneGel: null })])!;
    expect(horsGel.elements[0].faces[0].exposition.xf.actif).toBe(false);
  });

  it('deduit la position de la face de l ambiance XC', () => {
    const int = migrerProjet([v1({ ambianceXC: 'interieur_sec' })])!;
    expect(int.elements[0].faces[0].position).toBe('interieure');
    const ent = migrerProjet([v1({ ambianceXC: 'enterree_ou_eau' })])!;
    expect(ent.elements[0].faces[0].position).toBe('contre_terre');
  });

  it('relit un objet ProjetCalcul v1 avec son en-tete', () => {
    const p = migrerProjet({ titre: 'T', referenceProjet: 'R-1', auteur: 'A', date: '2026-01-02', elements: [v1()] })!;
    expect(p.titre).toBe('T');
    expect(p.referenceProjet).toBe('R-1');
    expect(p.elements).toHaveLength(1);
  });

  it('relit un projet v2 a l identique', () => {
    const exemple = creerProjetExemple();
    const relu = migrerProjet(JSON.parse(JSON.stringify(exemple)));
    expect(relu).toEqual(exemple);
  });

  it('rejette une donnee inconnue', () => {
    expect(migrerProjet(null)).toBeNull();
    expect(migrerProjet('texte')).toBeNull();
    expect(migrerProjet({ version: 99, elements: [] })).toBeNull();
  });

  it('reprend l ancienne cle de stockage quand la nouvelle est absente', () => {
    const memoire: Record<string, string> = { [CLE_STOCKAGE_V1]: JSON.stringify([v1()]) };
    const p = chargerDepuisStockage({ getItem: (k) => memoire[k] ?? null });
    expect(p?.elements).toHaveLength(1);
    memoire[CLE_STOCKAGE] = JSON.stringify(creerProjetExemple());
    expect(chargerDepuisStockage({ getItem: (k) => memoire[k] ?? null })?.elements).toHaveLength(3);
  });
});
