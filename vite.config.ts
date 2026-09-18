import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

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
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
