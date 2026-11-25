/**
 * Export Excel (.xlsx) avec ExcelJS, integre au bundle (aucun appel reseau).
 * Trois feuilles, valeurs uniquement (aucune formule) :
 *  1. Synthese au format du tableau ;
 *  2. Justification detaillee par ligne ;
 *  3. Parametres nationaux utilises.
 */

import type { Workbook, Worksheet, Borders, Fill } from 'exceljs';
import { COLONNES_SYNTHESE, LigneTableau, libelleFace, titreColonne } from '../lignes';
import { libelleType } from '../libelles';
import { parametres } from '../parametres-nationaux';
import type { ClasseEnrobage, ProjetCnom } from '../types';
import { nomFichier, telecharger } from './commun';

const GRIS_FONCE = 'FF27272A';
const GRIS_ENTETE = 'FFE4E4E7';
const GRIS_ALTERNE = 'FFF4F4F5';
const SURBRILLANCE = 'FFFEF3C7';

const fond = (argb: string): Fill => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const BORDURE: Partial<Borders> = {
  top: { style: 'thin', color: { argb: 'FFA1A1AA' } },
  left: { style: 'thin', color: { argb: 'FFA1A1AA' } },
  bottom: { style: 'thin', color: { argb: 'FFA1A1AA' } },
  right: { style: 'thin', color: { argb: 'FFA1A1AA' } },
};

function miseEnPage(ws: Worksheet, lignesRepetees?: string) {
  ws.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    printTitlesRow: lignesRepetees,
  };
  ws.headerFooter = { oddFooter: '&L&8&A&R&8Page &P / &N' };
}

function enteteProjet(ws: Worksheet, projet: ProjetCnom, titre: string, nbColonnes: number): number {
  const p = parametres(projet.jeuParametres);
  ws.mergeCells(1, 1, 1, nbColonnes);
  const t = ws.getCell(1, 1);
  t.value = `${projet.titre} : ${titre}`;
  t.font = { bold: true, size: 14, color: { argb: GRIS_FONCE } };
  const infos: [string, string][] = [
    ['Référence', projet.referenceProjet],
    ['Auteur', projet.auteur],
    ['Date', projet.date],
    ['Paramètres nationaux', `${p.libelle} (${p.source})`],
  ];
  infos.forEach(([k, v], i) => {
    const r = ws.getRow(2 + i);
    r.getCell(1).value = k;
    r.getCell(1).font = { bold: true, size: 9, color: { argb: 'FF52525B' } };
    ws.mergeCells(2 + i, 2, 2 + i, nbColonnes);
    r.getCell(2).value = v || '–';
    r.getCell(2).font = { size: 9 };
  });
  return 2 + infos.length + 1; // ligne suivante libre (une ligne vide)
}

function styleEntete(ligne: import('exceljs').Row) {
  ligne.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    c.fill = fond(GRIS_FONCE);
    c.border = BORDURE;
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  ligne.height = 30;
}

// ---------------------------------------------------------------- feuille 1

function feuilleSynthese(wb: Workbook, projet: ProjetCnom, lignes: LigneTableau[]) {
  const ws = wb.addWorksheet('Synthèse');
  const n = COLONNES_SYNTHESE.length + 1;
  const debut = enteteProjet(ws, projet, 'synthèse des enrobages', n);

  const entete = ws.getRow(debut);
  ['N°', ...COLONNES_SYNTHESE.map(titreColonne)].forEach((t, i) => (entete.getCell(i + 1).value = t));
  styleEntete(entete);
  ws.views = [{ state: 'frozen', ySplit: debut, xSplit: 0 }];

  const colCnom = COLONNES_SYNTHESE.findIndex((c) => c.cle === 'cnom') + 2;
  lignes.forEach((l, i) => {
    const r = ws.getRow(debut + 1 + i);
    r.getCell(1).value = i + 1;
    COLONNES_SYNTHESE.forEach((c, j) => (r.getCell(j + 2).value = c.valeur(l)));
    r.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.border = BORDURE;
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: col === 1 || COLONNES_SYNTHESE[col - 2]?.unite ? 'center' : 'left', wrapText: true };
      if (i % 2 === 1) cell.fill = fond(GRIS_ALTERNE);
    });
    const cnom = r.getCell(colCnom);
    cnom.font = { bold: true, size: 11 };
    cnom.fill = fond(SURBRILLANCE);
  });

  ws.getColumn(1).width = 5;
  COLONNES_SYNTHESE.forEach((c, j) => (ws.getColumn(j + 2).width = c.largeur));
  ws.getColumn(1).alignment = { horizontal: 'center' };
  miseEnPage(ws, `${debut}:${debut}`);
}

