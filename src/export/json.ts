/** Sauvegarde et chargement du projet en fichier JSON local. */

import { migrerProjet } from '../migration';
import type { ProjetCnom } from '../types';

export function genererJson(projet: ProjetCnom): string {
  return JSON.stringify(projet, null, 2);
}

/** Relit un fichier JSON (v1 ou v2) ; leve une erreur explicite si le contenu n'est pas reconnu. */
export function lireJson(texte: string): ProjetCnom {
  let brut: unknown;
  try {
    brut = JSON.parse(texte);
  } catch {
    throw new Error('Le fichier n’est pas un JSON valide.');
  }
  const projet = migrerProjet(brut);
  if (!projet) throw new Error('Le fichier ne contient pas un projet d’enrobage reconnu.');
  return projet;
}
