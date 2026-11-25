/**
 * Export CSV du tableau de synthese : separateur point-virgule, UTF-8 avec BOM,
 * virgule decimale (Excel francophone).
 */

import { COLONNES_SYNTHESE, LigneTableau, titreColonne } from '../lignes';

const BOM = '﻿';

function cellule(v: string | number): string {
  const texte = typeof v === 'number' ? String(v).replace('.', ',') : v;
  return /[;"\r\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

export function genererCsv(lignes: LigneTableau[]): string {
  const entete = COLONNES_SYNTHESE.map((c) => cellule(titreColonne(c))).join(';');
  const corps = lignes.map((l) => COLONNES_SYNTHESE.map((c) => cellule(c.valeur(l))).join(';'));
  return BOM + [entete, ...corps].join('\r\n') + '\r\n';
}