// ---------------------------------------------------------------- feuille 2

function feuilleJustification(wb: Workbook, projet: ProjetCnom, lignes: LigneTableau[]) {
  const ws = wb.addWorksheet('Justification');
  const debut = enteteProjet(ws, projet, 'justification détaillée par ligne', 3);
  const entete = ws.getRow(debut);
  ['Étape', 'Référence normative', 'Détail'].forEach((t, i) => (entete.getCell(i + 1).value = t));
  styleEntete(entete);
  ws.views = [{ state: 'frozen', ySplit: debut, xSplit: 0 }];

  let r = debut + 1;
  lignes.forEach((l, i) => {
    ws.mergeCells(r, 1, r, 3);
    const titre = ws.getCell(r, 1);
    titre.value = `${i + 1}. ${l.element.nom} : ${libelleFace(l.face)} (${libelleType(l.element)}) : cnom retenu = ${l.resultat.enrobage.cnomRetenu} mm`;
    titre.font = { bold: true, size: 11 };
    titre.fill = fond(GRIS_ENTETE);
    titre.border = BORDURE;
    r++;

    const ecrire = (etape: string, ref: string, detail: string, couleur?: string) => {
      const row = ws.getRow(r++);
      row.getCell(1).value = etape;
      row.getCell(2).value = ref;
      row.getCell(3).value = detail;
      row.eachCell({ includeEmpty: true }, (c) => {
        c.border = BORDURE;
        c.font = { size: 9, color: couleur ? { argb: couleur } : undefined };
        c.alignment = { vertical: 'top', wrapText: true };
      });
    };

    for (const etape of l.resultat.cheminement) {
      etape.lignes.forEach((texte, k) => ecrire(k === 0 ? etape.titre : '', k === 0 ? etape.reference : '', texte));
    }
    // Modificateurs detailles de la classe structurale
    for (const s of l.resultat.structurales) {
      for (const m of s.modificateurs) {
        ecrire(
          `Classe structurale ${s.classe}`,
          m.reference,
          `${m.actif ? '[x]' : '[ ]'} ${m.libelle} (${m.valeur > 0 ? '+' : ''}${m.valeur}) : ${m.explication}`
        );
      }
    }
    for (const a of l.resultat.avertissements) ecrire('Avertissement', '', a, 'FF92400E');
    r++; // ligne vide
  });

  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 34;
  ws.getColumn(3).width = 110;
  miseEnPage(ws, `${debut}:${debut}`);
}

// ---------------------------------------------------------------- feuille 3

