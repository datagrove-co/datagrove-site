import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://datagrove.co',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
