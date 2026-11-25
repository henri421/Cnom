import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Normalise le chemin de base : toujours encadre par des barres obliques,
// '/' lorsque le site est servi a la racine du domaine.
function normalizeBase(value: string | undefined): string {
  if (!value) return '/';
  const trimmed = value.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

export default defineConfig(() => {
  return {
    // Chemin de base du site : '/' en local, '/<nom-du-depot>/' sur GitHub Pages.
    base: normalizeBase(process.env.BASE_PATH),
    plugins: [
      react(),
      tailwindcss(),
      // Service worker genere au build : toutes les ressources du bundle (y compris
      // le module ExcelJS charge a la demande) sont mises en cache des la premiere
      // visite, ce qui rend l'application utilisable hors ligne ensuite.
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script',
        manifest: false, // public/manifest.webmanifest est conserve tel quel
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      // ExcelJS (~0,9 Mo) est isole dans un module charge a la demande.
      chunkSizeWarningLimit: 1000,
    },
  };
});
