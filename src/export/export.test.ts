import { describe, expect, it } from 'vitest';
import { calculerFace } from '../engine';
import { COLONNES_SYNTHESE, LigneTableau } from '../lignes';
import { creerProjetExemple } from '../modele';
import { nomFichier } from './commun';
import { genererCsv } from './csv';
import { construireClasseur } from './excel';
import { genererJson, lireJson } from './json';

function lignesDe(projet = creerProjetExemple()): LigneTableau[] {
  return projet.elements.flatMap((element, indexElement) =>
    element.faces.map((face, indexFace) => ({
      element,
      face,
      indexElement,
      indexFace,
      resultat: calculerFace(face, element, projet.jeuParametres),
    }))
  );
}

describe('nom de fichier', () => {
  it('Enrobage_<reference>_<date>', () => {
    expect(nomFichier({ referenceProjet: 'LUX 2026/01', date: '2026-11-25' }, 'xlsx')).toBe(
      'Enrobage_LUX-2026-01_2026-11-25.xlsx'
    );
    expect(nomFichier({ referenceProjet: '', date: '2026-01-02' }, 'csv')).toBe('Enrobage_projet_2026-01-02.csv');
  });
});

describe('CSV', () => {
  it('BOM UTF-8, point-virgule, virgule decimale', () => {
    const csv = genererCsv(lignesDe());
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const lignes = csv.substring(1).trim().split('\r\n');
    expect(lignes).toHaveLength(1 + 4);
    expect(lignes[0].split(';')).toHaveLength(COLONNES_SYNTHESE.length);
    expect(lignes[0]).toContain('cnom retenu (mm)');
  });
});

describe('JSON', () => {
  it('aller-retour sans perte', () => {
    const p = creerProjetExemple();
    expect(lireJson(genererJson(p))).toEqual(p);
  });
  it('erreur explicite sur un fichier invalide', () => {
    expect(() => lireJson('{pas du json')).toThrow(/JSON valide/);
    expect(() => lireJson('{"a":1}')).toThrow(/reconnu/);
  });
});

describe('Excel', () => {
  it('trois feuilles, valeurs uniquement, en-tete fige, A4 paysage', async () => {
    const projet = creerProjetExemple();
    const wb = await construireClasseur(projet, lignesDe(projet));
    expect(wb.worksheets.map((w) => w.name)).toEqual(['Synthèse', 'Justification', 'Paramètres nationaux']);
    for (const ws of wb.worksheets) {
      expect(ws.pageSetup.orientation).toBe('landscape');
      expect(ws.pageSetup.fitToWidth).toBe(1);
      ws.eachRow((row) =>
        row.eachCell((c) => {
          expect(c.formula).toBeFalsy();
        })
      );
    }
    const synthese = wb.getWorksheet('Synthèse')!;
    expect(synthese.views[0]).toMatchObject({ state: 'frozen' });
    // l'ecriture du fichier fonctionne
    const tampon = await wb.xlsx.writeBuffer();
    expect(tampon.byteLength).toBeGreaterThan(5000);
  });
});
