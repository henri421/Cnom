# Calcul d'Enrobage - EC2 & ILNAS

Application web (PWA) de determination des classes d'exposition, de la categorie de beton
(DNA W.1 luxembourgeois) et du calcul de l'enrobage nominal selon EN 1992-1-1 et EN 206.

Tous les calculs sont executes dans le navigateur. Aucune donnee de projet n'est transmise
a un serveur, et l'application reste utilisable hors ligne apres la premiere visite.

## Version en ligne

Le site est publie par GitHub Pages a l'adresse https://henri421.github.io/Cnom/

## Developpement local

Prerequis : [Bun](https://bun.sh) (ou Node 20+ avec npm).

```bash
bun install
bun run dev      # serveur de developpement sur http://localhost:3000
bun run lint     # verification TypeScript
bun run build    # bundle de production dans dist/
```

Pour reproduire localement la configuration de GitHub Pages, definir le chemin de base :

```bash
BASE_PATH=/Cnom bun run build && bun run preview
```

## Deploiement

Le workflow `.github/workflows/deploy.yml` construit le projet et le publie sur GitHub Pages
a chaque push sur `main`, ainsi que manuellement depuis l'onglet Actions (`workflow_dispatch`).
La source des pages doit etre reglee sur "GitHub Actions" dans Settings > Pages ; le workflow
tente de l'activer automatiquement.

La variable `BASE_PATH` est deduite du nom du depot par l'action `configure-pages`, ce qui
permet de servir l'application aussi bien a la racine d'un domaine que dans un sous-repertoire.
