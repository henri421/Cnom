/** Outils communs aux exports : nom de fichier et telechargement local. */

import type { ProjetCnom } from '../types';

/** Nom de fichier : Enrobage_<reference projet>_<date>.<extension> */
export function nomFichier(projet: Pick<ProjetCnom, 'referenceProjet' | 'date'>, extension: string): string {
  const ref =
    (projet.referenceProjet || 'projet')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'projet';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(projet.date) ? projet.date : new Date().toISOString().substring(0, 10);
  return `Enrobage_${ref}_${date}.${extension}`;
}

/** Declenche le telechargement d'un fichier genere dans le navigateur (aucun envoi reseau). */
export function telecharger(contenu: BlobPart, nom: string, type: string): void {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
