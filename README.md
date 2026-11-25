# Cnom : classes d'exposition et enrobage nominal

Application web (PWA) de projet : une ligne par face d'element, avec la classe d'exposition
(EN 206, tableau DNA W.1 de l'annexe ILNAS), la classe structurale (EN 1992-1-1, tableau 4.3N)
et l'enrobage nominal (EN 1992-1-1, 4.4.1), avec le cheminement complet de la justification.

Tous les calculs sont executes dans le navigateur. Aucune donnee de projet n'est transmise
a un serveur, et l'application reste utilisable hors ligne apres la premiere visite.

## Version en ligne

https://henri421.github.io/Cnom/

## Fonctions

- Tableau de projet : elements, faces, duplication, copie d'une face vers un autre element,
  reordonnancement, nouvelle ligne a partir de la ligne selectionnee.
- Formulaire en etapes : identification, exposition (familles XC, XD, XF, XA cumulables),
  beton (categorie DNA W.1, classe de resistance), classe structurale, enrobage, resultat.
- Parametres nationaux regroupes dans `src/parametres-nationaux.ts` : valeurs recommandees EN
  et jeu ANL Luxembourg (valeurs a verifier, signalees `A VERIFIER ANL`).
- Exports : Excel (.xlsx, trois feuilles, ExcelJS), CSV (point-virgule, UTF-8 avec BOM),
  rapport PDF par impression, sauvegarde et ouverture du projet en JSON.
- Les projets enregistres par la version 1 sont relus et migres automatiquement.

## Developpement local

Prerequis : [Bun](https://bun.sh) (ou Node 20+ avec npm).

```bash
bun install
bun run dev      # serveur de developpement sur http://localhost:3000
bun run lint     # verification TypeScript
bun run test     # tests unitaires Vitest (moteur, migration, exports)
bun run build    # bundle de production et service worker dans dist/
```

Pour reproduire localement la configuration de GitHub Pages, definir le chemin de base :

```bash
BASE_PATH=/Cnom bun run build && bun run preview
```

Sous Git Bash (Windows), prefixer par `MSYS_NO_PATHCONV=1` pour que `/Cnom` ne soit pas
converti en chemin Windows.

## Deploiement

Le workflow `.github/workflows/deploy.yml` verifie le typage, lance les tests, construit le
projet et le publie sur GitHub Pages a chaque push sur `main`, ainsi que manuellement depuis
l'onglet Actions (`workflow_dispatch`).

Prerequis unique, a effectuer une seule fois dans l'interface GitHub :
Settings > Pages > Build and deployment > Source = "GitHub Actions".
