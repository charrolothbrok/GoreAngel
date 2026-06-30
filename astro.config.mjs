// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],

  // Oculta la barra de herramientas de desarrollo de Astro
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel()
});