function feuilleParametres(wb: Workbook, projet: ProjetCnom) {
  const p = parametres(projet.jeuParametres);
  const ws = wb.addWorksheet('Paramètres nationaux');
  let r = enteteProjet(ws, projet, 'paramètres nationaux utilisés', 8);

  const titreBloc = (texte: string) => {
    ws.mergeCells(r, 1, r, 8);
    const c = ws.getCell(r, 1);
    c.value = texte;
    c.font = { bold: true, size: 11 };
    c.fill = fond(GRIS_ENTETE);
    r++;
  };

  titreBloc('cmin,dur (mm) : EN 1992-1-1, 4.4.1.2(5), tableau 4.4N');
  const classes: ClasseEnrobage[] = ['X0', 'XC1', 'XC2', 'XC3', 'XC4', 'XD1', 'XD2', 'XD3'];
  const entete = ws.getRow(r++);
  ['Classe structurale', ...classes].forEach((t, i) => (entete.getCell(i + 1).value = t));
  styleEntete(entete);
  for (let s = 1; s <= 6; s++) {
    const row = ws.getRow(r++);
    row.getCell(1).value = `S${s}`;
    classes.forEach((cl, i) => (row.getCell(i + 2).value = p.cminDur[cl][s - 1]));
    row.eachCell((c) => {
      c.border = BORDURE;
      c.alignment = { horizontal: 'center' };
      if (s % 2 === 0) c.fill = fond(GRIS_ALTERNE);
    });
  }
  r++;

  titreBloc('Classe structurale : EN 1992-1-1, 4.4.1.2(5), tableau 4.3N');
  const ent2 = ws.getRow(r++);
  ['Classe d’exposition', 'Seuil de résistance (−1)'].forEach((t, i) => (ent2.getCell(i + 1).value = t));
  styleEntete(ent2);
  for (const cl of classes) {
    const row = ws.getRow(r++);
    row.getCell(1).value = cl;
    row.getCell(2).value = p.seuilResistance[cl];
    row.eachCell((c) => (c.border = BORDURE));
  }
  r++;

  titreBloc('Autres paramètres');
  const ent3 = ws.getRow(r++);
  ['Paramètre', 'Valeur', 'Unité', 'Clause'].forEach((t, i) => (ent3.getCell(i + 1).value = t));
  styleEntete(ent3);
  const autres: [string, number | string, string, string][] = [
    ['Classe structurale de base (50 ans)', `S${p.classeStructuraleBase}`, '', '4.4.1.2(5)'],
    ['Durée d’utilisation 100 ans', `+${p.majorationDuree100}`, 'classe', 'tableau 4.3N'],
    ['Classe de résistance ≥ seuil', `−${p.minorationResistance}`, 'classe', 'tableau 4.3N'],
    ['Élément assimilable à une dalle', `−${p.minorationDalle}`, 'classe', 'tableau 4.3N'],
    ['Maîtrise particulière de la qualité', `−${p.minorationQualite}`, 'classe', 'tableau 4.3N'],
    ['Δcdur,γ par défaut', p.deltaCDurGamma, 'mm', '4.4.1.2(6)'],
    ['Δcdur,st par défaut', p.deltaCDurSt, 'mm', '4.4.1.2(7)'],
    ['Δcdur,add par défaut', p.deltaCDurAdd, 'mm', '4.4.1.2(8)'],
    ['Surface irrégulière (minimum)', p.majorationSurfaceIrreguliere, 'mm', '4.4.1.2(11)'],
    ['Abrasion XM1 (k1)', p.abrasion.XM1, 'mm', '4.4.1.2(13)'],
    ['Abrasion XM2 (k2)', p.abrasion.XM2, 'mm', '4.4.1.2(13)'],
    ['Abrasion XM3 (k3)', p.abrasion.XM3, 'mm', '4.4.1.2(13)'],
    ['Δcdev standard', p.deltaCDev.standard, 'mm', '4.4.1.3(1)P'],
    ['Δcdev avec assurance qualité', `${p.deltaCDev.assuranceQualite.min} à ${p.deltaCDev.assuranceQualite.max}`, 'mm', '4.4.1.3(3)'],
    ['Δcdev avec mesure et rejet', `${p.deltaCDev.mesureRejet.min} à ${p.deltaCDev.mesureRejet.max}`, 'mm', '4.4.1.3(3)'],
    ['Contre terrain préparé (k1)', p.contreTerrain.prepare, 'mm', '4.4.1.3(4)'],
    ['Directement contre le sol (k2)', p.contreTerrain.sol, 'mm', '4.4.1.3(4)'],
  ];
  autres.forEach(([k, v, u, c], i) => {
    const row = ws.getRow(r++);
    [k, v, u, c].forEach((x, j) => (row.getCell(j + 1).value = x));
    row.eachCell((cell) => {
      cell.border = BORDURE;
      if (i % 2 === 1) cell.fill = fond(GRIS_ALTERNE);
    });
  });
  if (p.id === 'LU') {
    r++;
    ws.mergeCells(r, 1, r, 8);
    const c = ws.getCell(r, 1);
    c.value = 'Valeurs de l’ANL luxembourgeoise non vérifiées : valeurs recommandées reprises, à vérifier.';
    c.font = { italic: true, color: { argb: 'FF92400E' } };
  }

  ws.getColumn(1).width = 38;
  for (let i = 2; i <= 9; i++) ws.getColumn(i).width = 12;
  miseEnPage(ws);
}

/** Construit le classeur (separe du telechargement pour les tests). */
export async function construireClasseur(projet: ProjetCnom, lignes: LigneTableau[]): Promise<Workbook> {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = projet.auteur || 'Cnom';
  wb.created = new Date();
  feuilleSynthese(wb, projet, lignes);
  feuilleJustification(wb, projet, lignes);
  feuilleParametres(wb, projet);
  return wb;
}

export async function exporterExcel(projet: ProjetCnom, lignes: LigneTableau[]): Promise<void> {
  const wb = await construireClasseur(projet, lignes);
  const tampon = await wb.xlsx.writeBuffer();
  telecharger(
    tampon as ArrayBuffer,
    nomFichier(projet, 'xlsx'),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}
